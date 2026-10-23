'use client';

import React from 'react';
import {
  Sliders,
  Bot,
  UserCheck,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
} from 'lucide-react';
import { ATTACK_BAR_PRESETS, type AttackBarPreset } from '@/lib/vision-brain-ai';

interface DynamicAttackBarProps {
  currentPercentage: number;
  aiRecommendedPercentage: number;
  sliderMode: 'ai_autopilot' | 'manual_override';
  reason: string;
  tacticalTier: string;
  currentTroops: number;
  disabled?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
  onPercentageChange: (pct: number) => void;
  onModeChange: (mode: 'ai_autopilot' | 'manual_override') => void;
  onSendAttack?: () => void;
}

export default function DynamicAttackBar({
  currentPercentage,
  aiRecommendedPercentage,
  sliderMode,
  reason,
  tacticalTier,
  currentTroops,
  disabled = false,
  isMinimized = false,
  onToggleMinimize,
  onClose,
  onPercentageChange,
  onModeChange,
  onSendAttack,
}: DynamicAttackBarProps) {
  const effectivePct = sliderMode === 'ai_autopilot' ? aiRecommendedPercentage : currentPercentage;
  const troopsToSend = Math.max(1, Math.floor((effectivePct / 100) * currentTroops));

  // Dynamic gradient color matching Territorial.io: Green (<33%), Amber (33-66%), Crimson (67-100%)
  const getSliderColor = (pct: number) => {
    if (pct <= 33) return 'from-emerald-500 to-green-400 border-emerald-400';
    if (pct <= 66) return 'from-amber-500 to-yellow-400 border-amber-400';
    return 'from-rose-600 to-purple-500 border-rose-400';
  };

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Micro':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Cycle':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Assault':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Breakthrough':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Full-Send':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  // =========================================================================
  // COMPACT MINIMIZED BAR: High-efficiency ~36px strip leaving map completely visible
  // =========================================================================
  if (isMinimized) {
    return (
      <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-2xl flex items-center justify-between gap-2 text-xs transition-all">
        {/* Left: Indicator & Ratio */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono truncate">
            <span className="font-black text-white text-sm">{effectivePct}%</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getBadgeColor(tacticalTier)}`}>
              {tacticalTier}
            </span>
            <span className="hidden sm:inline text-[10px] text-slate-400 truncate font-sans">
              ≈{troopsToSend.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Quick Presets */}
        <div className="hidden xs:flex items-center gap-1 font-mono text-[10px]">
          {[20, 50, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              disabled={disabled}
              onClick={() => {
                onModeChange('manual_override');
                onPercentageChange(pct);
              }}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                effectivePct === pct
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Right: Actions, Mode, Expand & Close */}
        <div className="flex items-center gap-1 shrink-0">
          {onSendAttack && (
            <button
              type="button"
              disabled={disabled}
              onClick={onSendAttack}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
              title={`Send Attack with ${effectivePct}% Troops`}
            >
              <Zap className="w-3 h-3" />
              <span>Send</span>
            </button>
          )}

          {/* Mode Switcher Icon */}
          <button
            type="button"
            onClick={() => onModeChange(sliderMode === 'ai_autopilot' ? 'manual_override' : 'ai_autopilot')}
            className={`p-1 rounded cursor-pointer transition-colors ${
              sliderMode === 'ai_autopilot'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}
            title={sliderMode === 'ai_autopilot' ? 'AI Dynamic Auto-Pilot' : 'Manual Co-Pilot'}
          >
            {sliderMode === 'ai_autopilot' ? <Bot className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </button>

          {/* Expand Full Card Button */}
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Expand Dynamic Attack Bar"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close/Hide Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
              title="Hide Attack Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // EXPANDED CARD VIEW: Complete fine-grain controls with Minimize & Close
  // =========================================================================
  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 sm:p-3.5 shadow-2xl space-y-2 sm:space-y-2.5 max-h-[420px] overflow-y-auto">
      {/* Header with Title, Mode Switcher, and Minimize/Close Buttons */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-white text-xs sm:text-sm truncate">Dynamic Attack Bar</span>
              <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${getBadgeColor(tacticalTier)}`}>
                {tacticalTier} Tier
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block truncate">
              Continuous 1%–100% fine slider control chosen dynamically by AI
            </div>
          </div>
        </div>

        {/* Top-Right Controls: Mode Switcher + Minimize + Close */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => onModeChange('ai_autopilot')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                sliderMode === 'ai_autopilot'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span className="hidden xs:inline">AI Dynamic</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange('manual_override')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                sliderMode === 'manual_override'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              <span className="hidden xs:inline">Manual</span>
            </button>
          </div>

          {/* Minimize Button */}
          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Minimize to Compact Bar"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
              title="Hide Attack Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dynamic Bar Display */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-white">{effectivePct}%</span>
            <span className="text-[11px] text-slate-400 font-sans">
              ≈ <strong className="text-emerald-400 font-mono">{troopsToSend.toLocaleString()}</strong> deploy
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Reserves: {currentTroops.toLocaleString()}
          </span>
        </div>

        {/* Visual Progress Bar Track */}
        <div className="relative w-full h-3 sm:h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-150 ${getSliderColor(effectivePct)}`}
            style={{ width: `${Math.max(2, Math.min(100, effectivePct))}%` }}
          />
        </div>

        {/* Continuous Range Input Slider */}
        <div className="pt-0.5">
          <input
            type="range"
            min="1"
            max="100"
            aria-label="Attack bar slider"
            disabled={disabled || sliderMode === 'ai_autopilot'}
            value={effectivePct}
            onChange={(e) => {
              if (sliderMode === 'ai_autopilot') {
                onModeChange('manual_override');
              }
              onPercentageChange(Number(e.target.value));
            }}
            className={`w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
              sliderMode === 'ai_autopilot' ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>1% (Micro)</span>
            <span>20% (Cycle)</span>
            <span>50% (Defend)</span>
            <span>100% (All-In)</span>
          </div>
        </div>
      </div>

      {/* Preset Buttons + Micro Fine-Tuning */}
      <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1">
          {ATTACK_BAR_PRESETS.map((preset: AttackBarPreset) => {
            const isSelected = effectivePct === preset.pct;
            return (
              <button
                key={preset.pct}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onModeChange('manual_override');
                  onPercentageChange(preset.pct);
                }}
                title={preset.tacticalRole}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Micro-Adjustment Fine Tuners */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onModeChange('manual_override');
              onPercentageChange(Math.max(1, effectivePct - 1));
            }}
            className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Decrease 1%"
          >
            -1%
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onModeChange('manual_override');
              onPercentageChange(Math.min(100, effectivePct + 1));
            }}
            className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
            title="Increase 1%"
          >
            +1%
          </button>
          {onSendAttack && (
            <button
              type="button"
              disabled={disabled}
              onClick={onSendAttack}
              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow text-xs"
            >
              <Zap className="w-3 h-3" />
              <span>Send {effectivePct}%</span>
            </button>
          )}
        </div>
      </div>

      {/* AI Decision Rationale Callout */}
      <div className="p-1.5 bg-slate-950/70 border border-slate-800 rounded flex items-center gap-1.5 text-[11px]">
        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="text-emerald-300 font-mono text-[10px] truncate">
          {sliderMode === 'ai_autopilot' ? reason : `Manual: Locked at ${effectivePct}%. AI dynamic available on toggle.`}
        </span>
      </div>
    </div>
  );
}
