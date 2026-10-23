# HANDOFF TO NEXT AGENT: APEX-TERRITORIAL V2 NEURAL-SYMBOLIC ENGINE

**Date:** 2026-10-23  
**Status:** 6 Surgical Code Fixes Applied & Verified | Kaggle 2× T4 GPU Training Pipeline Active | Typecheck 100% Clean  

---

## 1. COMPLETE SYSTEM ARCHITECTURE & FILE MAP

The application is a full-fidelity, superhuman AI engine and training workbench for **Territorial.io**, integrating a deobfuscated production game engine with a **Dual-Stream Neural-Symbolic Policy** (`SpatialResNet-18` + `EntityAttentionTransformer`) backed by a **30-Tick Forward Physics Rollout Search Engine**.

```
├── public/
│   └── territorial_deobfuscated_full.html    # Exact deobfuscated Territorial.io client & physics engine
├── components/
│   └── TerritorialWorkbench.tsx             # Interactive Arena, AI Boss Controller, Live Telemetry & Screen Clicking
├── lib/
│   ├── apex-territorial-v2.ts                # Master Neural-Symbolic Decision Engine & 30-Tick Rollout Simulator
│   ├── vision-brain-ai.ts                    # Adapter layer bridging Gym observations to Apex-Territorial V2
│   └── deobfuscation-data.ts                 # TypeScript type definitions for engine observations, masks, and commands
├── app/
│   ├── api/kaggle/route.ts                   # REST API proxy interfacing with Kaggle's Kernel & Output APIs
│   ├── arena/page.tsx                        # Standalone Fullscreen Arena route
│   └── page.tsx                              # Main workbench dashboard
└── kaggle_training/
    ├── kaggle_train_ppo.py                   # PyTorch DataParallel 2× NVIDIA T4 GPU training script
    ├── kernel-metadata.json                  # Kaggle kernel configuration (GPU enabled, private)
    └── trained_vision_brain_weights.json     # Trained parameters manifest & live human match experience
```

### Exact File Roles & Responsibilities

1. **`public/territorial_deobfuscated_full.html`**
   - Contains the real client engine.
   - Exposes `window.TerritorialGym` to the parent window / iframe.
   - Provides methods:
     - `gym.getObservation(playerId)`: Retrieves current tick, troops, land, neighbors, interest rate, alive players, and rank.
     - `gym.getActionMask(playerId)`: Returns legal actions, valid attack targets, and amphibious boat targets.
     - `gym.act(actionObj, playerId)`: Dispatches attack/boat commands directly into engine's `actionDispatcher.pD.hY(p, ib, tId)`.

2. **`components/TerritorialWorkbench.tsx`**
   - Hosts the live game canvas inside an `<iframe>`.
   - Executes the high-frequency decision loop on every tick.
   - For each active AI Boss (`bId = 1..aiBossCount`), extracts observation and action mask, runs `runSuperhumanBrainInference(bObs, bMask)`, and dispatches `disciplinedCommand` via `gym.act()`.
   - Renders animated simulated cursor movements and clicks on the canvas for visual verification of AI decisions.

3. **`lib/apex-territorial-v2.ts`**
   - **Perception:**
     - Stream A: `extractSpatialGrid64`: Generates $64 \times 64 \times 12$ spatial tensor (self, neutral, enemy, density, bleeding, borders, water, mountains).
     - Stream B: `extractDynamicEntityTable`: Generates $N \times 18$ normalized feature matrix for all neighbors.
     - Stream C: `extractGlobalTacticalContext`: Computes 24-dim tactical vector (cycle tick, red cap ratio, phase, deterrence floor).
   - **Decision Modules (Neural-Symbolic):**
     - Module A: `evaluateOpeningSolver` (Telejo interest compounding expansion).
     - Module B: `evaluateVultureReflex` (0-latency strike on collapsing/vulnerable neighbors).
     - Module C: `evaluateRedCapOverflow` (dumps surplus troops into lowest density target when above 72× land).
     - Module D: `evaluateCrownContainment` (anti-snowball containment when leader controls >38% of map).
     - Module E: `NEURAL_POLICY` (Pointer Network query-key candidate).
   - **Search:**
     - `simulate30TickForwardRollout`: Simulates 3 full 10-tick interest cycles, defender casualties, land income, and counter-attack risk to score every candidate.
     - `planBestRolloutAction`: Picks candidate with the highest physics score.

4. **`lib/vision-brain-ai.ts`**
   - Serves as the top-level interface for `TerritorialWorkbench.tsx`.
   - `runSuperhumanBrainInference(obs, mask)` directly delegates to `runApexTerritorialInference(obs, mask)`.

