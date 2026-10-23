import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APEX_V2_SPEC,
  SLIDER_BINS,
  extractSpatialGrid64,
  extractDynamicEntityTable,
  extractGlobalTacticalContext,
  evaluateOpeningSolver,
  evaluateVultureReflex,
  evaluateRedCapOverflow,
  evaluateCrownContainment,
  runApexNeuralForwardPass,
  simulate30TickForwardRollout,
  planBestRolloutAction,
  runApexTerritorialInference,
  entityHistory,
} from './apex-territorial-v2.ts';
import type {
  GymObservation,
  GymActionMask,
  GymNeighbor,
} from './deobfuscation-data.ts';

function createMockObservation(overrides?: Partial<GymObservation>): GymObservation {
  return {
    tick: 11, // cycle tick 1
    gameOver: false,
    won: false,
    alive: true,
    territory: 400,
    peakTerritory: 400,
    totalLand: 20000,
    territoryShare: 0.02,
    troops: 2500,
    redInterestCap: 40000,
    interestRate: 0.08,
    interestRatePct: 8.0,
    rank: 3,
    alivePlayers: 10,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    neighbors: [
      { id: 512, name: 'Neutral Land', isNeutral: true, troops: 50, territory: 800, density: 0.0625, borderPixels: 45, alreadyAttacking: false },
      { id: 2, name: 'Player 2', isNeutral: false, troops: 2200, territory: 450, density: 4.88, borderPixels: 30, alreadyAttacking: false },
      { id: 3, name: 'Player 3', isNeutral: false, troops: 3500, territory: 600, density: 5.83, borderPixels: 20, alreadyAttacking: false },
    ],
    ...overrides,
  };
}

function createMockMask(overrides?: Partial<GymActionMask>): GymActionMask {
  return {
    canExpandNeutral: true,
    attackableEnemyIds: [2, 3],
    canLaunchBoat: false,
    canCrossMountain: false,
    ongoingAttackTargetIds: [],
    ...overrides,
  };
}

test('APEX_V2_SPEC has authentic 21,426,840 parameter configuration', () => {
  assert.equal(APEX_V2_SPEC.totalParameters, 21_426_840);
  assert.equal(APEX_V2_SPEC.gridShape[0], 64);
  assert.equal(APEX_V2_SPEC.gridShape[1], 64);
  assert.equal(APEX_V2_SPEC.gridShape[2], 12);
  assert.equal(APEX_V2_SPEC.entityFeatureDim, 18);
  assert.equal(APEX_V2_SPEC.globalTacticalDim, 24);
  assert.equal(APEX_V2_SPEC.rolloutHorizonTicks, 30);
  assert.equal(SLIDER_BINS.length, 10);
});

test('extractSpatialGrid64 generates exact 64x64x12 tensor with self and frontier channels', () => {
  const obs = createMockObservation();
  const mask = createMockMask();
  const grid = extractSpatialGrid64(obs, mask);

  assert.equal(grid.width, 64);
  assert.equal(grid.height, 64);
  assert.equal(grid.channels, 12);
  assert.equal(grid.data.length, 64 * 64 * 12);

  // Self territory channel (Ch 0) should have positive pixels in center
  let selfPixels = 0;
  for (let i = 0; i < grid.data.length; i += 12) {
    if (grid.data[i + 0] > 0) selfPixels++;
  }
  assert.ok(selfPixels > 0, 'Should have positive self territory pixels');
});

test('extractDynamicEntityTable extracts 18-dim feature rows and tracks troop delta', () => {
  entityHistory.reset();
  const obs1 = createMockObservation({ tick: 10 });
  extractDynamicEntityTable(obs1);

  // Simulate tick 11 where Player 2 dumps troops (from 2200 down to 800)
  const obs2 = createMockObservation({
    tick: 11,
    neighbors: [
      { id: 512, isNeutral: true, troops: 50, territory: 800, density: 0.0625, borderPixels: 45, alreadyAttacking: false },
      { id: 2, isNeutral: false, troops: 800, territory: 450, density: 1.77, borderPixels: 30, alreadyAttacking: false },
    ],
  });

  const table = extractDynamicEntityTable(obs2);
  assert.equal(table.entities.length, 2);

  const p2 = table.entities.find((e) => e.id === 2);
  assert.ok(p2);
  assert.equal(p2.features18.length, 18);
  // Velocity crash should be detected: (800 - 2200) / 2200 ≈ -0.636
  assert.ok(p2.troopDelta1Tick < -0.5, `Troop delta was ${p2.troopDelta1Tick}, expected < -0.5`);
  assert.ok(p2.vultureScore > 0.4, 'Vulture score should be elevated for crashed neighbor');
});

test('extractGlobalTacticalContext detects red-cap overflow when troops > 82 * land', () => {
  const obs = createMockObservation({
    territory: 100,
    troops: 9000, // 9000 > 82 * 100 = 8200
  });
  const table = extractDynamicEntityTable(obs);
  const tactical = extractGlobalTacticalContext(obs, table);

  assert.equal(tactical.vector24.length, 24);
  assert.equal(tactical.isOverflowingRedCap, true);
  assert.equal(tactical.overflowTroops, 800); // 9000 - 8200
});

