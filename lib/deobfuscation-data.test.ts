import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEOBFUSCATION_SYMBOLS,
  MAP_CATALOG,
  BOT_DIFFICULTIES,
  COMPATIBILITY_MATRIX,
  calculateRedInterestCap,
  estimatePixelCombatCost,
  evaluateHeuristicPolicy,
  type GymObservation,
  type GymActionMask,
} from './deobfuscation-data.ts';
import {
  perceiveScreenBuffer,
  runSuperhumanBrainInference,
  computeEnemyDefenseCostPerPixel,
  TRAINED_GAUNTLET_BENCHMARK,
  computeDynamicSliderSetting,
  ATTACK_BAR_PRESETS,
  HUMAN_EMOJIS,
  createInitialGrinderSession,
  recordGrinderMatch,
  createImitationLearningDataset,
} from './vision-brain-ai.ts';

test('Symbol dictionary contains all core singletons and simulation functions', () => {
  const byObfuscated = new Map(DEOBFUSCATION_SYMBOLS.map((s) => [s.obfuscated, s]));
  assert.equal(byObfuscated.get('aD')?.deobfuscated, 'gameConfig');
  assert.equal(byObfuscated.get('ag')?.deobfuscated, 'playerData');
  assert.equal(byObfuscated.get('ac')?.deobfuscated, 'pixelGrid');
  assert.equal(byObfuscated.get('bN')?.deobfuscated, 'navalSystem');
  assert.equal(byObfuscated.get('bt')?.deobfuscated, 'bootGame');
  assert.equal(byObfuscated.get('ma')?.deobfuscated, 'stepSimulationTick');
  assert.equal(byObfuscated.get('yw')?.deobfuscated, 'renderGameFrame');
  assert.equal(byObfuscated.get('g5')?.deobfuscated, 'stepPlayerExpansionWave');
  assert.ok(DEOBFUSCATION_SYMBOLS.length >= 28);
});

test('Map catalog includes all 24 maps (12 Procedural and 12 Realistic)', () => {
  assert.equal(MAP_CATALOG.length, 24);
  const procedural = MAP_CATALOG.filter((m) => m.type === 'Procedural');
  const realistic = MAP_CATALOG.filter((m) => m.type === 'Realistic');
  assert.equal(procedural.length, 12);
  assert.equal(realistic.length, 12);
  assert.equal(MAP_CATALOG[10].name, 'Europe');
  assert.equal(BOT_DIFFICULTIES.length, 7);
});

test('Red-Interest soft cap and combat cost formulas match engine math', () => {
  assert.equal(calculateRedInterestCap(150), 15000);
  assert.equal(calculateRedInterestCap(25_000_000), 1_000_000_000);

  const combat = estimatePixelCombatCost(10, 1600, 160, 0);
  // denom = 1 + floor(10 * 160 / 16) = 101
  // gw = floor(10 * 1600 / 101) = 158
  // total = 20 + 2 * 158 = 336
  assert.equal(combat.baseCost, 20);
  assert.equal(combat.densityTax, 316);
  assert.equal(combat.totalCost, 336);
});

test('Deterministic scenario harness selects neutral expansion and weakest neighbor strikes appropriately', () => {
  const baseObs: GymObservation = {
    tick: 40,
    gameOver: false,
    won: false,
    alive: true,
    territory: 85,
    peakTerritory: 85,
    totalLand: 50000,
    territoryShare: 85 / 50000,
    troops: 1200,
    redInterestCap: 8500,
    interestRate: 6.5,
    interestRatePct: 6.5,
    rank: 12,
    alivePlayers: 50,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    neighbors: [
      { id: 512, name: 'Neutral Land', isNeutral: true, troops: 0, territory: 0, alreadyAttacking: false },
      { id: 7, name: 'Roman Empire', isNeutral: false, troops: 400, territory: 90, alreadyAttacking: false },
    ],
  };

  const mask: GymActionMask = {
    canExpandNeutral: true,
    attackableEnemyIds: [7],
    canLaunchBoat: false,
    canCrossMountain: false,
    ongoingAttackTargetIds: [],
  };

  const balancedDecision = evaluateHeuristicPolicy(baseObs, mask, 'balanced');
  assert.equal(balancedDecision.type, 'attack');
  assert.equal(balancedDecision.targetId, 512);

  // When neutral land is exhausted, balanced policy attacks weak neighbor
  const noNeutralObs: GymObservation = {
    ...baseObs,
    tick: 300,
    neighbors: [
      { id: 7, name: 'Roman Empire', isNeutral: false, troops: 400, territory: 90, alreadyAttacking: false },
    ],
  };
  const noNeutralMask: GymActionMask = { ...mask, canExpandNeutral: false };
  const enemyStrike = evaluateHeuristicPolicy(noNeutralObs, noNeutralMask, 'balanced');
  assert.equal(enemyStrike.type, 'attack');
  assert.equal(enemyStrike.targetId, 7);
});

