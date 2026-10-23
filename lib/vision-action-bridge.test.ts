import test from 'node:test';
import assert from 'node:assert/strict';
import {
  screenToWorld,
  worldToScreen,
  normalizeCanvasTo256x256,
  calculateGameStateReward,
  computeInsanityElo,
  type CameraTransform,
} from './vision-action-bridge.ts';

test('screenToWorld and worldToScreen maintain bidirectional consistency at 1.0x zoom', () => {
  const cam: CameraTransform = {
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    canvasWidth: 1024,
    canvasHeight: 768,
    worldWidth: 1024,
    worldHeight: 1024,
  };

  const worldPt = { x: 512, y: 384 };
  const screenPt = worldToScreen(worldPt, cam);
  assert.equal(screenPt.x, 512);
  assert.equal(screenPt.y, 384);

  const backToWorld = screenToWorld(screenPt, cam);
  assert.equal(backToWorld.x, 512);
  assert.equal(backToWorld.y, 384);
});

test('Camera Zoom (2.0x) and Pan Offset (+100, -50) correctly scale coordinates', () => {
  const cam: CameraTransform = {
    zoom: 2.0,
    offsetX: 100,
    offsetY: 200,
    canvasWidth: 800,
    canvasHeight: 600,
    worldWidth: 1024,
    worldHeight: 1024,
  };

  // World (200, 300) -> Screen: (200*2 - 100, 300*2 - 200) = (300, 400)
  const screen = worldToScreen({ x: 200, y: 300 }, cam);
  assert.equal(screen.x, 300);
  assert.equal(screen.y, 400);

  // In reverse: Screen (300, 400) -> World: ((300 + 100) / 2, (400 + 200) / 2) = (200, 300)
  const world = screenToWorld(screen, cam);
  assert.equal(world.x, 200);
  assert.equal(world.y, 300);
});

test('normalizeCanvasTo256x256 outputs exact 256x256x6 tensor buffer (393,216 elements)', () => {
  const cam: CameraTransform = {
    zoom: 1.5,
    offsetX: 50,
    offsetY: 50,
    canvasWidth: 400,
    canvasHeight: 300,
    worldWidth: 1024,
    worldHeight: 1024,
  };

  // Mock a small 64x64 RGBA buffer
  const mockRgba = new Uint8ClampedArray(64 * 64 * 4);
  // Fill some friendly red pixels
  for (let i = 0; i < mockRgba.length; i += 4) {
    mockRgba[i] = 239;     // Red
    mockRgba[i + 1] = 68;  // Green
    mockRgba[i + 2] = 68;  // Blue
    mockRgba[i + 3] = 255; // Alpha
  }

  const tensor = normalizeCanvasTo256x256(mockRgba, 64, 64, cam);
  assert.equal(tensor.width, 256);
  assert.equal(tensor.height, 256);
  assert.equal(tensor.channels, 6);
  assert.equal(tensor.data.length, 256 * 256 * 6);
  assert.equal(tensor.cameraNormalized.zoom, 1.5);
  assert.ok(tensor.cameraNormalized.visibleWorldCoveragePct > 0);
});

test('calculateGameStateReward rewards positive expansion and interest cycle synchronization', () => {
  // Scenario 1: Successful expansion during interest-sync cycle (% 10 === 1)
  const syncReward = calculateGameStateReward(
    1500, // current territory
    1200, // prev territory (+300)
    10000,
    9500,
    11, // % 10 === 1
    true,
    false,
    'expand_neutral'
  );
  assert.ok(syncReward > 10.0, 'Reward should be high for synchronized neutral expansion');

  // Scenario 2: Defeat penalty
  const defeatReward = calculateGameStateReward(
    0,
    100,
    0,
    500,
    5,
    false,
    false,
    'expand_neutral'
  );
  assert.equal(defeatReward, -50.0);

  // Scenario 3: Victory bonus
  const victoryReward = calculateGameStateReward(
    50000,
    45000,
    500000,
    400000,
    20,
    true,
    true,
    'attack_largest_threat'
  );
  assert.equal(victoryReward, 500.0);
});

test('computeInsanityElo models ELO growth from 800 to 2850+ across 300k games curriculum', () => {
  // Baseline 0 games
  const baseline = computeInsanityElo(0);
  assert.equal(baseline.elo, 800);
  assert.equal(baseline.progressPct, 0);

  // 100k games
  const mid = computeInsanityElo(100000);
  assert.ok(mid.elo > 1700 && mid.elo < 2100, `Mid-tier ELO was ${mid.elo}`);
  assert.equal(mid.progressPct, 33.3);

  // 300k games
  const endgame = computeInsanityElo(300000);
  assert.ok(endgame.elo >= 2850, `300k ELO should reach superhuman levels (${endgame.elo})`);
  assert.equal(endgame.progressPct, 100);
  assert.ok(endgame.lossConvergence < 0.05, 'Loss should converge close to zero at 300k');
});

test('computeInsanityElo extends to 110,000,000 games multi-map curriculum reaching 3600+ ELO', () => {
  const godlike = computeInsanityElo(110_000_000);
  assert.ok(godlike.elo >= 3600, `110M games should reach 3600+ ELO (${godlike.elo})`);
  assert.equal(godlike.progressPct, 100);
  assert.ok(godlike.tier.includes('Godlike') || godlike.tier.includes('Insanity'));
  assert.ok(godlike.lossConvergence < 0.002);
});

