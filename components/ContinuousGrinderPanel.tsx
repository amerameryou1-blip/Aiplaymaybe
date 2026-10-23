'use client';

import React from 'react';
import {
  Flame,
  Trophy,
  Repeat,
  Zap,
  Play,
  Pause,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
} from 'lucide-react';
import type { ContinuousGrinderSession } from '@/lib/vision-brain-ai';

interface ContinuousGrinderPanelProps {
  session: ContinuousGrinderSession;
  grinderActive: boolean;
  targetMatches: number;
  rotationMode: 'cycle_maps' | 'current_map' | 'island_naval';
  speedMultiplier: number;
  onToggleGrinder: () => void;
  onTargetMatchesChange: (count: number) => void;
  onRotationModeChange: (mode: 'cycle_maps' | 'current_map' | 'island_naval') => void;
  onSpeedMultiplierChange: (mult: number) => void;
  onResetSession: () => void;
}

export default function ContinuousGrinderPanel({
  session,
  grinderActive,
  targetMatches,
  rotationMode,
  speedMultiplier,
  onToggleGrinder,
  onTargetMatchesChange,
  onRotationModeChange,
  onSpeedMultiplierChange,
  onResetSession,
}: ContinuousGrinderPanelProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3.5 shadow-xl">
      {/* Header with Title and Start/Stop Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Continuous Self-Play Gym Grinder</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  grinderActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {grinderActive ? 'ACTIVE · GRINDING' : 'IDLE / STANDBY'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Autonomous multi-game curriculum loop with neural MoE weight adaptations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetSession}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset Session
          </button>
          <button
            type="button"
            onClick={onToggleGrinder}
            className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow cursor-pointer ${
              grinderActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {grinderActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Grinder</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Multi-Game Grind</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Session Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
        {/* Total Matches */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
            <span>Games Played</span>
            <Activity className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-lg font-black text-white mt-0.5">
            {session.totalMatches}{' '}
            <span className="text-[10px] text-slate-400 font-normal">
              / {targetMatches === 0 ? '∞' : targetMatches}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {session.wins}W - {session.losses}L
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
            <span>Session Win Rate</span>
            <Trophy className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 mt-0.5">
            {session.totalMatches === 0 ? '100%' : `${session.winRatePct}%`}
          </div>
          <div className="text-[10px] text-emerald-300 truncate">
            Target: &gt;95.0%
          </div>
        </div>

        {/* Win Streak */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
            <span>Current Streak</span>
            <Flame className="w-3 h-3 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-400 mt-0.5">
            {session.currentStreak} 🔥
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Best: {session.bestStreak} wins
          </div>
        </div>

        {/* Avg Duration */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
            <span>Avg Match Ticks</span>
            <Zap className="w-3 h-3 text-yellow-400" />
          </div>
          <div className="text-lg font-black text-slate-200 mt-0.5">
            {session.avgTicksPerMatch || 184}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Boats: {session.totalBoatsLaunched}
          </div>
        </div>

        {/* MoE Adaptations */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between">
            <span>MoE Updates</span>
            <Cpu className="w-3 h-3 text-purple-400" />
          </div>
          <div className="text-lg font-black text-purple-400 mt-0.5">
            {session.neuralWeightAdaptations}
          </div>
          <div className="text-[10px] text-purple-300 truncate">
            Buffer: {session.recentMatches.length} replays
          </div>
        </div>
      </div>

      {/* Grinder Automation Config Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
        {/* Target Games Batch */}
        <label className="space-y-1">
          <span className="text-slate-400 block text-[11px]">Match Batch Goal</span>
          <select
            aria-label="Target matches"
            value={targetMatches}
            onChange={(e) => onTargetMatchesChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs"
          >
            <option value={0}>Continuous (Infinite Grind)</option>
            <option value={10}>10 Matches (Sprint)</option>
            <option value={25}>25 Matches (Standard)</option>
            <option value={50}>50 Matches (Endurance)</option>
            <option value={100}>100 Matches (Tournament)</option>
          </select>
        </label>

        {/* Map & Difficulty Rotation */}
        <label className="space-y-1">
          <span className="text-slate-400 block text-[11px]">Curriculum Rotation</span>
          <select
            aria-label="Curriculum rotation"
            value={rotationMode}
            onChange={(e) =>
              onRotationModeChange(
                e.target.value as 'cycle_maps' | 'current_map' | 'island_naval'
              )
            }
            className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs"
          >
            <option value="cycle_maps">Cycle All 24 Maps (Realistic + Proc)</option>
            <option value="island_naval">Island & Naval Focus (Boats & Coastal)</option>
            <option value="current_map">Repeat Current Map Only</option>
          </select>
        </label>

        {/* Speed Multiplier */}
        <label className="space-y-1">
          <span className="text-slate-400 block text-[11px]">Gym Speed Multiplier</span>
          <div className="flex items-center gap-1">
            {[
              { label: '1x (Real)', val: 2 },
              { label: '2x (Fast)', val: 5 },
              { label: '5x (Turbo)', val: 15 },
            ].map((sp) => (
              <button
                key={sp.val}
                type="button"
                onClick={() => onSpeedMultiplierChange(sp.val)}
                className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-medium cursor-pointer transition-colors ${
                  speedMultiplier === sp.val
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Live Recent Matches Ledger */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Recent Grinder Matches ({session.recentMatches.length} recorded)</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Auto-queued upon completion
          </span>
        </div>

        {session.recentMatches.length === 0 ? (
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-center text-slate-500 text-xs font-mono">
            Grinder standby. Press &quot;Start Multi-Game Grind&quot; to begin autonomous match execution.
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse font-mono text-[11px]">
              <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-1 px-2">#</th>
                  <th className="py-1 px-2">Map</th>
                  <th className="py-1 px-2">Tier</th>
                  <th className="py-1 px-2">Result</th>
                  <th className="py-1 px-2 text-right">Ticks</th>
                  <th className="py-1 px-2 text-right">Troops</th>
                  <th className="py-1 px-2 text-right">Slider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {session.recentMatches.map((m) => (
                  <tr key={m.matchId} className="hover:bg-slate-900/50">
                    <td className="py-1 px-2 text-slate-400">#{m.matchId}</td>
                    <td className="py-1 px-2 text-slate-200 font-sans font-medium">{m.mapName}</td>
                    <td className="py-1 px-2 text-slate-400">{m.difficulty}</td>
                    <td className="py-1 px-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          m.won
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {m.won ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{m.won ? 'VICTORY' : `RANK #${m.finalRank}`}</span>
                      </span>
                    </td>
                    <td className="py-1 px-2 text-right text-slate-300">{m.durationTicks}t</td>
                    <td className="py-1 px-2 text-right text-emerald-400">{m.finalTroops.toLocaleString()}</td>
                    <td className="py-1 px-2 text-right text-amber-300">{m.avgSliderPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
