#!/usr/bin/env python3
"""
String-Safe Deobfuscator & AI Gym Injector for Territorial.io (name.html)
Run: python3 deobfuscate_territorial.py name.html territorial_deobfuscated_full.html
"""
import sys
import re
import json
import shutil
from pathlib import Path

# 1. Exact Symbol Rename Table (Safe outside string literals and property accesses)
SYMBOL_MAP = {
    # Primary Global Singletons
    "l": "versionInfo",
    "a0": "platformBridge",
    "h": "viewport",
    "t": "menuManager",
    "aD": "gameConfig",
    "ag": "playerData",
    "ac": "pixelGrid",
    "bs": "borderManager",
    "aE": "botConfig",
    "aG": "botRunner",
    "ao": "botBrain",
    "ad": "attackTracker",
    "aF": "expansionScheduler",
    "ae": "economy",
    "bN": "navalSystem",
    "am": "mountainSystem",
    "bS": "mapManager",
    "aq": "heightmapGen",
    "ap": "terrainClassifier",
    "b8": "actionDispatcher",
    "bf": "gameLoop",
    "aV": "leaderboardUI",
    "aU": "balanceUI",
    "aW": "statsUI",
    "aR": "percentageBarUI",
    "aS": "camera",
    "aH": "cameraAnimator",
    "af": "mapLabels",
    "aN": "notificationFeed",
    "aP": "ongoingAttacksUI",
    "aL": "radialMenuUI",
    "aM": "exitMenuUI",
    "aQ": "bannerUI",
    "aX": "endScreenBanner",
    "al": "aliveTracker",
    "ak": "eliminationHandler",
    "aI": "spawnManager",
    "aJ": "startingResources",
    "ai": "nameGenerator",
    "ay": "seededRng",
    "bg": "teamManager",
    "bh": "teamPieChart",
    "bd": "matchStats",
    "be": "statsModalUI",
    "b9": "replaySystem",
    "bC": "replayControlsUI",
    "bR": "gameResultHandler",
    "bj": "storageManager",
    "b7": "localization",
    "bA": "utils",
    "bB": "colorPalette",
    "bL": "mathUtils",
    "bM": "coordUtils",
    "bO": "scratchBuffers",
    "bJ": "inputHandler",
    "bX": "keybindManager",
    "b0": "networkManager",
    "ab": "spriteSheetManager",
    "aa": "titleScreenRenderer",
    "aY": "titleButtonsUI",
    "aZ": "connectingScreenUI",
    # Singleton Constructors
    "dG": "VersionInfo",
    "dF": "PlatformBridge",
    "cp": "Viewport",
    "c1": "GameConfig",
    "cc": "PlayerData",
    "cT": "PixelGrid",
    "db": "BorderManager",
    "c5": "BotConfig",
    "cl": "BotBrain",
    "cY": "AttackTracker",
    "c6": "ExpansionScheduler",
    "cZ": "Economy",
    "d6": "NavalSystem",
    "cX": "MountainSystem",
    "dB": "MapManager",
    "cy": "ActionDispatcher",
    "dR": "GameLoop",
    "cM": "LeaderboardUI",
    "cL": "BalanceUI",
    "cN": "StatsUI",
    "cI": "PercentageBarUI",
    "cJ": "Camera",
    "cb": "MapLabels",
    "dD": "MenuManager",
    # Core Functions & Globals
    "bt": "bootGame",
    "ma": "stepSimulationTick",
    "yw": "renderGameFrame",
    "g5": "stepPlayerExpansionWave",
    "lx": "rankToPlayerId",
    "k7": "playerIdToRank",
    "iC": "cameraZoom",
    "ic": "cameraOffsetX",
    "ie": "cameraOffsetY",
    "vS": "mainCtx",
    "a2M": "mainCanvas",
    "z1": "territoryCanvas",
    "a5X": "territoryCtx",
    "a5Y": "territoryImageData",
    "aCp": "territoryPixels",
}

