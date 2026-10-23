'use client';

import React from 'react';
import {
  Sparkles,
  Bot,
  Users,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Download,
} from 'lucide-react';
import type { ImitationLearningDataset, ImitationLearningFrame } from '@/lib/vision-brain-ai';

interface PhaseRoadmapHubProps {
  dataset: ImitationLearningDataset;
  activePhase: 'phase1' | 'phase2';
  onPhaseSelect: (phase: 'phase1' | 'phase2') => void;
  onExportDataset: () => void;
}

export default function PhaseRoadmapHub({
  dataset,
  activePhase,
  onPhaseSelect,
  onExportDataset,
}: PhaseRoadmapHubProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3.5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Two-Phase Grandmaster Roadmap</div>
            <div className="text-[11px] text-slate-400">
              Phase 1 (Autonomous Gym Mastery) → Phase 2 (Live Human Imitation Learning)
            </div>
          </div>
        </div>

        {/* Phase Select Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onPhaseSelect('phase1')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activePhase === 'phase1'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Phase 1: Gym Bot Engine</span>
          </button>
          <button
            type="button"
            onClick={() => onPhaseSelect('phase2')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              activePhase === 'phase2'
                ? 'bg-indigo-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Phase 2: Human Imitation</span>
          </button>
        </div>
      </div>

      {/* Two-Phase Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Phase 1 Card */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activePhase === 'phase1'
              ? 'bg-emerald-950/30 border-emerald-500/50 text-slate-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
              <Bot className="w-4 h-4" />
              <span>Phase 1: Autonomous Mastery (ACTIVE)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              OPERATIONAL
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] leading-relaxed">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Dynamic Attack Bar:</strong> Continuous 1%–100% fine slider control chosen autonomously by 25M Decision Net.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Full Human Action Set:</strong> Amphibious boats, mountain crossings, 8-emoji reactions, NAP pacts, peace voting.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Continuous Multi-Game Grinder:</strong> Auto-queues hundreds of games, cycling maps and difficulty tiers.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Reverse-Engineered Build 2154:</strong> Exact 10-rule math (Babylonian LUT, Telejo schedule, anti-dogpile deterrence).
              </span>
            </li>
          </ul>
        </div>

        {/* Phase 2 Card */}
        <div
          className={`p-3 rounded-lg border transition-all ${
            activePhase === 'phase2'
              ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
              <Users className="w-4 h-4" />
              <span>Phase 2: Live Human Arena (PIPELINE)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              COLLECTING
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] leading-relaxed">
            <li className="flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Human Play Telemetry Stream:</strong> Records human frame-by-frame cursor clicks, slider positions, and reaction timings.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Behavioral Cloning Dataset:</strong> Formatted state-action pairs ready for offline imitation learning & RLHF fine-tuning.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Multiplayer Binary Bridge:</strong> Binary bit-stream protocol (Opcodes 1–17) prepared for human lobby matchmaking.
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Human Bluff & Psychology:</strong> Learns high-level human bluffing, fake attack feints, and opportunistic alliances.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Phase 2 Telemetry & Dataset Stream */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">
              Human Play Telemetry Stream ({dataset.totalRecordedFrames} frames recorded)
            </span>
          </div>
          <button
            type="button"
            onClick={onExportDataset}
            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Export JSON Dataset</span>
          </button>
        </div>

        {dataset.humanSampledFrames.length === 0 ? (
          <div className="p-3 bg-slate-900/40 rounded border border-slate-800/80 text-center text-slate-500 font-mono text-[11px]">
            Ready to record human matches. Actions taken with manual slider or co-pilot are captured into the Phase 2 dataset.
          </div>
        ) : (
          <div className="max-h-36 overflow-y-auto rounded border border-slate-800 bg-slate-900/60 font-mono text-[10px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-1 px-2">Step</th>
                  <th className="py-1 px-2">Action</th>
                  <th className="py-1 px-2">Slider %</th>
                  <th className="py-1 px-2">Territory Share</th>
                  <th className="py-1 px-2">Red Cap</th>
                  <th className="py-1 px-2 text-right">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {dataset.humanSampledFrames.slice(-10).map((f) => (
                  <tr key={f.step} className="hover:bg-slate-850">
                    <td className="py-0.5 px-2 text-slate-400">#{f.step}</td>
                    <td className="py-0.5 px-2 text-emerald-400 font-semibold">{f.actionType}</td>
                    <td className="py-0.5 px-2 text-amber-300">{f.sliderPercentage}%</td>
                    <td className="py-0.5 px-2 text-slate-300">
                      {(f.screenFeatures.territoryShare * 100).toFixed(1)}%
                    </td>
                    <td className="py-0.5 px-2 text-slate-400">
                      {(f.screenFeatures.redCapRatio * 100).toFixed(0)}%
                    </td>
                    <td className="py-0.5 px-2 text-right text-slate-300">
                      {f.targetId === 512 ? 'Neutral' : `#${f.targetId}`}
                    </td>
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
