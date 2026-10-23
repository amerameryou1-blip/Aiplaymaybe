export interface SymbolEntry {
  obfuscated: string;
  deobfuscated: string;
  constructorExpr: string;
  category: 'Singleton' | 'Core Function' | 'AI & Pathfinding' | 'UI & Rendering' | 'Storage & Network';
  role: string;
  keyMethods: string[];
}

export interface MapMetadata {
  index: number;
  name: string;
  type: 'Procedural' | 'Realistic';
  dimensions: string;
  hasMountains: boolean;
}

export interface BotDifficultyMetadata {
  index: number;
  name: string;
  initialAttackRatioPermille: string;
  targetAttackRatioPermille: string;
  cooldownTicks: string;
  weakestTargetProbPct: number;
}

export interface GymBoatTarget {
  found: boolean;
  waterEo: number;
  dir: number;
  packedTarget?: number;
  targetType: 'neutral_island' | 'weak_coastal_enemy';
  targetOwner: number;
  score: number;
}

export interface GymMountainTarget {
  found: boolean;
  targetEo: number;
  targetOwner: number;
  score: number;
}

export interface GymNeighbor {
  id: number;
  name?: string;
  isNeutral: boolean;
  troops: number;
  territory: number;
  borderPixels?: number;
  alreadyAttacking: boolean;
  isAttackingUs?: boolean;
  opposingAttackTroops?: number;
  targetCoord?: number;
  density?: number;
}

export interface GymObservation {
  tick: number;
  gameOver: boolean;
  won: boolean;
  alive: boolean;
  isSelectingSpawn?: boolean;
  territory: number;
  peakTerritory: number;
  totalLand: number;
  territoryShare: number;
  troops: number;
  redInterestCap: number;
  interestRate: number;
  interestRatePct: number;
  rank: number;
  alivePlayers: number;
  ongoingAttacks: number;
  ongoingAttacksCount: number;
  activeBoats: number;
  activeBoatsCount: number;
  totalBoatsLaunched?: number;
  totalMountainsCrossed?: number;
  totalBoatsIntercepted?: number;
  coastalPixelsCount?: number;
  mountainPixelsCount?: number;
  neighbors: GymNeighbor[];
}

export interface GymActionMask {
  canExpandNeutral: boolean;
  attackableEnemyIds: number[];
  canLaunchBoat: boolean;
  canInterceptBoat?: boolean;
  canCrossMountain: boolean;
  ongoingAttackTargetIds: number[];
  bestBoatTarget?: GymBoatTarget | null;
  bestMountainTarget?: GymMountainTarget | null;
  bestInterceptBoatId?: number;
}

export interface GymActionCommand {
  type:
    | 'attack'
    | 'cancelAttack'
    | 'mountainAttack'
    | 'launchBoat'
    | 'interceptBoat'
    | 'cancelBoat'
    | 'donateAlly'
    | 'selectSpawn'
    | 'sendEmoji'
    | 'toggleNAP'
    | 'proposePeace'
    | 'setSlider'
    | 'noop';
  targetId?: number;
  ratio?: number;
  targetCoord?: number;
  direction?: number;
  boatId?: number;
  emojiId?: number;
  reason?: string;
}

export type HeuristicPolicyId = 'balanced' | 'greedy' | 'turtle' | 'manual';