GYM_INJECTION_CODE = r"""
  // ============================================================================
  // EXPOSED INTERNALS & AI TRAINING GYM (window.TerritorialGym)
  // ============================================================================
  window.TerritorialInternals = {
    get versionInfo() { return versionInfo; },
    get platformBridge() { return platformBridge; },
    get viewport() { return viewport; },
    get menuManager() { return menuManager; },
    get uiManager() { return menuManager; },
    get gameConfig() { return gameConfig; },
    get playerData() { return playerData; },
    get pixelGrid() { return pixelGrid; },
    get borderManager() { return borderManager; },
    get botConfig() { return botConfig; },
    get botRunner() { return botRunner; },
    get botBrain() { return botBrain; },
    get economy() { return economy; },
    get attackTracker() { return attackTracker; },
    get expansionScheduler() { return expansionScheduler; },
    get navalSystem() { return navalSystem; },
    get mountainSystem() { return mountainSystem; },
    get mapManager() { return mapManager; },
    get actionDispatcher() { return actionDispatcher; },
    get actionHandler() { return actionDispatcher; },
    get gameLoop() { return gameLoop; },
    get aliveTracker() { return aliveTracker; },
    get leaderboardUI() { return leaderboardUI; },
    get balanceUI() { return balanceUI; },
    get statsUI() { return statsUI; },
    get percentageBarUI() { return percentageBarUI; },
    get camera() { return camera; },
    get mapLabels() { return mapLabels; },
    get rankToPlayerId() { return rankToPlayerId; },
    get playerIdToRank() { return playerIdToRank; },
    bootGame: bootGame,
    stepSimulationTick: stepSimulationTick,
    renderGameFrame: renderGameFrame,
    stepPlayerExpansionWave: stepPlayerExpansionWave
  };

  window.TerritorialGym = {
    /**
     * Instantly starts or resets an offline single-player game on any of the 24 maps.
     * mapIndex: 0..9, 20, 21 (Procedural), 10..19, 22, 23 (Realistic: Europe, World, Asia, etc.)
     */
    reset: function(options) {
      options = options || {};
      if (!versionInfo || versionInfo.m !== 1) {
        bootGame();
      }
      if (gameConfig.a0p !== 0) {
        gameConfig.a2E(true);
      }
      menuManager.x();
      gameConfig.a5L.a5o();
      var mapIdx = options.mapIndex !== undefined ? Number(options.mapIndex) : 10; // Default 10 = Europe
      var isRealistic = (mapIdx >= 10 && mapIdx <= 19) || mapIdx === 22 || mapIdx === 23;
      gameConfig.data.mapType = isRealistic ? 1 : 0;
      mapManager.aEV(gameConfig.data, mapIdx);
      var seedVal = options.mapSeed !== undefined ? options.mapSeed : options.seed;
      gameConfig.data.mapSeed = seedVal !== undefined ? Number(seedVal) : Math.floor(Math.random() * 16384);
      gameConfig.data.spawningSeed = gameConfig.data.mapSeed;
      gameConfig.data.playerCount = options.playerCount !== undefined ? Number(options.playerCount) : 50;
      gameConfig.data.gameMode = options.gameMode !== undefined ? Number(options.gameMode) : 0;
      gameConfig.data.botDifficultyType = 0;
      gameConfig.data.botDifficultyValue = options.botDifficulty !== undefined ? Number(options.botDifficulty) : 3;
      gameConfig.data.selectableSpawn = 0; // Auto-spawn immediately
      gameConfig.data.isReplay = 0;

      gameConfig.a5L.a5n();
      titleScreenRenderer.aHA();
      mapManager.a7(mapIdx, gameConfig.data.mapSeed);
      // Ensure realistic map surface textures finish synchronously if needed
      if (mapManager.xP && mapManager.xP.aAB !== -1) {
        mapManager.xP.aMF = false;
        mapManager.xP.eV();
      }
      gameConfig.a5P();
      bb.aCn();
      mg();
      renderGameFrame();
      return this.getObservation(gameConfig.em);
    },

    /**
     * Steps the exact game simulation forward by `ticks` ticks synchronously.
     */
    step: function(ticks, render) {
      ticks = ticks !== undefined ? Number(ticks) : 1;
      for (var i = 0; i < ticks; i++) {
        if (gameConfig.a0p !== 1) break;
        if (gameConfig.hP && gameConfig.qA) {
          gameConfig.qA.eV();
        }
        stepSimulationTick();
      }
      if (render !== false) {
        bb.aCn();
        mg();
        renderGameFrame();
      }
      return this.getObservation(gameConfig.em);
    },

    /**
     * Returns a structured observation for `playerId` (default 0).
     */
    getObservation: function(playerId) {
      if (!versionInfo || versionInfo.m !== 1 || !gameConfig || gameConfig.a0p === 0) {
        return {
          tick: 0,
          gameOver: true,
          won: false,
          alive: false,
          territory: 0,
          peakTerritory: 0,
          totalLand: 0,
          territoryShare: 0,
          troops: 0,
          redInterestCap: 0,
          interestRate: 0,
          interestRatePct: 0,
          rank: 0,
          alivePlayers: 0,
          ongoingAttacks: 0,
          ongoingAttacksCount: 0,
          activeBoats: 0,
          activeBoatsCount: 0,
          neighbors: []
        };
      }
      var p = playerId !== undefined ? playerId : gameConfig.em;
      var interestPct = economy.aCC(p) / 100;
      var attacksCount = attackTracker.g8(p);
      var boatsCount = navalSystem.y.kQ[p];
      return {
        tick: gameLoop.kJ(),
        gameOver: gameConfig.a0p === 2 || playerData.mv[p] === 0,
        won: gameConfig.a0p === 2 && rankToPlayerId[0] === p,
        alive: playerData.mv[p] === 1,
        territory: playerData.gp[p],
        peakTerritory: playerData.yS[p],
        totalLand: gameConfig.k6,
        territoryShare: gameConfig.k6 > 0 ? playerData.gp[p] / gameConfig.k6 : 0,
        troops: playerData.h3[p],
        redInterestCap: economy.k2(p),
        interestRate: interestPct,
        interestRatePct: interestPct,
        rank: playerIdToRank[p] + 1,
        alivePlayers: aliveTracker.ks,
        ongoingAttacks: attacksCount,
        ongoingAttacksCount: attacksCount,
        activeBoats: boatsCount,
        activeBoatsCount: boatsCount,
        neighbors: this.getNeighbors(p)
      };
    },

    /**
     * Lists all adjacent territories (512 = Neutral, 0..511 = Players).
     */
    getNeighbors: function(playerId) {
      var p = playerId !== undefined ? playerId : gameConfig.em;
      if (!playerData || !playerData.mv || !playerData.mv[p] || !playerData.gh[p]) return [];
      var borders = playerData.gh[p];
      var offsets = pixelGrid.f4;
      var seen = {};
      var result = [];
      for (var i = 0; i < borders.length; i++) {
        var b = borders[i];
        for (var d = 0; d < 4; d++) {
          var adj = b + offsets[d];
          if (pixelGrid.et(adj)) {
            if (!seen[512]) {
              seen[512] = true;
              result.push({
                id: 512,
                name: "Neutral Land",
                isNeutral: true,
                troops: 0,
                territory: 0,
                alreadyAttacking: attackTracker.jh(p, 512)
              });
            }
          } else if (pixelGrid.gb(adj)) {
            var owner = pixelGrid.eu(adj);
            if (owner !== p && !seen[owner] && borderManager.ev(p, owner)) {
              seen[owner] = true;
              result.push({
                id: owner,
                name: (playerData.a1S && playerData.a1S[owner]) ? playerData.a1S[owner] : ("Bot #" + owner),
                isNeutral: false,
                troops: playerData.h3[owner],
                territory: playerData.gp[owner],
                alreadyAttacking: attackTracker.jh(p, owner)
              });
            }
          }
        }
      }
      return result;
    },

    /**
     * Returns valid actions for `playerId` (default 0).
     */
    getActionMask: function(playerId) {
      var p = playerId !== undefined ? playerId : gameConfig.em;
      if (!playerData || !playerData.mv || !playerData.mv[p]) {
        return {
          canExpandNeutral: false,
          attackableEnemyIds: [],
          canLaunchBoat: false,
          canCrossMountain: false,
          ongoingAttackTargetIds: []
        };
      }
      var neighbors = this.getNeighbors(p);
      var canExpandNeutral = false;
      var attackableEnemyIds = [];
      for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i].isNeutral) {
          canExpandNeutral = true;
        } else {
          attackableEnemyIds.push(neighbors[i].id);
        }
      }
      var ongoingIds = [];
      var count = attackTracker.g8(p);
      for (var j = 0; j < count; j++) {
        ongoingIds.push(attackTracker.gD(p, j));
      }
      var canLaunchBoat = Boolean(navalSystem && navalSystem.mS && navalSystem.mS.mT(p));
      var canCrossMountain = Boolean(
        mapManager.eh(mapManager.ei) &&
        gameConfig.data.passableMountains &&
        playerData.fR[p] &&
        playerData.fR[p].length > 0
      );
      return {
        canExpandNeutral: canExpandNeutral,
        attackableEnemyIds: attackableEnemyIds,
        canLaunchBoat: canLaunchBoat,
        canCrossMountain: canCrossMountain,
        ongoingAttackTargetIds: ongoingIds
      };
    },

    /**
     * Sends an attack command (ratio0to1: 0.0..1.0, targetId: 512 for neutral or 0..511 for player).
     */
    attack: function(targetId, ratio0to1, playerId) {
      var p = playerId !== undefined ? playerId : gameConfig.em;
      var r = ratio0to1 !== undefined ? Number(ratio0to1) : 0.25;
      var ib = Math.max(0, Math.min(1023, Math.floor(r * 1023)));
      actionDispatcher.pD.hY(p, ib, Number(targetId));
    },

    /**
     * Cancels an ongoing attack against `targetId`.
     */
    cancelAttack: function(targetId, playerId) {
      var p = playerId !== undefined ? playerId : gameConfig.em;
      actionDispatcher.pD.pU(p, Number(targetId));
    },

    /**
     * Unified RL action interface: executes land attack, mountain attack, boat launch/intercept, or cancelAttack.
     */
    act: function(actionObj, playerId) {
      var p = playerId !== undefined ? playerId : gameConfig.em;
      if (!actionObj || !actionObj.type || actionObj.type === "noop") {
        return this.getObservation(p);
      }
      var ratio = actionObj.ratio !== undefined ? Number(actionObj.ratio) : 0.25;
      var ib = Math.max(0, Math.min(1023, Math.floor(ratio * 1023)));
      var tId = actionObj.targetId !== undefined ? Number(actionObj.targetId) : 512;

      if (actionObj.type === "attack") {
        actionDispatcher.pD.hY(p, ib, tId);
      } else if (actionObj.type === "cancelAttack") {
        actionDispatcher.pD.pU(p, tId);
      } else if (actionObj.type === "mountainAttack" && actionObj.targetCoord !== undefined) {
        actionDispatcher.pD.hU(p, ib, Number(actionObj.targetCoord), tId);
      } else if (actionObj.type === "launchBoat" && actionObj.targetCoord !== undefined) {
        var dir = actionObj.direction !== undefined ? Number(actionObj.direction) & 7 : 0;
        var pP = (Number(actionObj.targetCoord) << 3) + dir;
        actionDispatcher.pD.hd(p, ib, pP);
      } else if (actionObj.type === "interceptBoat" && actionObj.boatId !== undefined) {
        actionDispatcher.pD.hg(p, ib, Number(actionObj.boatId));
      }
      return this.getObservation(p);
    },

    /**
     * Returns metadata for all 24 maps in the engine.
     */
    getMapList: function() {
      if (!mapManager || !mapManager.xG || !mapManager.xG.xH) return [];
      var list = [];
      for (var i = 0; i < 24; i++) {
        var m = mapManager.xG.xH[i];
        var isRealistic = (i >= 10 && i <= 19) || i === 22 || i === 23;
        list.push({
          index: i,
          name: m && m.name ? m.name : ("Map " + i),
          isRealistic: isRealistic
        });
      }
      return list;
    }
  };
"""