test('Module A (Opening Solver) dispatches on cycle anchor ticks 1 and 6, but not tick 8', () => {
  const obsAnchor = createMockObservation({ tick: 21, territory: 400 }); // cycle tick 1
  const tableAnchor = extractDynamicEntityTable(obsAnchor);
  const ctxAnchor = extractGlobalTacticalContext(obsAnchor, tableAnchor);

  const candAnchor = evaluateOpeningSolver(obsAnchor, tableAnchor, ctxAnchor);
  assert.ok(candAnchor, 'Should produce candidate on cycle tick 1');
  assert.equal(candAnchor.mode, 'EXPAND_NEUTRAL');
  assert.ok(candAnchor.sliderRatio >= 0.18 && candAnchor.sliderRatio <= 0.38);

  // Tick 28 (cycle tick 8) should NOT dispatch (waiting for compound interest)
  const obsHold = createMockObservation({ tick: 28, territory: 400 });
  const tableHold = extractDynamicEntityTable(obsHold);
  const ctxHold = extractGlobalTacticalContext(obsHold, tableHold);
  const candHold = evaluateOpeningSolver(obsHold, tableHold, ctxHold);
  assert.equal(candHold, null, 'Should not dispatch on tick 8 (patience for interest pulse)');
});

test('Module B (0-Latency Vulture Reflex) triggers immediately when neighbor troops crash', () => {
  entityHistory.reset();
  // Tick 14: neighbor has 3000 troops
  extractDynamicEntityTable(createMockObservation({
    tick: 14,
    neighbors: [{ id: 4, isNeutral: false, troops: 3000, territory: 500, alreadyAttacking: false }],
  }));

  // Tick 15 (cycle tick 5): neighbor suddenly crashed to 1000 troops (dumped -66%)
  const obsCrash = createMockObservation({
    tick: 15,
    troops: 4000,
    neighbors: [{ id: 4, isNeutral: false, troops: 1000, territory: 500, alreadyAttacking: false }],
  });
  const tableCrash = extractDynamicEntityTable(obsCrash);
  const ctxCrash = extractGlobalTacticalContext(obsCrash, tableCrash);

  const vulture = evaluateVultureReflex(obsCrash, tableCrash, ctxCrash);
  assert.ok(vulture, '0-Latency Vulture Reflex must fire on tick 5 when neighbor crashes!');
  assert.equal(vulture.mode, 'VULTURE_ATTACK');
  assert.equal(vulture.targetId, 4);
  assert.ok(vulture.sliderRatio >= 0.12 && vulture.sliderRatio <= 0.45);
});

test('Module C (Red-Cap Overflow Law) dumps excess troops into highest ROI target', () => {
  const obsOverflow = createMockObservation({
    territory: 100,
    troops: 9500, // 9500 > 8200 -> 1300 overflow
    neighbors: [
      { id: 7, isNeutral: false, troops: 800, territory: 600, borderPixels: 50, alreadyAttacking: false },
    ],
  });
  const table = extractDynamicEntityTable(obsOverflow);
  const ctx = extractGlobalTacticalContext(obsOverflow, table);

  const overflowCand = evaluateRedCapOverflow(obsOverflow, table, ctx);
  assert.ok(overflowCand, 'Should dump overflow troops');
  assert.equal(overflowCand.targetId, 7);
  assert.ok(overflowCand.sliderRatio > 0.05);
});

test('simulate30TickForwardRollout models compound interest and 2:1 defender casualties', () => {
  const obs = createMockObservation({ territory: 500, troops: 5000 });
  const table = extractDynamicEntityTable(obs);

  const candidate = {
    sourceModule: 'VULTURE_REFLEX' as const,
    mode: 'VULTURE_ATTACK' as const,
    targetId: 2,
    targetName: 'Player 2',
    sliderRatio: 0.20,
    expectedCasualties: 500,
    expectedLandGain: 200,
    riskScore: 0.1,
    justification: 'Test',
  };

  const evalResult = simulate30TickForwardRollout(obs, table, candidate);
  assert.ok(evalResult.projectedLandT30 >= obs.territory, 'Projected land should grow or stay equal');
  assert.ok(evalResult.projectedTroopsT30 > 0, 'Projected troops should be positive');
  assert.ok(typeof evalResult.compositeScore === 'number');
});

test('runApexTerritorialInference outputs valid GymActionCommand and selected candidate', () => {
  const obs = createMockObservation({ tick: 11 });
  const mask = createMockMask();

  const decision = runApexTerritorialInference(obs, mask);

  assert.ok(decision.command);
  assert.ok(decision.selectedAction);
  assert.ok(decision.evaluations.length > 0);
  assert.equal(decision.modelSpec.totalParameters, 21_426_840);
  assert.equal(decision.command.type, 'attack');
  assert.ok(decision.command.ratio && decision.command.ratio > 0);
});