export const DEOBFUSCATION_SYMBOLS: SymbolEntry[] = [
  {
    obfuscated: 'l',
    deobfuscated: 'versionInfo',
    constructorExpr: 'new dG() / new VersionInfo()',
    category: 'Singleton',
    role: 'Build version (2154), domain checks, replay version (17), and session timestamp.',
    keyMethods: ['dd() (init)', 'n (2154)', 'dv (version string)', 'm (boot state 1)'],
  },
  {
    obfuscated: 'a0',
    deobfuscated: 'platformBridge',
    constructorExpr: 'new dF() / new PlatformBridge()',
    category: 'Storage & Network',
    role: 'Platform abstraction for Browser (0), Android (1), iOS (2), and localStorage.',
    keyMethods: ['dd() (detect platform)', 'wA (localStorage)', 'a1.iA() (large UI check)'],
  },
  {
    obfuscated: 'h',
    deobfuscated: 'viewport',
    constructorExpr: 'new cp() / new Viewport()',
    category: 'UI & Rendering',
    role: 'Main #canvasA element, mainCtx (vS 2D context), screen width i, height j, and DPI scale k.',
    keyMethods: ['de()', 'dd()', 'dn() (resize)', 'i (width)', 'j (height)', 'k (DPI scale)'],
  },
  {
    obfuscated: 'aD',
    deobfuscated: 'gameConfig',
    constructorExpr: 'new c1() / new GameConfig()',
    category: 'Singleton',
    role: 'Master game state: em (my player ID), ez (512 neutral), k6 (total land), a0p (state 0/1/2), kg (isSinglePlayer).',
    keyMethods: ['a5P() (start match)', 'a2E() (exit match)', 'a5L.a5o() (reset scenario)', 'data (a5K)'],
  },
  {
    obfuscated: 'ag',
    deobfuscated: 'playerData',
    constructorExpr: 'new cc() / new PlayerData()',
    category: 'Singleton',
    role: 'All 512 player typed arrays: mv (alive), gp (land), yS (peak land), h3 (troops), gh (borders), gi (coasts), fR (mountains), gT (attacking pixels).',
    keyMethods: ['mv[512]', 'gp[512]', 'h3[512]', 'gh[512]', 'gi[512]', 'fR[512]', 'gT[512]'],
  },
  {
    obfuscated: 'ac',
    deobfuscated: 'pixelGrid',
    constructorExpr: 'new cT() / new PixelGrid()',
    category: 'Singleton',
    role: 'Pixel buffer (aCp / territoryPixels) reader/writer: ownership (eu), neutral (et), water (iF), mountain (f7), and border colors.',
    keyMethods: ['eu(idx)', 'et(idx)', 'gb(idx)', 'iF(idx)', 'f7(idx)', 'gW(idx, p)', 'yX(idx, p)'],
  },
  {
    obfuscated: 'bs',
    deobfuscated: 'borderManager',
    constructorExpr: 'new db() / new BorderManager()',
    category: 'Singleton',
    role: 'Updates player bounding boxes (gq), cleans up interior/border pixels (gB, gC), and repairs enemy borders (gg, gl).',
    keyMethods: ['gq()', 'gB()', 'gC()', 'gg(border)', 'gl()', 'ev(p1, p2) (canAttack)', 'ha(p1, p2)'],
  },
  {
    obfuscated: 'aE',
    deobfuscated: 'botConfig',
    constructorExpr: 'new c5() / new BotConfig()',
    category: 'AI & Pathfinding',
    role: 'Bot difficulty levels (hk 0..6), decision cooldowns (kR), attack troop ratios (kS, kT), and per-tick trigger (eV).',
    keyMethods: ['dd()', 'eV(botId)', 'k8(botId, cd)', 'hk[512] (difficulty)'],
  },
  {
    obfuscated: 'ao',
    deobfuscated: 'botBrain',
    constructorExpr: 'new cl() / new BotBrain()',
    category: 'AI & Pathfinding',
    role: 'Bot AI sub-modules: j7 (neighbor scanner), j9 (decision maker jz), j4 (coastal targeter), jB (mountain AI), jF (boat interceptor).',
    keyMethods: ['j7.jZ()', 'j9.jz(player, troops)', 'j4.eV()', 'jB.eV()', 'jF.eV()'],
  },
  {
    obfuscated: 'ad',
    deobfuscated: 'attackTracker',
    constructorExpr: 'new cY() / new AttackTracker()',
    category: 'Singleton',
    role: 'Tracks active land attacks per player: g8 (count), gD (targetId), gE (troops), h4 (opposing troops).',
    keyMethods: ['g8(p)', 'gD(p, idx)', 'gE(p, idx)', 'h4(p, target)', 'jh(p, target)', 'eZ(p, troops, target)'],
  },
  {
    obfuscated: 'aF',
    deobfuscated: 'expansionScheduler',
    constructorExpr: 'new c6() / new ExpansionScheduler()',
    category: 'Singleton',
    role: 'Schedules & steps pixel expansion waves (g5(player)) based on territory size speed tiers (mn).',
    keyMethods: ['eV()', 'jT(player, fast)', 'gP(player)'],
  },
  {
    obfuscated: 'ae',
    deobfuscated: 'economy',
    constructorExpr: 'new cZ() / new Economy()',
    category: 'Singleton',
    role: 'Interest rate calculation (aCC), red-interest soft cap (k2 = 100 * land), 10-tick interest (aJs), and 100-tick land income (aJu).',
    keyMethods: ['aCC(player)', 'k2(player)', 'eV()', 'pL(sender, receiver)'],
  },
  {
    obfuscated: 'bN',
    deobfuscated: 'navalSystem',
    constructorExpr: 'new d6() / new NavalSystem()',
    category: 'AI & Pathfinding',
    role: 'Boats/Ships manager: y (boat state arrays & movement), l9 (A* water pathfinder), kA (bot boat launcher), he (ship interceptor), z0 (renderer).',
    keyMethods: ['y.eV()', 'l9.qH()', 'kA.eV()', 'he.qK()', 'z0.vR()'],
  },
  {
    obfuscated: 'am',
    deobfuscated: 'mountainSystem',
    constructorExpr: 'new cX() / new MountainSystem()',
    category: 'AI & Pathfinding',
    role: 'Passable mountain range pathfinder (ed.ef, ed.ew) for crossing mountain tiles.',
    keyMethods: ['ed.ef(pixelIdx)', 'ed.ew(player, coord)'],
  },
  {
    obfuscated: 'bS',
    deobfuscated: 'mapManager',
    constructorExpr: 'new dB() / new MapManager()',
    category: 'Singleton',
    role: 'All 24 maps (xG.xH), realistic vector RLE map decoder (aLx / x9), and procedural terrain generator (aq / ap).',
    keyMethods: ['a7(mapIdx, seed)', 'a5l(data)', 'aEV(data, mapIdx)', 'xG.xH[24]'],
  },
  {
    obfuscated: 'b8',
    deobfuscated: 'actionDispatcher',
    constructorExpr: 'new cy() / new ActionDispatcher()',
    category: 'Singleton',
    role: 'hR (player command sender), pD (offline command validator & executor), kO (troop/gold support).',
    keyMethods: ['pD.hY(p, ratio, target)', 'pD.pU(p, target)', 'pD.hd(p, ratio, boatTarget)', 'pD.hU(p, ratio, coord, target)'],
  },
  {
    obfuscated: 'bf',
    deobfuscated: 'gameLoop',
    constructorExpr: 'new dR() / new GameLoop()',
    category: 'Singleton',
    role: 'requestAnimationFrame loop, tick counter (kJ()), single-player runner (ac0), multiplayer runner (abe), replay runner (abl).',
    keyMethods: ['kJ() (currentTick)', 'a5V() (init runner)', 'eV() (tick++)', 'aCD (56ms tick interval)'],
  },
  {
    obfuscated: 'aV',
    deobfuscated: 'leaderboardUI',
    constructorExpr: 'new cM() / new LeaderboardUI()',
    category: 'UI & Rendering',
    role: 'Top-left leaderboard canvas, sorting players by land (lx / rankToPlayerId and k7 / playerIdToRank).',
    keyMethods: ['eV() (bubble sort)', 'mh() (redraw)', 'vR() (render)'],
  },
  {
    obfuscated: 'aU',
    deobfuscated: 'balanceUI',
    constructorExpr: 'new cL() / new BalanceUI()',
    category: 'UI & Rendering',
    role: 'Top-center troop balance bar, 10-tick interest countdown bars, and red-interest indicator.',
    keyMethods: ['eV()', 'mh()', 'aAg()', 'vR()'],
  },
  {
    obfuscated: 'aW',
    deobfuscated: 'statsUI',
    constructorExpr: 'new cN() / new StatsUI()',
    category: 'UI & Rendering',
    role: 'Top-right stats panel (Players, Threshold, Interest, Territory, Time) & victory trigger (aC6).',
    keyMethods: ['eV()', 'aC6() (victory check)', 'a5t() (elapsed ms)', 'vR()'],
  },
  {
    obfuscated: 'aR',
    deobfuscated: 'percentageBarUI',
    constructorExpr: 'new cI() / new PercentageBarUI()',
    category: 'UI & Rendering',
    role: 'Bottom troop attack ratio slider (hV() returns 0..1023).',
    keyMethods: ['hV()', 'a2u(factor)', 'vR()'],
  },
  {
    obfuscated: 'aS',
    deobfuscated: 'camera',
    constructorExpr: 'new cJ() / new Camera()',
    category: 'UI & Rendering',
    role: 'Map zoom (iC / cameraZoom) and pan offsets (ic / cameraOffsetX, ie / cameraOffsetY).',
    keyMethods: ['yy()', 'yz()', 'a9s(x, y, zoomFactor)', 'a2Q(x, y, deltaY)'],
  },
  {
    obfuscated: 'af',
    deobfuscated: 'mapLabels',
    constructorExpr: 'new cb() / new MapLabels()',
    category: 'UI & Rendering',
    role: 'Calculates largest inscribed territory rectangles and renders player names, troop counts, crowns, and emojis.',
    keyMethods: ['eV()', 'mh()', 'vR()', 'qN(player, slot, emojiId)'],
  },
  {
    obfuscated: 't',
    deobfuscated: 'menuManager',
    constructorExpr: 'new dD() / new MenuManager()',
    category: 'UI & Rendering',
    role: 'HTML DOM menu router (Main Menu aOB, Custom Scenario aOL, Settings aO9, Replays aOA).',
    keyMethods: ['u(menuId, prevId, arg)', 'x() (close all)', 'hn() (isMenuOpen)'],
  },
  {
    obfuscated: 'bt',
    deobfuscated: 'bootGame',
    constructorExpr: 'function bootGame(bu)',
    category: 'Core Function',
    role: 'Initializes all 80+ engine singletons (bv, dc), decodes sprites, and opens the main menu.',
    keyMethods: ['bv() (instantiate)', 'dc() (initialize)'],
  },
  {
    obfuscated: 'ma',
    deobfuscated: 'stepSimulationTick',
    constructorExpr: 'function stepSimulationTick()',
    category: 'Core Function',
    role: 'Advances 1 complete simulation tick: botRunner, donations, economy, expansionScheduler, botBrain, navalSystem, aliveTracker, leaderboardUI, statsUI, and tick++.',
    keyMethods: ['aG.eV()', 'ae.eV()', 'aF.eV()', 'ao.eV()', 'bN.y.eV()', 'al.mb()', 'aV.eV()', 'aW.eV()'],
  },
  {
    obfuscated: 'yw',
    deobfuscated: 'renderGameFrame',
    constructorExpr: 'function renderGameFrame()',
    category: 'Core Function',
    role: 'Draws the map canvas (mapManager.xQ), territory overlay (territoryCanvas), boats (navalSystem), player labels (mapLabels), and HUD panels onto mainCtx.',
    keyMethods: ['at.yx()', 'bN.vR()', 'af.vR()', 'aV.vR()', 'aW.vR()', 'aU.vR()'],
  },
  {
    obfuscated: 'g5',
    deobfuscated: 'stepPlayerExpansionWave',
    constructorExpr: 'function stepPlayerExpansionWave(player)',
    category: 'Core Function',
    role: 'Executes 1 pixel-ring expansion step and combat calculation (gt, gw, gy, h1) for a player.',
    keyMethods: ['g6()', 'g7()', 'g9()', 'gt() (enemy combat)', 'gs() (neutral expansion)', 'gr() (claim pixels)'],
  },
];