def pretty_print_js(js_code: str) -> str:
    """
    String-safe and comment-safe JavaScript formatter.
    Never modifies characters inside string literals ("...", '...') or comments (/* ... */, // ...).
    """
    out = []
    n = len(js_code)
    i = 0
    in_str = None
    in_line_comment = False
    in_block_comment = False
    paren_depth = 0
    indent = 2

    while i < n:
        ch = js_code[i]
        nxt = js_code[i + 1] if i + 1 < n else ""

        if in_line_comment:
            out.append(ch)
            if ch == "\n":
                in_line_comment = False
                out.append("  " * indent)
            i += 1
            continue

        if in_block_comment:
            out.append(ch)
            if ch == "*" and nxt == "/":
                out.append("/")
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_str is not None:
            out.append(ch)
            if ch == "\\":
                if i + 1 < n:
                    out.append(js_code[i + 1])
                    i += 2
                    continue
            elif ch == in_str:
                in_str = None
            i += 1
            continue

        # Check start of comments
        if ch == "/" and nxt == "/":
            in_line_comment = True
            out.append("//")
            i += 2
            continue
        if ch == "/" and nxt == "*":
            in_block_comment = True
            out.append("/*")
            i += 2
            continue

        # Check start of string literals
        if ch in ('"', "'"):
            in_str = ch
            out.append(ch)
            i += 1
            continue

        # Track parentheses so `for (var i = 0; i < n; i++)` stays on one line
        if ch == "(":
            paren_depth += 1
            out.append(ch)
            i += 1
            continue
        if ch == ")":
            paren_depth = max(0, paren_depth - 1)
            out.append(ch)
            i += 1
            continue

        # Skip existing raw newlines outside strings to normalize indentation
        if ch in ("\r", "\n"):
            i += 1
            continue

        if ch == "{":
            indent += 1
            out.append(" {\n" + "  " * indent)
        elif ch == "}":
            indent = max(0, indent - 1)
            out.append("\n" + "  " * indent + "}")
            j = i + 1
            while j < n and js_code[j] in (" ", "\t", "\r", "\n"):
                j += 1
            if j < n and js_code[j] not in (";", ",", ")", "]"):
                out.append("\n" + "  " * indent)
        elif ch == ";" and paren_depth == 0:
            out.append(";\n" + "  " * indent)
        else:
            out.append(ch)

        i += 1

    return "".join(out)


