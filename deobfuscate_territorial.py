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

VIRTUAL_SERVER_CODE = r"""
  // =========================================================================
  // BROWSER & OFFLINE VIRTUAL TERRITORIAL MULTIPLAYER SERVER (Menu 29 & Matches)
  // =========================================================================
  function VirtualBitWriter() {
    var bits = [];
    this.write = function(size, val) {
      for (var i = size - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    };
    this.writeUN = function(size, val) {
      var fM = size >> 1;
      var f5 = 1 << fM;
      this.write(size - fM, Math.floor(val / f5));
      this.write(fM, val % f5);
    };
    this.writeStr = function(s, xk) {
      xk = xk || 5;
      this.write(xk, s.length);
      this.write(1, 0); // 7-bit ASCII
      for (var i = 0; i < s.length; i++) {
        this.write(7, s.charCodeAt(i) & 0x7F);
      }
    };
    this.writeWvStr = function(s, lenBits) {
      this.write(lenBits, s.length);
      for (var i = 0; i < s.length; i++) {
        this.write(16, s.charCodeAt(i));
      }
    };
    this.toBytes = function() {
      var totalBytes = Math.ceil(bits.length / 8);
      var buf = new Uint8Array(totalBytes);
      for (var i = 0; i < bits.length; i++) {
        buf[i >> 3] |= bits[i] << (7 - (i & 7));
      }
      return buf;
    };
  }

  function VirtualBitReader(buf) {
    this.size = buf.length;
    this.eA = 0;
    this.aC = buf;
    this.pw = function(size) {
      var fT = 0;
      var nd = this.eA + size - 1;
      for (var aB = this.eA; aB <= nd; aB++) {
        fT |= ((this.aC[aB >> 3] >> (7 - (aB & 7))) & 1) << (nd - aB);
      }
      this.eA += size;
      return fT;
    };
    this.readStr = function(xk) {
      var size = this.pw(xk);
      var is16 = this.pw(1);
      var bits = is16 ? 16 : 7;
      var res = "";
      for (var i = 0; i < size; i++) {
        res += String.fromCharCode(this.pw(bits));
      }
      return res;
    };
  }

  window.VirtualTerritorialServer = {
    active: true,
    serverMode: "virtual-local",
    lobbyInterval: null,
    matchInterval: null,
    currentRoom: 0,
    chatSeq: 1,
    matchTickCount: 0,
    hasQueuedBotSpawns: false,
    pendingActions: [],
    rooms: [
      { countdown: 10, mapIndex: 10, mapSeed: 14071, mode: 0, nextMode: 2, maxPlayers: 50, isContest: 0, duration: 1200 },
      { countdown: 16, mapIndex: 11, mapSeed: 9999, mode: 7, nextMode: 10, maxPlayers: 80, isContest: 1, duration: 1500 },
      { countdown: 12, mapIndex: 0, mapSeed: 1234, mode: 8, nextMode: 8, maxPlayers: 2, isContest: 0, duration: 600 },
      { countdown: 14, mapIndex: 14, mapSeed: 5678, mode: 9, nextMode: 9, maxPlayers: 30, isContest: 0, duration: 1200 }
    ],

    createSocket: function(url, onOpen, onMessage, onClose, onError) {
      var self = this;
      var isVirtual = true;
      var isOpened = false;

      var openTimer = setTimeout(function() {
        if (!isVirtual) return;
        isOpened = true;
        if (typeof onOpen === "function") onOpen();
      }, 15);

      var wrapper = {
        get readyState() {
          return isVirtual ? (isOpened ? 1 : 0) : 3;
        },
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3,
        send: function(data) {
          if (isVirtual && isOpened) {
            var copy = new Uint8Array(data);
            setTimeout(function() {
              if (isVirtual) {
                self.handleClientPacket(copy, onMessage);
              }
            }, 5);
          }
        },
        close: function(code) {
          clearTimeout(openTimer);
          isVirtual = false;
          isOpened = false;
        }
      };

      return wrapper;
    },

    ensureAccountId: function() {
      if (typeof storageManager !== "undefined" && storageManager.eO && storageManager.eO.data && storageManager.eO.data[105]) {
        if (!storageManager.eO.data[105].value || storageManager.eO.data[105].value.length === 0) {
          if (storageManager.sG && typeof storageManager.sG.sH === "function") {
            storageManager.sG.sH(105, "aBc12");
            storageManager.sG.sH(106, "aBc12dEf34gHi56");
          } else {
            storageManager.eO.data[105].value = "aBc12";
          }
        }
      }
    },

    getLocalT3: function() {
      this.ensureAccountId();
      if (typeof bG !== "undefined" && bG.t8 && typeof storageManager !== "undefined" && storageManager.eO && storageManager.eO.data[105]) {
        return bG.t8.x8(storageManager.eO.data[105].value, 5);
      }
      return 1234567;
    },

    getLocalName: function() {
      if (typeof storageManager !== "undefined" && storageManager.eO && storageManager.eO.data && storageManager.eO.data[122] && storageManager.eO.data[122].value) {
        var name = storageManager.eO.data[122].value.trim().slice(0, 20);
        if (name.length > 0) return name;
      }
      return "Commander";
    },

    getLocalColor18: function() {
      if (typeof utils !== "undefined" && utils.color && typeof storageManager !== "undefined" && storageManager.y) {
        var rgb = utils.color.a3m(storageManager.y.wV());
        return ((rgb[0] & 63) << 12) | ((rgb[1] & 63) << 6) | (rgb[2] & 63);
      }
      return (14 << 12) | (48 << 6) | 58;
    },

    handleClientPacket: function(data, onMessage) {
      var self = this;
      var buf = new Uint8Array(data);
      var br = new VirtualBitReader(buf);
      var isGameplay = br.pw(1);

      if (!isGameplay) {
        var opcode = br.pw(6);

        // Opcode 13: Client Socket Handshake (aTn) -> Reply with Server Opcode 9 (aU4, 165 bits)
        if (opcode === 13) {
          self.ensureAccountId();
          var bw = new VirtualBitWriter();
          bw.write(1, 0);
          bw.write(6, 9); // Server Opcode 9 (aU4)
          bw.write(3, 0); // aUJ = 0
          bw.write(30, 100);
          bw.write(30, 200);
          bw.write(5, 1);
          bw.write(30, 300);
          bw.write(30, 400);
          bw.write(30, 500);
          onMessage({ data: bw.toBytes().buffer });
        }
        // Opcode 15: Account / Profile / Logout Request (eY)
        else if (opcode === 15) {
          var reqId = br.pw(6);
          if (reqId === 0) {
            var bw10 = new VirtualBitWriter();
            bw10.write(1, 0);
            bw10.write(6, 10);
            for (var k = 0; k < 20; k++) {
              bw10.write(6, (k + 1) & 63);
            }
            onMessage({ data: bw10.toBytes().buffer });
            self.sendAuthOkPacket(onMessage, 1);
          } else if (reqId === 2) {
            self.sendAccountProfilePacket(onMessage);
          } else if (reqId === 3) {
            self.sendAuthOkPacket(onMessage, 21);
          }
        }
        // Opcode 17: Account Auth (aUc) -> Reply with Opcode 11 (aU6, id=1)
        else if (opcode === 17) {
          self.sendAuthOkPacket(onMessage, 1);
        }
        // Opcode 18: Change Password (aR1) -> Reply with Opcode 11 (aU6, id=22)
        else if (opcode === 18) {
          self.sendAuthOkPacket(onMessage, 22);
        }
        // Opcode 21, 22, 28: Request Leaderboards / Clan Standings / Audit Log -> Reply with Server Opcode 13 (aU8)
        else if (opcode === 21 || opcode === 22 || opcode === 28) {
          var tO = br.pw(6);
          self.sendLeaderboardPacket(onMessage, tO);
        }
        // Opcode 23, 24: Request Clan Rating History Charts -> Reply with Server Opcode 14 (aU9)
        else if (opcode === 23 || opcode === 24) {
          self.sendClanChartPacket(onMessage);
        }
        // Opcode 25: Inspect Player Account Profile (aPI) -> Reply with Server Opcode 12 (aU7)
        else if (opcode === 25) {
          self.sendAccountProfilePacket(onMessage);
        }
        // Opcode 1: Enter Multiplayer Lobby (aH0) -> Reply with Server Opcode 2 (aU2)
        else if (opcode === 1) {
          var clientVer = br.pw(10);
          var prefRoom = br.pw(2);
          self.currentRoom = prefRoom & 3;
          self.rooms[0].countdown = 9;
          self.rooms[1].countdown = 14;
          self.rooms[2].countdown = 10;
          self.rooms[3].countdown = 12;
          self.rooms[self.currentRoom].countdown = 8;
          self.sendLobbyPacket(onMessage);
          self.startLobbyLoop(onMessage);
        }
        // Opcode 2: In-Lobby Actions (aFW)
        else if (opcode === 2) {
          var subOp = br.pw(3);
          if (subOp === 2) {
            var roomIdx = br.pw(2);
            self.currentRoom = roomIdx & 3;
            if (self.rooms[self.currentRoom].countdown < 4) {
              self.rooms[self.currentRoom].countdown = 7;
            }
          } else if (subOp === 3) {
            var chatText = br.readStr(7);
            self.sendChatPacket(onMessage, self.currentRoom, self.getLocalT3(), chatText);
          } else if (subOp === 4) {
            if (typeof bn !== "undefined" && bn.y && bn.y.rs && bn.y.rs[3] === 1) {
              if (self.rooms[self.currentRoom].countdown > 2) {
                self.rooms[self.currentRoom].countdown = 2;
              }
            }
          }
        }
        // Opcode 5: Join Match on Game Server (aHP)
        else if (opcode === 5) {
          self.startMatchLoop(onMessage);
        }
        return;
      }

      // Gameplay Actions (isGameplay === 1)
      var actionId = br.pw(4);
      var p = (typeof gameConfig !== "undefined") ? gameConfig.em : 0;
      if (actionId === 0) {
        self.pendingActions.push({ id: 0, player: p, a: br.pw(22) });
      } else if (actionId === 1) {
        self.pendingActions.push({ id: 1, player: p, a: br.pw(10), b: br.pw(10) });
      } else if (actionId === 2) {
        self.pendingActions.push({ id: 2, player: p, a: br.pw(10), b: br.pw(9) });
      } else if (actionId === 3) {
        self.pendingActions.push({ id: 3, player: p, a: br.pw(10), b: br.pw(27) });
      } else if (actionId === 4) {
        self.pendingActions.push({ id: 4, player: p, a: br.pw(10), b: br.pw(16) });
      } else if (actionId === 5 || actionId === 6) {
        self.pendingActions.push({ id: actionId, player: p, a: br.pw(10) });
      } else if (actionId === 7) {
        self.pendingActions.push({ id: 7, player: p, a: br.pw(1) });
      } else if (actionId === 8) {
        self.pendingActions.push({ id: 8, player: p });
      } else if (actionId === 10) {
        var ib = br.pw(10);
        var jV = br.pw(10);
        var eo = br.pw(22);
        self.pendingActions.push({ id: 10, player: p, a: (ib << 10) | jV, b: eo });
      } else if (actionId === 13) {
        var targetEnemy = br.pw(9);
        var bwPing = new VirtualBitWriter();
        bwPing.write(1, 1);
        bwPing.write(1, 1);
        bwPing.write(2, 2);
        bwPing.write(9, p);
        bwPing.write(9, targetEnemy);
        onMessage({ data: bwPing.toBytes().buffer });
      } else if (actionId === 14) {
        var peaceTarget = br.pw(9);
        setTimeout(function() {
          var bwPeace = new VirtualBitWriter();
          bwPeace.write(1, 1);
          bwPeace.write(1, 1);
          bwPeace.write(2, 1);
          bwPeace.write(9, peaceTarget);
          onMessage({ data: bwPeace.toBytes().buffer });
        }, 250);
      } else if (actionId === 15) {
        var emojiRecipient = br.pw(9);
        var emojiId = br.pw(10);
        setTimeout(function() {
          var bwEmoji = new VirtualBitWriter();
          bwEmoji.write(1, 1);
          bwEmoji.write(1, 1);
          bwEmoji.write(2, 0);
          bwEmoji.write(9, emojiRecipient);
          bwEmoji.write(10, emojiId);
          onMessage({ data: bwEmoji.toBytes().buffer });
        }, 220);
      }
    },

    sendAuthOkPacket: function(onMessage, statusId) {
      var bw = new VirtualBitWriter();
      bw.write(1, 0);
      bw.write(6, 11); // Server Opcode 11 (aU6)
      bw.write(6, statusId || 1);
      bw.write(30, 0);
      onMessage({ data: bw.toBytes().buffer });
    },

    sendAccountProfilePacket: function(onMessage) {
      var self = this;
      var bw = new VirtualBitWriter();
      bw.write(1, 0);
      bw.write(6, 12); // Server Opcode 12 (aU7)
      bw.write(30, 11);
      bw.write(16, 1680);
      bw.write(30, 11);
      bw.write(30, 142);
      bw.write(30, 94);
      bw.writeUN(32, 250000);
      bw.writeStr(self.getLocalName(), 5);
      bw.writeStr("EMP", 3);
      bw.writeStr("EMP", 3);
      bw.writeUN(32, 18450);
      bw.writeUN(32, 12400);
      bw.write(30, 14);
      bw.writeUN(32, 48000);
      bw.writeUN(32, 36000);
      bw.writeUN(32, 15000);
      bw.writeUN(32, 9500);
      bw.writeUN(32, 5200);
      bw.writeUN(30, 1280);
      bw.writeUN(32, 19500);
      bw.writeStr("US", 3);
      bw.writeUN(2, 1);
      bw.writeUN(10, 12);
      bw.writeStr("Verified Territorial Account", 8);
      bw.writeUN(5, 8);
      bw.write(30, 5);
      bw.write(30, 10);
      bw.writeUN(32, 100000);
      bw.write(3, 2);
      bw.write(8, 12);
      bw.write(1, 1);
      bw.write(1, 1);
      bw.writeUN(32, 50000);
      bw.write(30, 100);
      bw.write(30, 200);
      bw.write(1, 1);
      onMessage({ data: bw.toBytes().buffer });
    },

    sendLeaderboardPacket: function(onMessage, tO) {
      var self = this;
      var bw = new VirtualBitWriter();
      bw.write(1, 0);
      bw.write(6, 13); // Server Opcode 13 (aU8)
      bw.write(6, tO);
      var bots = self.getFullBotPool();
      var f2 = 10;
      bw.write(10, f2);

      if (tO === 9 || tO === 10 || tO === 11) {
        for (var i = 0; i < f2; i++) {
          bw.write(30, i + 1);
          bw.writeStr(bots[i].name, 5);
          bw.writeUN(32, (20 - i) * 12500);
          bw.write(30, bots[i].id);
        }
      } else if (tO === 12) {
        for (var j = 0; j < f2; j++) {
          bw.write(20, j + 1);
          bw.write(30, bots[j].id);
          bw.write(30, bots[j + 1].id);
          bw.writeUN(32, (10 - j) * 500);
          bw.write(30, 1000 + j);
          bw.writeStr(bots[j].name, 5);
          bw.writeStr(bots[j + 1].name, 5);
        }
      } else if (tO === 0) {
        var clans = ["CORGI", "OG", "VOID", "EMP", "UNION", "MAC", "ROM", "NATO", "APEX", "SPQR"];
        var hy0 = 0;
        for (var c0 = 0; c0 < f2; c0++) hy0 += clans[c0].length;
        bw.write(16, hy0);
        for (var c = 0; c < f2; c++) {
          bw.write(30, c + 1);
          bw.writeWvStr(clans[c], 5);
          bw.write(16, 4800 - c * 310);
          bw.write(30, 920 - c * 45);
          bw.write(30, 180 - c * 12);
        }
      } else if (tO === 1) {
        var hy1 = 0;
        for (var m0 = 0; m0 < f2; m0++) {
          hy1 += 3 + bots[m0].name.slice(0, 15).length;
        }
        bw.write(16, hy1);
        for (var m = 0; m < f2; m++) {
          bw.write(16, m + 1);
          bw.writeWvStr("EMP", 3);
          bw.write(16, bots[m].elo);
          bw.writeWvStr(bots[m].name.slice(0, 15), 5);
          bw.write(31, (15 - m) * 8400);
          bw.write(30, bots[m].id);
        }
      } else if (tO === 2 || tO === 3) {
        var hy2 = 0;
        for (var p0 = 0; p0 < f2; p0++) {
          hy2 += bots[p0].name.slice(0, 15).length;
        }
        bw.write(16, hy2);
        for (var p = 0; p < f2; p++) {
          bw.write(30, p + 1);
          bw.writeWvStr(bots[p].name.slice(0, 15), 5);
          bw.writeUN(32, bots[p].elo * 100);
          bw.write(30, 240 - p * 11);
          bw.write(30, bots[p].id);
        }
      } else {
        var hyOther = 0;
        for (var k0 = 0; k0 < f2; k0++) {
          hyOther += bots[k0].name.slice(0, 12).length + bots[k0 + 1].name.slice(0, 12).length;
        }
        bw.write(16, hyOther);
        for (var k = 0; k < f2; k++) {
          bw.write(20, k + 1);
          bw.write(30, k + 1);
          bw.write(30, bots[k].id);
          bw.write(30, bots[k + 1].id);
          bw.write(30, 100 + k);
          bw.writeUN(32, 5000);
          bw.write(30, 200 + k);
          bw.writeWvStr(bots[k].name.slice(0, 12), 5);
          bw.writeWvStr(bots[k + 1].name.slice(0, 12), 5);
        }
      }
      onMessage({ data: bw.toBytes().buffer });
    },

    sendClanChartPacket: function(onMessage) {
      var clans = ["CORGI", "OG", "VOID", "EMP", "UNION"];
      var aUR = clans.length;
      var ptsPerClan = 16;
      var aUS = 0;
      for (var i = 0; i < aUR; i++) aUS += clans[i].length;
      var aUT = aUR * ptsPerClan;

      var bw = new VirtualBitWriter();
      bw.write(1, 0);
      bw.write(6, 14); // Server Opcode 14 (aU9)
      bw.write(4, aUR);
      bw.write(7, aUS);
      bw.write(11, aUT);
      for (var c = 0; c < aUR; c++) {
        bw.writeWvStr(clans[c], 3);
        bw.write(8, ptsPerClan);
        for (var p = 0; p < ptsPerClan; p++) {
          var val = Math.max(500, 14000 - c * 2200 + Math.floor(Math.sin(p * 0.5 + c) * 900) + p * 180);
          bw.write(16, val);
        }
      }
      onMessage({ data: bw.toBytes().buffer });
    },

    sendChatPacket: function(onMessage, roomIdx, senderT3, messageText) {
      var self = this;
      var bw = new VirtualBitWriter();
      bw.write(1, 0);
      bw.write(6, 17); // Server Opcode 17 (aUC)
      bw.write(4, roomIdx & 3);
      bw.write(20, self.chatSeq++);
      bw.write(6, 1);  // 1 message
      bw.write(3, 0);  // id = 0 (chat text)
      bw.write(30, senderT3);
      bw.writeStr(messageText, 7);
      onMessage({ data: bw.toBytes().buffer });
    },

    getFullBotPool: function() {
      if (this._botPool) return this._botPool;
      var roster = [
        { name: "[EMP] Napoleon", badge: 4, rank: 0, elo: 2040, r: 58, g: 14, b: 14, gold: 820 },
        { name: "[CORGI] CorgiKing", badge: 9, rank: 1, elo: 1985, r: 60, g: 44, b: 12, gold: 640 },
        { name: "[OG] Vanguard", badge: 8, rank: 2, elo: 1940, r: 14, g: 38, b: 60, gold: 590 },
        { name: "[VOID] Eclipse", badge: 7, rank: 3, elo: 1910, r: 28, g: 12, b: 54, gold: 510 },
        { name: "[MAC] Alexander", badge: 8, rank: 4, elo: 1885, r: 14, g: 48, b: 58, gold: 470 },
        { name: "[UNION] Ironclad", badge: 6, rank: 5, elo: 1860, r: 18, g: 52, b: 30, gold: 430 },
        { name: "[ROM] Caesar", badge: 6, rank: 6, elo: 1840, r: 56, g: 46, b: 10, gold: 410 },
        { name: "[NATO] Striker", badge: 5, rank: 7, elo: 1815, r: 12, g: 30, b: 58, gold: 390 },
        { name: "[APEX] Hyperion", badge: 9, rank: 8, elo: 1795, r: 60, g: 22, b: 36, gold: 370 },
        { name: "[FRK] Charlemagne", badge: 5, rank: 9, elo: 1775, r: 16, g: 52, b: 24, gold: 350 },
        { name: "[CORGI] Biscuit", badge: 4, rank: 10, elo: 1760, r: 58, g: 42, b: 16, gold: 330 },
        { name: "[ATH] Athena", badge: 9, rank: 12, elo: 1745, r: 44, g: 20, b: 58, gold: 510 },
        { name: "[CAR] Hannibal", badge: 6, rank: 14, elo: 1725, r: 60, g: 32, b: 10, gold: 290 },
        { name: "[SPQR] Centurion", badge: 6, rank: 15, elo: 1710, r: 54, g: 16, b: 18, gold: 280 },
        { name: "[OG] ShadowFax", badge: 7, rank: 17, elo: 1695, r: 20, g: 44, b: 56, gold: 260 },
        { name: "[VOID] Nightfall", badge: 8, rank: 19, elo: 1680, r: 34, g: 16, b: 52, gold: 245 },
        { name: "[UNION] Valkyrie", badge: 5, rank: 21, elo: 1665, r: 22, g: 54, b: 34, gold: 230 },
        { name: "[NATO] Maverick", badge: 4, rank: 23, elo: 1650, r: 16, g: 34, b: 60, gold: 220 },
        { name: "OttoVonBismarck", badge: 3, rank: 25, elo: 1635, r: 28, g: 28, b: 32, gold: 210 },
        { name: "[APEX] Nova", badge: 7, rank: 27, elo: 1620, r: 58, g: 26, b: 40, gold: 195 },
        { name: "[CORGI] Waffle", badge: 4, rank: 29, elo: 1605, r: 56, g: 40, b: 18, gold: 185 },
        { name: "[EMP] Talleyrand", badge: 5, rank: 31, elo: 1590, r: 52, g: 18, b: 18, gold: 175 },
        { name: "SunTzu_ArtOfWar", badge: 8, rank: 33, elo: 1575, r: 54, g: 38, b: 14, gold: 320 },
        { name: "[SPQR] Scipio", badge: 6, rank: 35, elo: 1560, r: 50, g: 18, b: 20, gold: 165 },
        { name: "[OG] Frostbite", badge: 5, rank: 38, elo: 1545, r: 18, g: 50, b: 58, gold: 155 },
        { name: "Belisarius", badge: 6, rank: 40, elo: 1530, r: 46, g: 24, b: 54, gold: 150 },
        { name: "[VOID] Singularity", badge: 7, rank: 42, elo: 1515, r: 30, g: 14, b: 48, gold: 145 },
        { name: "[UNION] Polaris", badge: 4, rank: 45, elo: 1500, r: 24, g: 50, b: 36, gold: 140 },
        { name: "Saladin", badge: 5, rank: 48, elo: 1485, r: 56, g: 48, b: 16, gold: 135 },
        { name: "[NATO] Horizon", badge: 3, rank: 51, elo: 1470, r: 18, g: 36, b: 56, gold: 130 },
        { name: "GenghisKhan", badge: 8, rank: 54, elo: 1455, r: 52, g: 30, b: 16, gold: 125 },
        { name: "[APEX] Zenith", badge: 6, rank: 57, elo: 1440, r: 56, g: 24, b: 38, gold: 120 },
        { name: "[CORGI] Mochi", badge: 4, rank: 60, elo: 1425, r: 58, g: 46, b: 20, gold: 115 },
        { name: "AdmiralYi", badge: 9, rank: 63, elo: 1410, r: 16, g: 44, b: 52, gold: 210 },
        { name: "[EMP] Ney", badge: 5, rank: 66, elo: 1395, r: 54, g: 20, b: 20, gold: 110 },
        { name: "Spartacus", badge: 4, rank: 70, elo: 1380, r: 58, g: 22, b: 16, gold: 105 },
        { name: "[OG] Tempest", badge: 6, rank: 74, elo: 1365, r: 22, g: 46, b: 58, gold: 100 },
        { name: "CyrusTheGreat", badge: 7, rank: 78, elo: 1350, r: 52, g: 42, b: 18, gold: 95 },
        { name: "[VOID] Phantom", badge: 5, rank: 82, elo: 1335, r: 36, g: 18, b: 50, gold: 90 },
        { name: "[UNION] Sentinel", badge: 4, rank: 86, elo: 1320, r: 26, g: 52, b: 32, gold: 85 },
        { name: "Boudicca", badge: 6, rank: 90, elo: 1305, r: 56, g: 30, b: 22, gold: 80 },
        { name: "[NATO] Raptor", badge: 3, rank: 95, elo: 1290, r: 14, g: 32, b: 54, gold: 75 },
        { name: "Suleiman", badge: 7, rank: 100, elo: 1275, r: 20, g: 50, b: 28, gold: 160 },
        { name: "[APEX] Vortex", badge: 5, rank: 105, elo: 1260, r: 54, g: 22, b: 36, gold: 70 },
        { name: "GustavusAdolphus", badge: 6, rank: 110, elo: 1245, r: 18, g: 38, b: 58, gold: 110 },
        { name: "[SPQR] Aurelius", badge: 8, rank: 115, elo: 1230, r: 52, g: 18, b: 24, gold: 140 },
        { name: "JoanOfArc", badge: 9, rank: 120, elo: 1215, r: 24, g: 36, b: 60, gold: 190 },
        { name: "[CORGI] Nugget", badge: 4, rank: 125, elo: 1200, r: 58, g: 44, b: 22, gold: 65 },
        { name: "Subutai", badge: 5, rank: 130, elo: 1185, r: 48, g: 32, b: 18, gold: 60 },
        { name: "[OG] HorizonX", badge: 4, rank: 135, elo: 1170, r: 20, g: 48, b: 54, gold: 55 },
        { name: "Pyrrhus", badge: 3, rank: 140, elo: 1155, r: 54, g: 28, b: 24, gold: 50 },
        { name: "[VOID] Astral", badge: 6, rank: 145, elo: 1140, r: 32, g: 16, b: 46, gold: 45 },
        { name: "Vercingetorix", badge: 4, rank: 150, elo: 1125, r: 28, g: 48, b: 24, gold: 40 },
        { name: "[UNION] Atlas", badge: 5, rank: 155, elo: 1110, r: 22, g: 52, b: 38, gold: 35 },
        { name: "Arminius", badge: 3, rank: 160, elo: 1095, r: 48, g: 24, b: 20, gold: 30 }
      ];
      this._botPool = roster.map(function(item, idx) {
        return {
          id: 101 + idx,
          name: item.name,
          badge: item.badge,
          rank: item.rank,
          elo: item.elo,
          color: (item.r << 12) | (item.g << 6) | item.b,
          gold: item.gold
        };
      });
      return this._botPool;
    },

    getRoomPlayers: function(roomIdx, localT3, myName, myColor) {
      var bots = this.getFullBotPool();
      var me = { id: localT3, name: myName, badge: 8, rank: 11, elo: 1680, color: myColor, gold: 250 };
      if (roomIdx === 2) {
        // 1v1 Ranked Duel room: 2 players (You vs [EMP] Napoleon)
        return [me, bots[0]];
      }
      if (roomIdx === 0) {
        // Team Battle room: 42 players (You + 41 Clan/Solo players)
        return [me].concat(bots.slice(0, 41));
      }
      if (roomIdx === 1) {
        // Battle Royale Contest room: 54 players (You + 53 players)
        return [me].concat(bots.slice(0, 53));
      }
      // Zombie Defense room: 32 players (You + 31 Co-op defenders)
      return [me].concat(bots.slice(10, 41));
    },

    sendLobbyPacket: function(onMessage) {
      var self = this;
      if (self.matchInterval) {
        clearInterval(self.matchInterval);
        self.matchInterval = null;
      }
      var bw = new VirtualBitWriter();
      bw.write(1, 0); // control packet
      bw.write(6, 2); // Opcode 2 (aU2) - Opens Menu 29 Lobby

      var localT3 = self.getLocalT3();
      var myName = self.getLocalName();
      var myColor = self.getLocalColor18();

      for (var r = 0; r < 4; r++) {
        var rm = self.rooms[r];
        var nextMap = (rm.mapIndex + 1) % 24;
        bw.write(10, rm.countdown);
        bw.write(6, rm.mapIndex);
        bw.write(14, rm.mapSeed);
        bw.write(4, rm.mode);
        bw.write(6, nextMap); // Next Map Index (0..23)
        bw.write(4, rm.nextMode); // Next Mode
        bw.write(1, rm.isContest);
        bw.write(12, rm.duration);
        bw.write(14, 777 + r);

        var playerList = self.getRoomPlayers(r, localT3, myName, myColor);
        bw.write(16, playerList.length);
        bw.write(16, playerList.length); // Ready queue count (uG) = all players in room ready to launch!
        for (var p = 0; p < playerList.length; p++) {
          var pl = playerList[p];
          bw.write(30, pl.id);
          bw.writeStr(pl.name, 5);
          bw.write(4, pl.badge);
          bw.write(30, pl.rank);
          bw.write(7, 127);
          bw.write(16, pl.elo);
          bw.write(18, pl.color);
          bw.write(11, pl.gold);
          bw.write(12, 18 + (p % 40));
        }
      }

      var packet = bw.toBytes();
      onMessage({ data: packet.buffer });

      // Send authentic pre-game lobby messages from clan players
      setTimeout(function() {
        if (typeof bn !== "undefined" && bn.a21) {
          self.sendChatPacket(onMessage, self.currentRoom, 101, "GLHF! Click Ready or wait for timer to launch.");
        }
      }, 150);
      setTimeout(function() {
        if (typeof bn !== "undefined" && bn.a21) {
          self.sendChatPacket(onMessage, self.currentRoom, 102, "[CORGI] & [OG] stacking center-north, don't overlap spawns!");
        }
      }, 1200);
    },

    startLobbyLoop: function(onMessage) {
      var self = this;
      if (self.lobbyInterval) clearInterval(self.lobbyInterval);

      self.lobbyInterval = setInterval(function() {
        if (typeof bn === "undefined" || !bn.a21) {
          clearInterval(self.lobbyInterval);
          self.lobbyInterval = null;
          return;
        }
        for (var r = 0; r < 4; r++) {
          if (r !== self.currentRoom && self.rooms[r].countdown > 2) {
            self.rooms[r].countdown--;
          }
        }
        var activeRoom = self.rooms[self.currentRoom];
        if (activeRoom.countdown > 1) {
          activeRoom.countdown--;
          self.sendUpdatePacket(onMessage, false);
        } else if (activeRoom.countdown === 1) {
          activeRoom.countdown = 0;
          clearInterval(self.lobbyInterval);
          self.lobbyInterval = null;
          self.sendUpdatePacket(onMessage, true);
          self.startMatchLoop(onMessage);
        }
      }, 1000);
    },

    sendUpdatePacket: function(onMessage, isMatchStart) {
      var self = this;
      var bw = new VirtualBitWriter();
      bw.write(1, 0); // control packet
      bw.write(6, 16); // Opcode 16 (aUB) - Periodic lobby tick update
      bw.write(20, 284); // Online MP count
      bw.write(20, 419); // Online SP count
      bw.write(16, 0); // 0 player delta events

      var activeSocketIdx = (typeof networkManager !== "undefined" && networkManager.y) ? networkManager.y.a22 : 0;

      for (var r = 0; r < 4; r++) {
        var rm = self.rooms[r];
        if (r === self.currentRoom && isMatchStart) {
          bw.write(10, 0); // tx = 0 triggers bn.aDd.dl(r)
          bw.write(10, activeSocketIdx); // a29 = a22 for seamless direct pass
          bw.write(10, 1234); // aER (seed)
          // Rotate room properties
          bw.write(6, rm.mapIndex);
          bw.write(14, rm.mapSeed);
          bw.write(4, rm.mode);
          bw.write(6, (rm.mapIndex + 1) % 24);
          bw.write(4, rm.nextMode);
          bw.write(1, rm.isContest);
          bw.write(12, rm.duration);
          bw.write(14, 777 + r);
        } else {
          bw.write(10, Math.max(1, rm.countdown));
        }
      }

      var packet = bw.toBytes();
      onMessage({ data: packet.buffer });
    },

    startMatchLoop: function(onMessage) {
      var self = this;
      if (self.matchInterval) clearInterval(self.matchInterval);
      self.pendingActions = [];
      self.matchTickCount = 0;
      self.hasQueuedBotSpawns = false;
      var spawnTickToggle = 0;

      self.matchInterval = setInterval(function() {
        if (typeof titleScreenRenderer === "undefined" || typeof gameConfig === "undefined") return;
        var screenState = titleScreenRenderer.a24();

        // State 10: Transitioning from lobby to match -> First gameplay packet triggers ax.aHT() -> bn.aDd.aES()
        if (screenState === 10) {
          self.sendMatchTickPacket(onMessage);
          return;
        }

        if (screenState !== 8 || gameConfig.a0p === 0) {
          clearInterval(self.matchInterval);
          self.matchInterval = null;
          return;
        }

        // Ensure realistic map scanlines finish immediately if pending
        if (typeof mapManager !== "undefined" && mapManager.xP && mapManager.xP.aAB !== -1) {
          mapManager.xP.aMF = false;
          mapManager.xP.eV();
        }

        // Spawn Selection Phase (gameConfig.hP is truthy): send 1 packet every 90ms (~3.5s spawn phase)
        if (gameConfig.hP) {
          if (!self.hasQueuedBotSpawns && typeof pixelGrid !== "undefined" && typeof mapManager !== "undefined") {
            self.hasQueuedBotSpawns = true;
            var humanCount = gameConfig.kM || 0;
            var localPlayer = gameConfig.em;
            var totalPx = (mapManager.fD || 0) * (mapManager.fE || 0);
            if (totalPx > 0) {
              for (var p = 0; p < humanCount; p++) {
                if (p === localPlayer) continue;
                for (var attempt = 0; attempt < 60; attempt++) {
                  var px = ((p * 9973 + attempt * 7919 + 12345) % totalPx);
                  if (pixelGrid.et(px)) {
                    self.pendingActions.push({ id: 0, player: p, a: px });
                    break;
                  }
                }
              }
            }
          }
          spawnTickToggle = 1 - spawnTickToggle;
          if (spawnTickToggle === 1 || self.pendingActions.length > 0) {
            self.sendMatchTickPacket(onMessage);
          }
          return;
        }

        // Active Battle Phase (!gameConfig.hP): keep exactly 1 packet ready when abd reaches aHS * 7 - 1
        if (gameConfig.a0p === 1 && typeof gameLoop !== "undefined" && gameLoop.a0z && gameLoop.a0z.abf) {
          if (gameLoop.a0z.abf.length === 0 && gameLoop.a0z.abd >= gameLoop.a0z.aHS * 7 - 1) {
            self.stepVirtualHumanOpponents();
            self.sendMatchTickPacket(onMessage);
          }
        } else if (gameConfig.a0p === 2) {
          if (self.pendingActions.length > 0) {
            self.sendMatchTickPacket(onMessage);
          }
        }
      }, 45);
    },

    stepVirtualHumanOpponents: function() {
      var self = this;
      self.matchTickCount++;
      if (self.matchTickCount % 2 !== 0) return;
      if (typeof gameConfig === "undefined" || typeof playerData === "undefined" || typeof attackTracker === "undefined" || !window.TerritorialGym) return;

      var humanCount = gameConfig.kM || 0;
      var localPlayer = gameConfig.em;
      for (var p = 0; p < humanCount; p++) {
        if (p === localPlayer) continue;
        if (!playerData.mv || playerData.mv[p] !== 1) continue;
        if (attackTracker.g8(p) > 0) continue;

        var neighbors = window.TerritorialGym.getNeighbors(p);
        var hasNeutral = false;
        var weakestEnemy = null;
        var frontlineAlly = null;

        for (var i = 0; i < neighbors.length; i++) {
          var nb = neighbors[i];
          if (nb.isNeutral) {
            hasNeutral = true;
          } else {
            if (gameConfig.hv && typeof teamManager !== "undefined" && teamManager.f0 && teamManager.f0[p] === teamManager.f0[nb.id]) {
              if (!frontlineAlly || nb.territory > frontlineAlly.territory) {
                frontlineAlly = nb;
              }
              continue; // Same team in Team Mode
            }
            if (!weakestEnemy || nb.troops < weakestEnemy.troops) {
              weakestEnemy = nb;
            }
          }
        }

        var myTroops = playerData.h3[p];
        var redCap = (typeof economy !== "undefined" && economy.k2) ? economy.k2(p) : 10000;
        if (hasNeutral && myTroops > 250) {
          self.pendingActions.push({ id: 1, player: p, a: 210 + (p % 60), b: 512 });
        } else if (weakestEnemy && (myTroops > redCap * 0.45 || myTroops > weakestEnemy.troops * 1.3)) {
          self.pendingActions.push({ id: 1, player: p, a: 240 + (p % 100), b: weakestEnemy.id });
        } else if (!hasNeutral && !weakestEnemy && frontlineAlly && myTroops > redCap * 0.55) {
          // Landlocked in Team Mode -> Donate troops (id: 2) to a frontline teammate!
          self.pendingActions.push({ id: 2, player: p, a: 300, b: frontlineAlly.id });
        }
      }
    },

    sendMatchTickPacket: function(onMessage) {
      var self = this;
      var bw = new VirtualBitWriter();
      bw.write(1, 1); // Gameplay packet (aTy)
      bw.write(1, 0); // Tick action packet (aUH)

      while (self.pendingActions.length > 0) {
        var act = self.pendingActions.shift();
        bw.write(4, act.id);
        bw.write(9, act.player);
        if (act.id === 0) {
          bw.write(22, act.a);
        } else if (act.id === 1) {
          bw.write(10, act.a);
          bw.write(10, act.b);
        } else if (act.id === 2) {
          bw.write(10, act.a);
          bw.write(9, act.b);
        } else if (act.id === 3) {
          bw.write(10, act.a);
          bw.write(27, act.b);
        } else if (act.id === 4) {
          bw.write(10, act.a);
          bw.write(16, act.b);
        } else if (act.id === 5 || act.id === 6) {
          bw.write(10, act.a);
        } else if (act.id === 7) {
          bw.write(1, act.a);
        } else if (act.id === 10) {
          bw.write(20, act.a);
          bw.write(22, act.b);
        }
      }

      var packet = bw.toBytes();
      onMessage({ data: packet.buffer });
    }
  };
"""

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
    get lobbyManager() { return bn; },
    get storageManager() { return storageManager; },
    get networkManager() { return networkManager; },
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
          if (!gameConfig.kg && gameLoop.a0z && typeof gameLoop.a0z.aHS === "number") {
            gameLoop.a0z.aHS = 0;
            gameLoop.a0z.abd = 0;
          }
        }
        stepSimulationTick();
        if (!gameConfig.kg && gameLoop.a0z && typeof gameLoop.a0z.aHS === "number") {
          gameLoop.a0z.aHS = Math.floor(gameLoop.a0z.abd / 7);
        }
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
        'b=(window.VirtualTerritorialServer?window.VirtualTerritorialServer.createSocket(lh,aTm,aV3,aTt,aV4):new WebSocket(lh));'
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
            + "\n" + VIRTUAL_SERVER_CODE + "\n" + GYM_INJECTION_CODE + "\n"
            + formatted_js[closing_iife_idx:]
        )

    final_html = html[:script_start] + "\n" + formatted_js + "\n  " + html[script_end:]
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(final_html)
    print(f"Done! Wrote deobfuscated & AI-Gym enabled file to: {output_path} ({len(final_html)} bytes, {final_html.count(chr(10))} lines)")


if __name__ == "__main__":
    default_inp = "territorial build 2154 - 31 Jan 2026.html" if Path("territorial build 2154 - 31 Jan 2026.html").exists() else "name.html"
    inp = sys.argv[1] if len(sys.argv) > 1 else default_inp
    out = sys.argv[2] if len(sys.argv) > 2 else "territorial_deobfuscated_full.html"
    if not Path(inp).exists() and Path("public/assets/aistudio/text_3a771d76.html").exists():
        shutil.copy("public/assets/aistudio/text_3a771d76.html", inp)
    process_file(inp, out)