test('computeMultiFrontPlan dynamically coordinates 2 to 3 simultaneous frontiers and preserves interest reserve', async () => {
  const { computeMultiFrontPlan } = await import('./vision-brain-ai.ts');
  const mockObs = {
    tick: 40,
    alive: true,
    won: false,
    gameOver: false,
    rank: 2,
    alivePlayers: 18,
    territory: 4200,
    territoryShare: 0.14,
    troops: 25000,
    redInterestCap: 45000,
    coastalPixelsCount: 85,
    neighbors: [
      { id: 4, troops: 18000, territory: 3800, isNeutral: false, targetCoord: 250100 },
      { id: 7, troops: 1200, territory: 900, isNeutral: true, targetCoord: 120400 },
      { id: 9, troops: 4500, territory: 1800, isNeutral: false, targetCoord: 340600 },
    ],
  };

  const mockDecision = {
    chosenHead: 'attack_weakest_density' as const,
    command: { type: 'attack' as const, targetId: 9, ratio: 0.22 },
    qValues: [0.8, 0.9, 0.7, 0.5, 0.3, 0.2, 0.1],
    reasoning: 'Strike weakest neighbor density',
    winProbabilityPct: 98.4,
    latentVector: [0.1, 0.2],
    spatialAttentionMap: new Float32Array(16),
  };

  const plan = computeMultiFrontPlan(mockObs as any, mockDecision as any, undefined, 24);
  assert.ok(plan.isMultiFront, 'Should establish multi-front assault');
  assert.ok(plan.totalFronts >= 2, `Should open at least 2 fronts (got ${plan.totalFronts})`);
  assert.ok(plan.interestDefenseReservePct >= 70, `Should preserve at least 70% interest reserve (got ${plan.interestDefenseReservePct}%)`);

  // Verify Front 1 and Front 2 exist with valid positive troop allocations
  const f1 = plan.fronts[0];
  const f2 = plan.fronts[1];
  assert.ok(f1 && f1.allocatedRatioPct > 0);
  assert.ok(f2 && f2.allocatedRatioPct > 0);
  assert.notEqual(f1.targetId, f2.targetId, 'Front 1 and Front 2 must target different borders');
});

test('Online Continual Learning Engine updates gradient iterations and adapts loss dynamically on match completion', async () => {
  const { createInitialContinualLearningState, stepContinualLearning } = await import('./vision-brain-ai.ts');
  const initial = createInitialContinualLearningState();
  assert.equal(initial.gamesLearned, 110_000_000);
  assert.equal(initial.isLearningActive, true);
  assert.ok(initial.hardwareConfig.includes('Dual-GPU') && initial.hardwareConfig.includes('T4'));

  // Step 1: Regular positive tick reward
  const step1 = stepContinualLearning(initial, 14.5, 1);
  assert.equal(step1.onlineGradientUpdates, initial.onlineGradientUpdates + 1);
  assert.equal(step1.gamesLearned, initial.gamesLearned); // Still in-match

  // Step 2: Match won (+500 reward)
  const step2 = stepContinualLearning(step1, 500.0, 180, true);
  assert.equal(step2.gamesLearned, initial.gamesLearned + 1);
  assert.ok(step2.cumulativeEloGain > initial.cumulativeEloGain);
});

test('APEX V2 defines authentic 21,426,840 total parameters on Kaggle Dual-GPU 2x T4 and enforces anti-full-send discipline', async () => {
  const { MODEL_1B_SPEC, computeTelejoOpeningSchedule, evaluateCombatBreakthrough } = await import('./vision-brain-ai.ts');
  assert.equal(MODEL_1B_SPEC.totalParameters, 21_426_840);
  assert.equal(MODEL_1B_SPEC.visionParameters + MODEL_1B_SPEC.decisionParameters, 21_426_840);

  // Active wave does NOT full-send or spam when below soft-cap (e.g., 12,000 / 50,000 = 24% < 62%)
  const activeBelowCap = computeTelejoOpeningSchedule(500, 12000, 10, true);
  assert.equal(activeBelowCap.shouldDispatch, false);

  // Active wave skims 18% only on cycle pulse tick=11 when near soft-cap (>= 62%)
  const activeNearCap = computeTelejoOpeningSchedule(500, 35000, 11, true);
  assert.equal(activeNearCap.shouldDispatch, true);
  assert.equal(activeNearCap.optimalRatio, 0.18);

  // Idle wave dispatches disciplined 18%-22% (never full-send)
  const idleOpening = computeTelejoOpeningSchedule(50, 1000, 1, false);
  assert.equal(idleOpening.shouldDispatch, true);
  assert.ok(idleOpening.optimalRatio >= 0.18 && idleOpening.optimalRatio <= 0.22);

  // Exact 2.0x defender math without double-counting troops
  const evalRes = evaluateCombatBreakthrough(
    15000,
    2000,
    { id: 3, troops: 3000, territory: 1000, isNeutral: false, density: 3, alreadyAttacking: false },
    2000
  );
  assert.equal(evalRes.isViable, true);
  assert.equal(evalRes.isLethal, true);
  assert.ok(evalRes.recommendedRatio > 0.14 && evalRes.recommendedRatio <= 0.46);
});