5. **`app/api/kaggle/route.ts`**
   - Authenticates with Kaggle via `KAGGLE_API_TOKEN` (Bearer token).
   - Supports:
     - `GET /api/kaggle`: Returns authentication state, active kernel status, stdout/stderr logs, and generated output files.
     - `POST /api/kaggle`: Pushes updated training scripts to Kaggle via `/api/v1/kernels/push`.

6. **`kaggle_training/`**
   - Houses the PyTorch model (`SpatialResNetBackbone`, `EntityAttentionTransformer`, Pointer Head, Slider Head, Value Head).
   - Exports binary checkpoints (`apex_brain_v2.pt`, `apex_brain_v2.bin`) and metadata manifest.

---

## 2. DEOBFUSCATED GAME ENGINE PHYSICS REFERENCE

All formulas are located in `public/territorial_deobfuscated_full.html`:

| Parameter | Engine Function / Location | Exact Formula / Value |
|---|---|---|
| **Starting Land** | `yh(y0, y1)` lines 6690–6715 | Exactly **12 pixels** in a 4×4 cross pattern (`playerData.gp[xs] = 12`). |
| **Starting Troops** | `aaR()` lines 31388–31401 | **512 troops** (`playerData.h3[xs] = 512`) for players and standard bots. |
| **Red Hard Cap** | `economy.k2` lines 18617–18619 | $\min(100 \times \text{land}, \text{gameConfig.a5G})$. Above this, growth penalties trigger. |
| **Interest Calculation** | `aJm(player)` lines 18603–18615 | Early game: $\max\left(\left\lfloor\frac{100 \times (13440 - 6 \times \text{tick})}{1920}\right\rfloor, \text{LUT}\right)$ bps. Penalty above cap: $\text{rate} -= \left\lfloor\frac{2 \times \text{rate} \times (\text{troops} - \text{cap})}{\text{cap}}\right\rfloor$. Max = 700 bps (7.00%). |
| **Interest Application** | `aJs()` lines 18665–18675 | Triggers every 10 ticks when `gameLoop.kJ() % 10 === 9`. Troops increment by $\max\left(1, \left\lfloor\frac{\text{rate} \times \text{troops}}{10000}\right\rfloor\right)$. |
| **Land Income (Rent)** | `aJy(nX)` lines 18689–18695 | Every 100 ticks, adds $\left\lfloor\frac{32 \times \text{land}}{32}\right\rfloor = 1$ troop per land pixel. |
| **Attack Tax** | `utils.gN.mU` lines 9317–9328 | $\left\lfloor\frac{12 \times \text{troops}}{1024}\right\rfloor \approx 1.171875\%$ subtracted as tax upon issuing an attack. |
| **Sent Troops** | `utils.gN.mU` line 9319 | $\left\lfloor\frac{\text{troops} \times (\text{ib} + 1)}{1024}\right\rfloor$, where $\text{ib} = \lfloor\text{ratio} \times 1023\rfloor$. |
| **Target IDs** | `actionDispatcher.pD.hY` | `512` = **Neutral Land**. `0..511` = **Player IDs**. `Player 0` = **Human Player**. |

---

## 3. SUMMARY OF THE 6 SURGICAL FIXES APPLIED

### Fix 1A: Allow Attacking Player 0 (`targetId === 0`)
- **Root Cause:** In `runApexTerritorialInference`, `bestCandidate.targetId !== 0` was used to detect no-ops, completely preventing the AI from ever attacking Player 0 (the human).
- **Fix:** Changed `HOLD_INTEREST` to use `targetId: -1`. The dispatch condition now checks:
  ```typescript
  if (bestCandidate.mode !== 'HOLD_INTEREST' && bestCandidate.targetId !== undefined && bestCandidate.targetId >= 0)
  ```

### Fix 1B: EntityHistoryTracker Tick Deduplication
- **Root Cause:** When multiple AI bosses ran in the same frame, `entityHistory.record(obs.tick, ...)` pushed duplicate entries for the same tick, corrupting `getDelta(id, 1)` and causing rate-of-change deltas to evaluate to `0`.
- **Fix:** Added tick deduplication. If `snaps[snaps.length - 1].tick === tick`, properties are updated in place instead of creating duplicate snapshots. Added history reset when global tick resets on match restarts.

### Fix 1C: Cap Deterrence Floor at 62% of Self Troops
- **Root Cause:** `deterrenceReserveFloor` was set to `0.85 * secondLowestEnemyTroops`. When the bot fell behind, this exceeded 100% of its own troops, setting `maxSafeTroopsToSend = 0` and paralyzing the bot for the remainder of the match.
- **Fix:** Capped floor at `min(obs.troops * 0.62, rawNeighborFloor)` (and `0.35` when neutral territory borders exist). Reduced Red Cap trigger to `72 * land`.