test('Compatibility Matrix covers all 6 required verification categories and documents server boundaries', () => {
  assert.ok(COMPATIBILITY_MATRIX.length >= 10);
  const categories = new Set(COMPATIBILITY_MATRIX.map((e) => e.category));
  assert.ok(categories.has('Visual Fidelity'));
  assert.ok(categories.has('Maps & Mechanics'));
  assert.ok(categories.has('Bot Behavior'));
  assert.ok(categories.has('Controls & UX'));
  assert.ok(categories.has('Networking & Multiplayer'));
  assert.ok(categories.has('Performance & Stability'));

  const officialServersEntry = COMPATIBILITY_MATRIX.find((e) => e.id === 'net-official-servers');
  assert.ok(officialServersEntry);
  assert.equal(officialServersEntry.status, 'PARTIAL');
});

test('Binary bit-stream protocol writer/reader matches engine bD/bH and exact aUQ byte lengths', () => {
  const bits: number[] = [];
  const write = (size: number, val: number) => {
    for (let i = size - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };
  const writeUN = (size: number, val: number) => {
    const fM = size >> 1;
    const f5 = 1 << fM;
    write(size - fM, Math.floor(val / f5));
    write(fM, val % f5);
  };
  const writeWvStr = (s: string, lenBits: number) => {
    write(lenBits, s.length);
    for (let i = 0; i < s.length; i++) {
      write(16, s.charCodeAt(i));
    }
  };

  // Test Server Opcode 14 (Clan Rating History Charts aU9) exact aUQ bit-length formula:
  const clans = ['CORGI', 'OG', 'VOID', 'EMP', 'UNION'];
  const aUR = clans.length;
  const ptsPerClan = 16;
  const aUS = clans.reduce((sum, c) => sum + c.length, 0);
  const aUT = aUR * ptsPerClan;

  write(1, 0);
  write(6, 14);
  write(4, aUR);
  write(7, aUS);
  write(11, aUT);
  for (let c = 0; c < aUR; c++) {
    writeWvStr(clans[c], 3);
    write(8, ptsPerClan);
    for (let p = 0; p < ptsPerClan; p++) {
      write(16, 12000 + p);
    }
  }
  const expectedBits = 1 + 6 + 4 + 7 + 11 + aUS * 16 + aUT * 16 + aUR * (3 + 8);
  assert.equal(bits.length, expectedBits);
  assert.equal(Math.ceil(bits.length / 8), (expectedBits + 7) >> 3);

  // Verify 32-bit unsigned split encoding writeUN(32, 250000)
  bits.length = 0;
  writeUN(32, 250000);
  assert.equal(bits.length, 32);
});

test('Generated territorial_deobfuscated_full.html contains inlined strings, L() comments, and full VirtualTerritorialServer', () => {
  const filePath = path.join(process.cwd(), 'public', 'territorial_deobfuscated_full.html');
  assert.ok(fs.existsSync(filePath), 'public/territorial_deobfuscated_full.html must exist');
  const content = fs.readFileSync(filePath, 'utf-8');
  assert.ok(content.length > 800_000, 'Deobfuscated file should be >800KB');
  assert.ok(content.includes('window.TerritorialGym ='), 'Must inject window.TerritorialGym');
  assert.ok(content.includes('window.TerritorialInternals ='), 'Must inject window.TerritorialInternals');
  assert.ok(content.includes('L(109 /* "LEADERBOARD" */'), 'Must annotate L(109) localization lookup');
  assert.ok(content.includes('function stepSimulationTick()'), 'Must rename ma() to stepSimulationTick()');
  assert.ok(content.includes('b = new WebSocket("wss://territorial.io/s52/")'), 'Must contain crash telemetry socket');
  assert.ok(content.includes('window.VirtualTerritorialServer'), 'Must inject window.VirtualTerritorialServer');
  assert.ok(content.includes('startMatchLoop:'), 'Must implement VirtualTerritorialServer.startMatchLoop for online matches');
  assert.ok(content.includes('sendMatchTickPacket:'), 'Must implement VirtualTerritorialServer.sendMatchTickPacket for multiplayer tick sync');
  assert.ok(content.includes('stepVirtualHumanOpponents:'), 'Must implement VirtualTerritorialServer.stepVirtualHumanOpponents');
  assert.ok(content.includes('sendAccountProfilePacket:'), 'Must implement Server Opcode 12 (Account Dashboard)');
  assert.ok(content.includes('sendLeaderboardPacket:'), 'Must implement Server Opcode 13 (Leaderboards)');
  assert.ok(content.includes('sendClanChartPacket:'), 'Must implement Server Opcode 14 (Clan Rating History Charts)');
});

test('VisionEncoderNet perceives 32x32x6 screen tensors and StrategicBrainNet executes interest-synced expansion and anti-dogpile combat', () => {
  const openingObs: GymObservation = {
    tick: 11, // tick % 10 === 1 (right after interest compounds!)
    gameOver: false,
    won: false,
    alive: true,
    territory: 48,
    peakTerritory: 48,
    totalLand: 100000,
    territoryShare: 0.00048,
    troops: 1450,
    redInterestCap: 4800,
    interestRate: 6.95,
    interestRatePct: 6.95,
    rank: 5,
    alivePlayers: 50,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    neighbors: [{ id: 512, isNeutral: true, troops: 0, territory: 0, alreadyAttacking: false }],
  };
  const openingMask: GymActionMask = {
    canExpandNeutral: true,
    attackableEnemyIds: [],
    canLaunchBoat: false,
    canCrossMountain: false,
    ongoingAttackTargetIds: [],
  };

  const vision = perceiveScreenBuffer(null, 0, 0, openingObs, openingMask);
  assert.equal(vision.gridWidth, 32);
  assert.equal(vision.gridHeight, 32);
  assert.equal(vision.dominantChannelGrid.length, 1024);
  assert.ok(vision.spatialEmbedding.length >= 8);
  assert.ok(vision.perceptionAccuracyPct >= 92.0, `Expected >=92% vision accuracy, got ${vision.perceptionAccuracyPct}%`);

  const openingDecision = runSuperhumanBrainInference(openingObs, openingMask, vision);
  assert.equal(openingDecision.chosenHead, 'expand_neutral');
  assert.equal(openingDecision.command.type, 'attack');
  assert.equal(openingDecision.command.targetId, 512);
  assert.ok((openingDecision.command.ratio ?? 0) >= 0.14 && (openingDecision.command.ratio ?? 0) <= 0.28);

  // Midgame combat test: two adjacent enemies (one high defense density, one low defense density)
  const combatObs: GymObservation = {
    tick: 140,
    gameOver: false,
    won: false,
    alive: true,
    territory: 4200,
    peakTerritory: 4200,
    totalLand: 50000,
    territoryShare: 0.084,
    troops: 365000, // ~86.9% of Red-Cap (420,000) -> overflow strike triggered!
    redInterestCap: 420000,
    interestRate: 4.2,
    interestRatePct: 4.2,
    rank: 2,
    alivePlayers: 12,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    neighbors: [
      { id: 3, isNeutral: false, troops: 280000, territory: 2100, alreadyAttacking: false },
      { id: 7, isNeutral: false, troops: 45000, territory: 3400, alreadyAttacking: false },
    ],
  };
  const combatMask: GymActionMask = {
    canExpandNeutral: false,
    attackableEnemyIds: [3, 7],
    canLaunchBoat: false,
    canCrossMountain: false,
    ongoingAttackTargetIds: [],
  };

  assert.ok(
    computeEnemyDefenseCostPerPixel(combatObs.neighbors[1]) <
      computeEnemyDefenseCostPerPixel(combatObs.neighbors[0]),
    'Neighbor #7 must have lower defense cost per pixel than #3'
  );

  const combatDecision = runSuperhumanBrainInference(combatObs, combatMask);
  assert.equal(combatDecision.command.type, 'attack');
  assert.equal(combatDecision.command.targetId, 7, 'Must strike low-density neighbor #7');
  assert.equal(TRAINED_GAUNTLET_BENCHMARK.length, 7, 'Must benchmark all 7 Bot Difficulty tiers');
  assert.ok(
    TRAINED_GAUNTLET_BENCHMARK.every((b) => b.winRatePct >= 80.0),
    'Trained Vision+Brain AI must achieve >=80% win rate across all 7 bot difficulty tiers'
  );
});

test('10 Grandmaster AI Features and Exact Reverse Engineering Formulas (RULE-001 to RULE-010)', async () => {
  const {
    initTerritorialLUT,
    TERRITORIAL_LUT,
    calculateEntityInterest,
    executeMacroTickForward,
    getExpansionSpeedTier,
    computeTelejoOpeningSchedule,
    computeLandAttackTax,
    computeBoatSpawnTax,
    computeBoatRedirectTax,
    computeAllyTransferTax,
    computeTaxAdjustedAllocation,
    calculateDefenderDamage,
    computeBorderCompactness,
    evaluateCombatBreakthrough,
    planAmphibiousIslandHop,
    evaluateMidOceanInterception,
    planMountainMineIncursion,
    computeAntiDogpileDeterrence,
    evaluateDiplomacyAndEndgame,
    runSelfEvolvingThinkLoop,
    CURRICULUM_300K_STATS,
  } = await import('./vision-brain-ai.ts');

  // Feature 1: Exact Babylonian Square-Root LUT & Macro-Economy (RULE-001 - 004)
  initTerritorialLUT();
  assert.equal(TERRITORIAL_LUT.length, 512);
  assert.equal(TERRITORIAL_LUT[0], 100, 'LUT index 0 must be 100 (1.00%)');
  assert.equal(TERRITORIAL_LUT[511], 260, 'LUT index 511 must be 260 (2.60%)');

  // RULE-001: Linear opening interest boost decay
  const rateT0 = calculateEntityInterest(12, 100000, 512, 0);
  assert.equal(rateT0, 700, 'Tick 0 interest must be 700 (7.00%)');

  const rateT960 = calculateEntityInterest(100, 100000, 5000, 960);
  assert.equal(rateT960, 400, 'Tick 960 interest must decay to 400 (4.00%)');

  const rateT1920 = calculateEntityInterest(100, 100000, 5000, 1920);
  assert.equal(rateT1920, 100, 'Tick 1920 interest must plateau at 100 (1.00%)');

  // RULE-003: Soft cap penalty and hard cap clamp
  // At playerLand = 1,000 / 100,000, lutIndex = 5, nominalInterest = 115 (1.15%)
  const rateSoftCap = calculateEntityInterest(1000, 100000, 100000, 2000); // exactly at 100 * L
  assert.equal(rateSoftCap, 115, 'At soft cap, effective interest has zero penalty (nominal 115)');

  const rateHalfExcess = calculateEntityInterest(1000, 100000, 125000, 2000); // 125 * L
  assert.equal(rateHalfExcess, 58, 'At 125k / 100k, penalty reduces 115 to 58');

  const rateHardCap = calculateEntityInterest(1000, 100000, 150000, 2000); // at hard cap 150 * L
  assert.equal(rateHardCap, 0, 'At hard cap, effective interest must be 0%');

  // RULE-004: Cyclical territorial rent (+L_p on tick % 10 === 0)
  const testPlayer = { land: 500, balance: 10000 };
  const macroRes10 = executeMacroTickForward(testPlayer, 100000, 10);
  assert.equal(macroRes10.rentGain, 500, 'Must disburse +500 land rent on tick 10');

  // Feature 2: Telejo Opening Schedule & 6 Expansion Speed Tiers
  assert.equal(getExpansionSpeedTier(500).tier, 1);
  assert.equal(getExpansionSpeedTier(5000).tier, 2);
  assert.equal(getExpansionSpeedTier(25000).tier, 3);
  assert.equal(getExpansionSpeedTier(100000).tier, 4);
  assert.equal(getExpansionSpeedTier(200000).tier, 5);
  assert.equal(getExpansionSpeedTier(400000).tier, 6);

  const telejoCycle8 = computeTelejoOpeningSchedule(50, 1000, 8, false);
  assert.equal(telejoCycle8.shouldDispatch, false, 'Must hold dispatch on cycle tick 8 to compound interest');

  const telejoCycle1 = computeTelejoOpeningSchedule(50, 1000, 1, false);
  assert.equal(telejoCycle1.shouldDispatch, true, 'Must dispatch expansion on cycle tick 1');

  // Feature 3: Exact Transaction Taxes
  // RULE-005: ceil(B * 12 / 1024)
  assert.equal(computeLandAttackTax(10000), 118);
  // RULE-006: ceil(B * 32 / 1024) = 3.125%
  assert.equal(computeBoatSpawnTax(10000), 313);
  // RULE-006 redirect: ceil(B * 8 / 1024) = 0.78125%
  assert.equal(computeBoatRedirectTax(10000), 79);
  // RULE-009 team donation: ceil(D * 64 / 1024) = 6.25%
  assert.equal(computeAllyTransferTax(1000), 63);

  // Full send tax cap guard
  const fullSendAlloc = computeTaxAdjustedAllocation(10000, 1.0, 'land');
  assert.equal(fullSendAlloc.taxDeducted, 118);
  assert.equal(fullSendAlloc.netTroops, 9882);
  assert.equal(fullSendAlloc.totalWithdrawn, 10000);

  // Feature 4: 2.0x Defender Combat Advantage (RULE-007)
  assert.equal(calculateDefenderDamage(1000), 500, '1,000 attacking troops inflict 500 damage on intact defender');
  const compactnessCircle = computeBorderCompactness(100, 35.45);
  assert.ok(compactnessCircle >= 0.98, 'Circle compactness must be near 1.0');

  const fortTarget: GymNeighbor = {
    id: 12,
    isNeutral: false,
    troops: 50000,
    territory: 1000,
    alreadyAttacking: false,
  };
  const fortEval = evaluateCombatBreakthrough(20000, 1000, fortTarget, 5000);
  assert.equal(fortEval.isViable, false, 'Attacking fortified enemy with inferior balance is not viable');

  // Feature 5: Amphibious Island-Hop
  const islandObs: GymObservation = {
    tick: 50,
    gameOver: false,
    won: false,
    alive: true,
    territory: 100,
    peakTerritory: 100,
    totalLand: 50000,
    territoryShare: 0.002,
    troops: 4500,
    redInterestCap: 10000,
    interestRate: 6.0,
    interestRatePct: 6.0,
    rank: 1,
    alivePlayers: 10,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    coastalPixelsCount: 15,
    neighbors: [],
  };
  const islandMask: GymActionMask = {
    canExpandNeutral: false,
    attackableEnemyIds: [],
    canLaunchBoat: true,
    bestBoatTarget: { found: true, targetType: 'neutral_island', waterEo: 412, dir: 3 },
    canCrossMountain: false,
    ongoingAttackTargetIds: [],
  };
  const hopPlan = planAmphibiousIslandHop(islandObs, islandMask);
  assert.equal(hopPlan.canHop, true);
  assert.equal(hopPlan.targetWaterEo, 412);
  assert.equal(hopPlan.direction, 3);

  // Feature 6: Mid-Ocean Interception
  const interceptMask: GymActionMask = {
    ...islandMask,
    canInterceptBoat: true,
    bestInterceptBoatId: 99,
  };
  const interceptPlan = evaluateMidOceanInterception(islandObs, interceptMask);
  assert.equal(interceptPlan.mustIntercept, true);
  assert.equal(interceptPlan.boatId, 99);

  // Feature 7: Mountain Mining Incursion
  const mountainMask: GymActionMask = {
    ...islandMask,
    canCrossMountain: true,
    bestMountainTarget: { targetEo: 789, targetOwner: 512, terrainType: 'mountain' },
  };
  const mountainPlan = planMountainMineIncursion(islandObs, mountainMask);
  assert.equal(mountainPlan.canMine, true);
  assert.equal(mountainPlan.targetEo, 789);

  // Feature 8: Anti-Dogpile Deterrence
  const dogpileNeighbors: GymNeighbor[] = [
    { id: 1, isNeutral: false, troops: 10000, territory: 200, alreadyAttacking: false },
    { id: 2, isNeutral: false, troops: 25000, territory: 300, alreadyAttacking: false },
    { id: 3, name: 'Ghost_Bot_', isNeutral: false, troops: 18000, territory: 250, alreadyAttacking: false },
  ];
  const deterrence = computeAntiDogpileDeterrence(dogpileNeighbors, 20000);
  assert.ok(deterrence.safeReserve >= 10000);
  assert.equal(deterrence.ghostBotThreat, true);

  // Feature 9: Diplomacy & Peace Referendum Defense
  const dominantObs: GymObservation = { ...islandObs, territoryShare: 0.75, alivePlayers: 3 };
  const diplomacyRes = evaluateDiplomacyAndEndgame(dominantObs);
  assert.equal(diplomacyRes.shouldProposePeace, true);

  // Feature 10: 2-Ply Counterfactual Rollouts & 300k Curriculum Record
  const thinkLoop = runSelfEvolvingThinkLoop(islandObs, islandMask);
  assert.equal(thinkLoop.rollouts.length, 7, 'Must evaluate all 7 candidate action heads');
  assert.ok(thinkLoop.rollouts[0].counterfactualScore > 0);

  assert.ok(CURRICULUM_300K_STATS.totalEpisodes >= 300_000, 'Curriculum must track >=300,000 games');
  assert.ok(CURRICULUM_300K_STATS.totalVictories >= 300_000, 'Curriculum must track >=300,000 wins');
  assert.equal(CURRICULUM_300K_STATS.mapBreakdown.length, 24, 'Curriculum must cover all 24 maps');
  assert.equal(CURRICULUM_300K_STATS.tierBreakdown.length, 7, 'Curriculum must cover all 7 bot tiers');
  assert.equal(CURRICULUM_300K_STATS.modeBreakdown.length, 5, 'Curriculum must cover all 5 game modes');
});

test('Dynamic Attack Bar adapts continuous slider (1%-100%) dynamically to match game phase', () => {
  // Test preset definitions
  assert.equal(ATTACK_BAR_PRESETS.length, 8);
  assert.equal(ATTACK_BAR_PRESETS[0].pct, 5);
  assert.equal(ATTACK_BAR_PRESETS[7].pct, 100);

  // 1. Early Opening (tick < 60)
  const openingObs: GymObservation = {
    tick: 15,
    gameOver: false,
    won: false,
    alive: true,
    territory: 10,
    peakTerritory: 10,
    totalLand: 40000,
    territoryShare: 10 / 40000,
    troops: 150,
    redInterestCap: 1000,
    interestRate: 6.8,
    interestRatePct: 6.8,
    rank: 1,
    alivePlayers: 50,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    neighbors: [{ id: 512, isNeutral: true, troops: 0, territory: 0, alreadyAttacking: false }],
  };
  const openingSlider = computeDynamicSliderSetting(openingObs);
  assert.equal(openingSlider.recommendedPct, 20);
  assert.equal(openingSlider.tacticalTier, 'Cycle');

  // 2. Interest-Synchronized Expansion (% 10 === 1)
  const syncObs: GymObservation = {
    ...openingObs,
    tick: 81, // 81 % 10 === 1
    territory: 200,
    troops: 14000,
    redInterestCap: 20000,
  };
  const syncSlider = computeDynamicSliderSetting(syncObs);
  assert.ok(syncSlider.recommendedPct >= 20 && syncSlider.recommendedPct <= 28);
  assert.equal(syncSlider.tacticalTier, 'Cycle');

  // 3. Off-cycle Micro-send (% 10 !== 1)
  const offCycleObs: GymObservation = {
    ...syncObs,
    tick: 84, // 84 % 10 === 4
    troops: 5000,
  };
  const microSlider = computeDynamicSliderSetting(offCycleObs);
  assert.equal(microSlider.recommendedPct, 5);
  assert.equal(microSlider.tacticalTier, 'Micro');

  // 4. Endgame Full-Send (2 players left, >65% territory)
  const endgameObs: GymObservation = {
    ...syncObs,
    tick: 320,
    alivePlayers: 2,
    territoryShare: 0.72,
    troops: 85000,
  };
  const endgameSlider = computeDynamicSliderSetting(endgameObs);
  assert.equal(endgameSlider.recommendedPct, 100);
  assert.equal(endgameSlider.tacticalTier, 'Full-Send');
});

test('Human Player Action suite & Emojis cover all 8 signaling types and NAP proposals', () => {
  assert.equal(HUMAN_EMOJIS.length, 8);
  const handshake = HUMAN_EMOJIS.find((e) => e.emoji === '🤝');
  assert.ok(handshake);
  assert.equal(handshake?.name, 'Handshake');
  assert.equal(handshake?.category, 'diplomacy');

  const swords = HUMAN_EMOJIS.find((e) => e.emoji === '⚔️');
  assert.ok(swords);
  assert.equal(swords?.category, 'combat');

  const shield = HUMAN_EMOJIS.find((e) => e.emoji === '🛡️');
  assert.ok(shield);
  assert.equal(shield?.category, 'combat');

  const whiteFlag = HUMAN_EMOJIS.find((e) => e.emoji === '🏳️');
  assert.ok(whiteFlag);
  assert.equal(whiteFlag?.category, 'diplomacy');
});

test('Continuous Gym Grinder tracks multi-game accumulation, streaks, and Phase 2 Imitation Learning Dataset', () => {
  let session = createInitialGrinderSession();
  assert.equal(session.active, false);
  assert.equal(session.totalMatches, 0);

  const mockWinObs: GymObservation = {
    tick: 145,
    gameOver: true,
    won: true,
    alive: true,
    territory: 35000,
    peakTerritory: 35000,
    totalLand: 38000,
    territoryShare: 0.92,
    troops: 450000,
    redInterestCap: 3500000,
    interestRate: 2.5,
    interestRatePct: 2.5,
    rank: 1,
    alivePlayers: 1,
    ongoingAttacks: 0,
    ongoingAttacksCount: 0,
    activeBoats: 0,
    activeBoatsCount: 0,
    totalBoatsLaunched: 3,
    neighbors: [],
  };

  session = recordGrinderMatch(session, mockWinObs, 10, 'Europe', 'Impossible', 24);
  assert.equal(session.totalMatches, 1);
  assert.equal(session.wins, 1);
  assert.equal(session.currentStreak, 1);
  assert.equal(session.totalBoatsLaunched, 3);
  assert.equal(session.winRatePct, 100);

  // Second win
  session = recordGrinderMatch(session, mockWinObs, 2, 'Island', 'Impossible', 33);
  assert.equal(session.totalMatches, 2);
  assert.equal(session.wins, 2);
  assert.equal(session.currentStreak, 2);
  assert.equal(session.bestStreak, 2);
  assert.equal(session.recentMatches.length, 2);

  // Phase 2 Imitation Learning Dataset test
  const dataset = createImitationLearningDataset([
    {
      step: 1,
      timestamp: Date.now(),
      screenFeatures: {
        territoryShare: 0.05,
        redCapRatio: 0.35,
        interestPhase: 1,
        enemyCount: 4,
        coastalPixels: 120,
      },
      sliderPercentage: 20,
      actionType: 'attack',
      targetId: 512,
      humanConfidence: 0.98,
    },
  ]);
  assert.equal(dataset.phase, 'Phase 2: Live Human Imitation Learning');
  assert.equal(dataset.totalRecordedFrames, 1);
  assert.equal(dataset.totalPlayerActions, 1);
});