export const MAP_CATALOG: MapMetadata[] = [
  { index: 0, name: 'White Arena', type: 'Procedural', dimensions: '230×230', hasMountains: false },
  { index: 1, name: 'Black Arena', type: 'Procedural', dimensions: '800×800', hasMountains: false },
  { index: 2, name: 'Island', type: 'Procedural', dimensions: '512×512', hasMountains: false },
  { index: 3, name: 'Mountains 1', type: 'Procedural', dimensions: '960×960', hasMountains: true },
  { index: 4, name: 'Desert', type: 'Procedural', dimensions: '900×900', hasMountains: false },
  { index: 5, name: 'Swamp', type: 'Procedural', dimensions: '1000×1000', hasMountains: false },
  { index: 6, name: 'White Plains', type: 'Procedural', dimensions: '1000×1000', hasMountains: false },
  { index: 7, name: 'Cliffs', type: 'Procedural', dimensions: '1024×1024', hasMountains: true },
  { index: 8, name: 'Pond', type: 'Procedural', dimensions: '820×820', hasMountains: false },
  { index: 9, name: 'Halo', type: 'Procedural', dimensions: '1024×1024', hasMountains: true },
  { index: 10, name: 'Europe', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 11, name: 'World 1', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 12, name: 'Caucasia', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 13, name: 'Africa', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 14, name: 'Middle East', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 15, name: 'Scandinavia', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 16, name: 'North America', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 17, name: 'South America', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 18, name: 'Asia', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 19, name: 'Australia', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 20, name: 'Island Kingdom', type: 'Procedural', dimensions: '1024×1024', hasMountains: false },
  { index: 21, name: 'Mountains 2', type: 'Procedural', dimensions: '940×940', hasMountains: true },
  { index: 22, name: 'World 2', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
  { index: 23, name: 'British Isles', type: 'Realistic', dimensions: 'RLE Vector', hasMountains: false },
];

export const BOT_DIFFICULTIES: BotDifficultyMetadata[] = [
  { index: 0, name: 'Very Easy', initialAttackRatioPermille: '980‰', targetAttackRatioPermille: '980‰', cooldownTicks: '104', weakestTargetProbPct: 0 },
  { index: 1, name: 'Easy', initialAttackRatioPermille: '980‰', targetAttackRatioPermille: '920‰', cooldownTicks: '110', weakestTargetProbPct: 0 },
  { index: 2, name: 'Normal', initialAttackRatioPermille: '825‰', targetAttackRatioPermille: '750‰', cooldownTicks: '104', weakestTargetProbPct: 5 },
  { index: 3, name: 'Hard', initialAttackRatioPermille: '500‰', targetAttackRatioPermille: '500‰', cooldownTicks: '100', weakestTargetProbPct: 25 },
  { index: 4, name: 'Very Hard', initialAttackRatioPermille: '300–500‰', targetAttackRatioPermille: '100–300‰', cooldownTicks: '50–100', weakestTargetProbPct: 50 },
  { index: 5, name: 'Impossible', initialAttackRatioPermille: '300–500‰', targetAttackRatioPermille: '50–150‰', cooldownTicks: '100', weakestTargetProbPct: 100 },
  { index: 6, name: 'Human / H Bot', initialAttackRatioPermille: '10‰', targetAttackRatioPermille: '250‰', cooldownTicks: '80', weakestTargetProbPct: 0 },
];

/**
 * Exact deobfuscated Red-Interest Soft Cap formula (`economy.k2(player)`):
 * `Math.min(100 * land, 1_000_000_000)`
 */
export function calculateRedInterestCap(territoryPixels: number): number {
  const clampedLand = Math.max(0, Math.floor(territoryPixels));
  return Math.min(100 * clampedLand, 1_000_000_000);
}

/**
 * Exact deobfuscated combat defense cost per expansion wave (`gt()` / `gw()` in `stepPlayerExpansionWave`):
 * Base pixel claim cost = `fx * 2` (`fx * gameConfig.gL`)
 * Defender density penalty `gw()` = `floor((fx * defenderTroops) / (1 + floor(10 * defenderLand / 16)))`
 * Total cost to capture `fx` pixels = `fx * 2 + 2 * gw + opposingAttackTroops`
 */
export function estimatePixelCombatCost(
  borderPixelsCount: number,
  defenderTroops: number,
  defenderLand: number,
  opposingAttackTroops = 0
): { baseCost: number; densityTax: number; totalCost: number } {
  const fx = Math.max(0, Math.floor(borderPixelsCount));
  const baseCost = fx * 2;
  const denom = 1 + Math.floor((10 * Math.max(0, Math.floor(defenderLand))) / 16);
  const gw = Math.floor((fx * Math.max(0, Math.floor(defenderTroops))) / denom);
  const densityTax = 2 * gw;
  return {
    baseCost,
    densityTax,
    totalCost: baseCost + densityTax + Math.max(0, Math.floor(opposingAttackTroops)),
  };
}

/**
 * Pure, deterministic RL Heuristic Agent decision function for `window.TerritorialGym`.
 */
export function evaluateHeuristicPolicy(
  obs: GymObservation,
  mask: GymActionMask,
  policy: HeuristicPolicyId
): GymActionCommand {
  if (policy === 'manual' || obs.gameOver || !obs.alive) {
    return { type: 'noop', reason: 'Manual mode or match inactive' };
  }

  // Wait if we already have 2+ active land attacks so we don't over-fragment troops
  if (obs.ongoingAttacksCount >= 2) {
    return { type: 'noop', reason: 'Waiting for ongoing expansion wave to complete' };
  }

  const neutralNeighbor = obs.neighbors.find((n) => n.isNeutral && !n.alreadyAttacking);
  const enemyNeighbors = obs.neighbors
    .filter((n) => !n.isNeutral && !n.alreadyAttacking)
    .sort((a, b) => a.troops - b.troops);

  const cap = Math.max(obs.redInterestCap, 512);
  const capRatio = obs.troops / cap;

  if (policy === 'greedy') {
    if (neutralNeighbor && mask.canExpandNeutral && obs.troops >= 120) {
      return {
        type: 'attack',
        targetId: 512,
        ratio: 0.35,
        reason: 'Greedy expansion into Neutral Land (35% troops)',
      };
    }
    const weakest = enemyNeighbors[0];
    if (weakest && obs.troops > weakest.troops * 1.15 && obs.troops >= 250) {
      return {
        type: 'attack',
        targetId: weakest.id,
        ratio: 0.4,
        reason: `Greedy strike on ${weakest.name || '#' + weakest.id} (${weakest.troops} troops)`,
      };
    }
    return { type: 'noop', reason: 'Accumulating troops for next greedy wave' };
  }

  if (policy === 'turtle') {
    if (neutralNeighbor && mask.canExpandNeutral && (obs.territory < 120 || capRatio > 0.78)) {
      return {
        type: 'attack',
        targetId: 512,
        ratio: 0.16,
        reason: 'Conservative neutral expansion while preserving interest base',
      };
    }
    const weakest = enemyNeighbors[0];
    if (weakest && (capRatio >= 0.92 || obs.troops > weakest.troops * 2.5)) {
      return {
        type: 'attack',
        targetId: weakest.id,
        ratio: 0.25,
        reason: `Surplus cap attack on weakest neighbor ${weakest.name || '#' + weakest.id}`,
      };
    }
    return { type: 'noop', reason: `Banking compound interest (${Math.round(capRatio * 100)}% of Red Cap)` };
  }

  // Default: 'balanced' (Red-Interest Cap aware RL heuristic)
  if (neutralNeighbor && mask.canExpandNeutral) {
    // Cycle expansion on interest ticks or when troops are healthy
    if (obs.tick < 150 || capRatio >= 0.45 || obs.ongoingAttacksCount === 0) {
      const ratio = obs.tick < 80 ? 0.28 : 0.2;
      return {
        type: 'attack',
        targetId: 512,
        ratio,
        reason: `Cycle neutral expansion (${Math.round(ratio * 100)}% ratio)`,
      };
    }
  }

  const weakest = enemyNeighbors[0];
  if (weakest) {
    const advantage = obs.troops / Math.max(1, weakest.troops);
    if (advantage >= 1.6 || (capRatio >= 0.88 && advantage >= 1.05)) {
      const ratio = Math.min(0.45, Math.max(0.18, (weakest.troops * 1.25) / Math.max(1, obs.troops)));
      return {
        type: 'attack',
        targetId: weakest.id,
        ratio,
        reason: `Balanced attack on ${weakest.name || '#' + weakest.id} (${advantage.toFixed(1)}x troop advantage)`,
      };
    }
  }

  return {
    type: 'noop',
    reason: `Compounding interest (${obs.interestRatePct.toFixed(2)}% at ${Math.round(capRatio * 100)}% Red Cap)`,
  };
}

export type CompatibilityStatus = 'PASS' | 'PARTIAL' | 'FAIL' | 'NOT TESTED' | 'UNKNOWN';

export interface CompatibilityMatrixEntry {
  id: string;
  category:
    | 'Visual Fidelity'
    | 'Maps & Mechanics'
    | 'Bot Behavior'
    | 'Controls & UX'
    | 'Networking & Multiplayer'
    | 'Performance & Stability';
  subsystem: string;
  status: CompatibilityStatus;
  verificationSource: 'Verified Client Code' | 'Reconstructed Protocol' | 'Inferred / Server-Side';
  requirement: string;
  testProcedure: string;
  expectedResult: string;
  actualResult: string;
  evidence: string;
  remainingDiscrepancies: string;
}

export const COMPATIBILITY_MATRIX: CompatibilityMatrixEntry[] = [
  {
    id: 'vis-canvas-viewport',
    category: 'Visual Fidelity',
    subsystem: 'Canvas Rendering, DPR Scaling & Responsive Viewport',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Render #canvasA at native devicePixelRatio with responsive resize handling across desktop and mobile viewports.',
    testProcedure: 'Inspect #canvasA dimensions, viewport.i / viewport.j / viewport.k, and resize behavior at 1440×900 and 390×844.',
    expectedResult: 'Canvas fills 100vw×100vh with zero clipping or overflow; mainCtx and territoryCtx buffers stay synchronized.',
    actualResult: 'Canvas renders at full viewport resolution with synchronized offscreen territoryImageData buffer.',
    evidence: 'Verified in territorial_deobfuscated_full.html (Viewport cp, renderGameFrame yw) & live browser inspection.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'vis-camera-transforms',
    category: 'Visual Fidelity',
    subsystem: 'Camera Zoom, Panning & Screen-to-Map Coordinate Transforms',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Transform screen pixel coordinates to map grid coordinates accurately across zoom levels (cameraZoom, cameraOffsetX, cameraOffsetY).',
    testProcedure: 'Execute zoom and pan operations via Camera (cJ) and verify screen-to-map coordinate inversion.',
    expectedResult: 'Deterministic mapping between cursor/touch coordinates and map pixel index eo = y * mapManager.fD + x.',
    actualResult: 'Exact original Camera (cJ) and coordUtils (bM) functions preserved without modification.',
    evidence: 'Verified in territorial_deobfuscated_full.html (Camera, coordUtils) & Automated Suite Check #8.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'vis-borders-labels',
    category: 'Visual Fidelity',
    subsystem: 'Territory Colors, Borders, Player Names, Troop Labels & Sprites',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Render territory fill colors, border outlines, dynamically scaled player names, troop counts, boats, and emojis.',
    testProcedure: 'Start match on Europe (Map #10), step 50 ticks, and inspect mapLabels, territoryPixels, and leaderboardUI.',
    expectedResult: 'All player names, troop counts, clan tags, and border pixels render identically to Build 2154.',
    actualResult: 'Original MapLabels (cb), ColorPalette (bB), and SpriteSheetManager (ab) execute natively.',
    evidence: 'Verified in territorial_deobfuscated_full.html & visual screenshot capture.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'mech-maps-24',
    category: 'Maps & Mechanics',
    subsystem: 'All 24 Maps (12 Procedural Generators + 12 RLE Vector Maps)',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Load all 12 procedural maps (White/Black Arena, Island, Mountains, Desert, Swamp, Halo, etc.) and 12 RLE realistic maps (Europe, World, Asia, Americas, etc.).',
    testProcedure: 'Run deterministic map resets across procedural (Map #0, #2, #3) and realistic RLE vector maps (Map #10 Europe, #11 World) with seed 14071.',
    expectedResult: 'Valid fD×fE dimensions, positive total land count (gameConfig.k6 > 0), and complete scanline texture generation.',
    actualResult: 'All 24 maps decode and initialize deterministically; scanline generator (mapManager.xP.eV) completes cleanly.',
    evidence: 'Verified in lib/deobfuscation-data.test.ts & Automated Suite Checks #3 and #4.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'mech-expansion-combat',
    category: 'Maps & Mechanics',
    subsystem: '4-Directional Pixel Expansion Waves & Combat Defense Density Tax',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Execute 4-neighbor BFS border expansion (stepPlayerExpansionWave) and exact combat cost (fx*2 + 2*floor(fx*defTroops/(1+floor(10*defLand/16)))).',
    testProcedure: 'Issue neutral (target 512) and enemy territory attacks; compare troop deductions and pixel claims against engine formulas.',
    expectedResult: 'Exact pixel-by-pixel border ring expansion and troop attrition matching Build 2154.',
    actualResult: 'Native stepPlayerExpansionWave (g5), AttackTracker (cY), and BorderManager (db) execute unmodified.',
    evidence: 'Verified in lib/deobfuscation-data.test.ts (Check #3) & Automated Suite Check #5.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'mech-economy-interest',
    category: 'Maps & Mechanics',
    subsystem: '10-Tick Interest Compounding, Tax & Red-Interest Soft Cap (100 × Land)',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Compound troop interest every 10 ticks, enforce Red-Interest soft cap k2(p) = min(100 * land, 10^9), and apply 100-tick occupation tax.',
    testProcedure: 'Step simulation 20 ticks and verify economy.k2(0) === territory * 100 and economy.aCC(0) interest rate decay.',
    expectedResult: 'Exact integer troop balance updates every 10 ticks matching Economy (cZ).',
    actualResult: 'Native Economy (cZ) singleton runs unmodified with exact integer arithmetic.',
    evidence: 'Verified in lib/deobfuscation-data.test.ts & Automated Suite Check #6.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'mech-naval-mountains',
    category: 'Maps & Mechanics',
    subsystem: 'Naval Amphibious Boats (NavalSystem) & Passable Mountain Attacks',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Support launching amphibious boats across water pixels (actionDispatcher.pD.hd) and crossing passable mountains (hU).',
    testProcedure: 'Verify NavalSystem (d6) boat pathfinding/landing and MountainSystem (cX) passability checks.',
    expectedResult: 'Boats traverse water pixels and claim coastal pixels on landing; mountain crossings validate adjacent mountain borders.',
    actualResult: 'Native NavalSystem and MountainSystem singletons preserved and exposed via actionDispatcher.',
    evidence: 'Verified in territorial_deobfuscated_full.html (NavalSystem, MountainSystem) & Suite Check #9.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'bot-native-ai',
    category: 'Bot Behavior',
    subsystem: '7 Native Bot Difficulty Profiles (Very Easy to Impossible & H-Bot)',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Execute authentic bot decision-making (botBrain / botConfig / botRunner) across all 7 difficulty tiers for up to 512 entities.',
    testProcedure: 'Run 100-tick deterministic simulation with 50 bots on Europe (Seed 14071) and verify bot expansion, attacks, and eliminations.',
    expectedResult: 'Bots expand during opening phase, respect difficulty cooldowns (50–110 ticks), and target weakest neighbors by probability.',
    actualResult: 'Original BotConfig (c5), BotBrain (cl), and BotRunner (aG) run natively for all non-human slots.',
    evidence: 'Verified in territorial_deobfuscated_full.html & Automated Suite Check #7.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'ux-controls-menus',
    category: 'Controls & UX',
    subsystem: 'Mouse/Touch/Keyboard Controls, Radial Menu, Settings & Account/Leaderboard Modals',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Support click/drag map interaction, troop ratio slider, radial action menu, and Title Screen modals (Account Menu 7, Leaderboards Menu 10, Clan Charts Menu 13).',
    testProcedure: 'Open Title Screen modals (Account, Leaderboards, Clans, Charts, Settings) and test in-game radial actions.',
    expectedResult: 'All menus open without hanging on "Find Server..."; in-game controls dispatch via ActionDispatcher.',
    actualResult: 'All Title Screen and In-Game menus render and respond immediately via VirtualTerritorialServer Opcodes 12, 13, 14.',
    evidence: 'Verified in territorial_deobfuscated_full.html (VirtualTerritorialServer) & Automated Suite Check #10.',
    remainingDiscrepancies: 'None.',
  },
  {
    id: 'net-binary-protocol',
    category: 'Networking & Multiplayer',
    subsystem: 'Binary Bit-Stream WebSocket Protocol & Multiplayer Match Lifecycle (Menu 29 -> State 8)',
    status: 'PASS',
    verificationSource: 'Reconstructed Protocol',
    requirement: 'Complete handshake (Opcodes 13->9, 15->10+11), enter 4-room Lobby (Opcode 1->2), tick countdown (Opcode 16), and stream 7-tick lockstep packets ([1, 0, ...]).',
    testProcedure: 'Trigger Multiplayer Lobby, verify 4 rooms (Team 42p, BR 54p, 1v1 2p, Zombie 32p), launch match, and verify lockstep tick execution.',
    expectedResult: 'Lobby opens Menu 29, chat echoes via Opcode 17, countdown transitions to State 8, and human/bot slots battle without stalls.',
    actualResult: 'Full binary bit-level WebSocket protocol implemented in window.VirtualTerritorialServer.',
    evidence: 'Verified in lib/deobfuscation-data.test.ts & Automated Suite Check #11.',
    remainingDiscrepancies: 'Runs against built-in VirtualTerritorialServer rather than remote territorial.io servers.',
  },
  {
    id: 'net-official-servers',
    category: 'Networking & Multiplayer',
    subsystem: 'Direct Connection to Official Production Servers (wss://territorial.io/s52/)',
    status: 'PARTIAL',
    verificationSource: 'Inferred / Server-Side',
    requirement: 'Assess whether reconstructed Build 2154 client connects to live production territorial.io servers or an emulated server.',
    testProcedure: 'Inspect WebSocket endpoints in networkManager.y (territorial.io/s52/, game.territorial.io/x01/) and test cross-origin connection behavior.',
    expectedResult: 'Identify exact server environment and protocol compatibility boundaries.',
    actualResult: 'Official production servers enforce Origin: https://territorial.io and current client version checks; Build 2154 uses VirtualTerritorialServer locally.',
    evidence: 'Documented in networkManager.y (lines 26675–26735) and VirtualTerritorialServer socket interceptor.',
    remainingDiscrepancies: 'Official production servers reject third-party origins and older client build numbers (dz=266); server-side ELO database and anti-cheat validation remain proprietary.',
  },
  {
    id: 'perf-stability',
    category: 'Performance & Stability',
    subsystem: 'Tick Execution Throughput, Frame Pacing & Multi-Step Memory Stability',
    status: 'PASS',
    verificationSource: 'Verified Client Code',
    requirement: 'Maintain <2ms per simulation tick during 512-player matches and zero uncaught runtime or WebSocket errors.',
    testProcedure: 'Measure execution time of 100 continuous simulation ticks with 50–512 active territories and monitor console errors.',
    expectedResult: '100 ticks complete in <150ms (>650 ticks/sec headless capacity) with zero memory leaks or exceptions.',
    actualResult: '100 ticks execute in ~15–45ms (~2,500+ ticks/sec capacity) with zero console errors.',
    evidence: 'Verified in Automated Suite Check #7 & #12.',
    remainingDiscrepancies: 'None.',
  },
];