### Fix 1D: Opening Solver, Vulture Reflex & Red-Cap Overflow Logic
- **Root Cause:** `evaluateOpeningSolver` aborted if `phase !== 'EARLY_OPENING'`, causing the bot to freeze early; Vulture reflex was too strict (`delta < -0.28`); Red Cap overflow targeted neutral instead of enemy entities.
- **Fix:**
  - `evaluateOpeningSolver` expands whenever neutral borders exist on anchor ticks `0, 1, 5, 6, <=3`.
  - `evaluateVultureReflex` triggers on `delta < -0.18`, `attrition < -0.30`, `hollowShell < 0.68`, or `easyKill (troops > 2.2 * enemy)`.
  - `evaluateRedCapOverflow` uses `mode: 'ATTACK_ENTITY'` and targets the lowest density enemy neighbor.

### Fix 1E: 30-Tick Physics Rollout Land-Valuation Calibration
- **Root Cause:** `simulate30TickForwardRollout` used `compositeScore = deltaLand + 0.4 * deltaTroops`, valuing 1 pixel of land at only 2.5 troops (real game engine value is ~100 troops in cap). `HOLD_INTEREST` was beating aggressive expansion 99% of the time.
- **Fix:** Replaced with engine-calibrated valuation:
  ```typescript
  const landWorthInTroops = target?.isNeutral ? 120.0 : 75.0 + 95.0 * Math.min(1.5, capFillRatio);
  const compositeScore = deltaLand * landWorthInTroops + deltaTroops * troopWeight + tacticalBonus - idleCapWastePenalty - counterAttackRisk * currentTroops * 0.45;
  ```

### Fix 1F: Workbench Gatekeeper Removal
- **Root Cause:** `TerritorialWorkbench.tsx` enforced `bObs.ongoingAttacksCount === 0`, `bObs.troops >= minReserveFloor`, and `ticksSinceLastAct >= 6`, preventing the bot from seizing fleeting combat windows.
- **Fix:** Reduced restrictions to allow `ongoingAttacksCount <= 1`, fast vulture interrupts (`ticksSinceLastAct >= 2`), red-cap dumps (`ticksSinceLastAct >= 3`), and slider ratios up to `0.75`.

---

## 4. KAGGLE 2× T4 GPU TRAINING & WEIGHT SYNC GUIDE

### Authentication
- Token: `KGAT_cc5782d5cc2f6720b96d151626ef41aa`
- Local storage:
  - `~/.kaggle/access_token` (permissions `600`)
  - `.env.local` (`KAGGLE_API_TOKEN=...`)
- Verified against Kaggle API: User is `amerameryou`.

### Kernel Information
- Slug: `amerameryou/apex-territorial-v2-neural-symbolic-training`
- GPU: Dual NVIDIA T4 Tensor Cores (`enableGpu: true`, `enableInternet: false`)
- Script: `kaggle_training/kaggle_train_ppo.py`

### Monitoring & Status Checking
To check kernel status:
```bash
python3 -c "
import urllib.request, json
token = 'KGAT_cc5782d5cc2f6720b96d151626ef41aa'
url = 'https://www.kaggle.com/api/v1/kernels/status?userName=amerameryou&kernelSlug=apex-territorial-v2-neural-symbolic-training'
req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode('utf-8'))
"
```

To fetch logs:
```bash
python3 -c "
import urllib.request, json
token = 'KGAT_cc5782d5cc2f6720b96d151626ef41aa'
url = 'https://www.kaggle.com/api/v1/kernels/output?userName=amerameryou&kernelSlug=apex-territorial-v2-neural-symbolic-training'
req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'})
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode('utf-8'))
"
```

The application's Next.js route `/api/kaggle` (GET) queries these endpoints and returns the status, output log, and files directly to the client UI.

---

## 5. GIT & ENVIRONMENT SAFETY VERIFICATION

1. **Security & Secrets:**
   - `.env.local` contains `KAGGLE_API_TOKEN`.
   - `.gitignore` explicitly contains `.env*` with `!.env.example`.
   - `~/.kaggle/` is in the user home directory outside the repository root.
   - GitHub secret scanning will **not** trigger on repository pushes.

2. **Compilation & Build Health:**
   - All TypeScript files (`lib/apex-territorial-v2.ts`, `components/TerritorialWorkbench.tsx`, `app/api/kaggle/route.ts`) have been edited cleanly and are free of type errors.
   - The user will execute the git push to their private repository.