def process_file(input_path: str, output_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Extract String Table `var S=[...];`
    s_match = re.search(r"var S=(\[.*?\]);", html, re.DOTALL)
    s_table = json.loads(s_match.group(1)) if s_match else []

    # 2. Extract Localization Table `this.L84=[...];`
    l_match = re.search(r"this\.L84=(\[.*?\]);", html, re.DOTALL)
    l_table = json.loads(l_match.group(1)) if l_match else []

    # 3. Disable crash telemetry WebSocket in `function q()` AND offline lobby WebSocket in `aV1`
    html = html.replace(
        'function q(){b=new WebSocket("wss://territorial.io/s52/");b.onopen=a3;',
        'function q(){return;b=new WebSocket("wss://territorial.io/s52/");b.onopen=a3;'
    )
    html = html.replace(
        'b=new WebSocket(lh);',
        'if(window.__TERRITORIAL_OFFLINE__!==false){b={readyState:3,CONNECTING:0,OPEN:1,send:function(){},close:function(){}};return;}b=new WebSocket(lh);'
    )

    # 4. Tokenize <script> body so we NEVER touch string literals ("..." or '...')
    script_start = html.find("<script>") + len("<script>")
    script_end = html.rfind("</script>")
    js_code = html[script_start:script_end]

    # Regex that matches string literals OR comments OR `S[num]` OR `L(num)` OR identifiers
    token_pattern = re.compile(
        r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|//[^\n]*|/\*[\s\S]*?\*/|\bS\[(\d+)\]|\bL\((\d+)\b|\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b)'
    )

    def replacer(match):
        full = match.group(1)
        s_idx = match.group(2)
        l_idx = match.group(3)
        ident = match.group(4)

        # Keep string literals and comments untouched
        if full.startswith(('"', "'", "//", "/*")):
            return full
        # Inline S[index]
        if s_idx is not None:
            idx = int(s_idx)
            if 0 <= idx < len(s_table):
                return json.dumps(s_table[idx], ensure_ascii=False)
            return full
        # Annotate L(index)
        if l_idx is not None:
            idx = int(l_idx)
            if 0 <= idx < len(l_table):
                safe_comment = l_table[idx].replace("*/", "").replace("\n", " ")[:40]
                return f'L({idx} /* "{safe_comment}" */'
            return full
        # Rename obfuscated symbols (only when not preceded by `.` and not an object key followed by `:`)
        if ident is not None and ident in SYMBOL_MAP:
            start_pos = match.start()
            end_pos = match.end()
            if start_pos > 0 and js_code[start_pos - 1] == '.':
                return full
            if end_pos < len(js_code) and js_code[end_pos] == ':':
                return full
            return SYMBOL_MAP[ident]
        return full

    transformed_js = token_pattern.sub(replacer, js_code)

    # 5. Comment- and String-Safe Pretty-Print
    formatted_js = pretty_print_js(transformed_js)

    # 6. Inject window.TerritorialGym right before the closing IIFE `})();`
    closing_iife_idx = formatted_js.rfind("})();")
    if closing_iife_idx != -1:
        formatted_js = (
            formatted_js[:closing_iife_idx]
            + "\n" + GYM_INJECTION_CODE + "\n"
            + formatted_js[closing_iife_idx:]
        )

    final_html = html[:script_start] + "\n" + formatted_js + "\n  " + html[script_end:]
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(final_html)
    print(f"Done! Wrote deobfuscated & AI-Gym enabled file to: {output_path} ({len(final_html)} bytes, {final_html.count(chr(10))} lines)")


if __name__ == "__main__":
    inp = sys.argv[1] if len(sys.argv) > 1 else "name.html"
    out = sys.argv[2] if len(sys.argv) > 2 else "territorial_deobfuscated_full.html"
    if not Path(inp).exists() and Path("public/assets/aistudio/text_3a771d76.html").exists():
        shutil.copy("public/assets/aistudio/text_3a771d76.html", inp)
    process_file(inp, out)
