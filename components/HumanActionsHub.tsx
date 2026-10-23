'use client';

import React, { useState } from 'react';
import {
  Handshake,
  Swords,
  Shield,
  Smile,
  Flag,
  Heart,
  Anchor,
  Mountain,
  Users,
  Send,
  Sparkles,
} from 'lucide-react';
import { HUMAN_EMOJIS, type HumanEmojiDef } from '@/lib/vision-brain-ai';
import type { GymNeighbor } from '@/lib/deobfuscation-data';

interface HumanActionsHubProps {
  neighbors: GymNeighbor[];
  canLaunchBoat: boolean;
  canCrossMountain: boolean;
  activeBoatsCount: number;
  totalBoatsLaunched: number;
  disabled?: boolean;
  sliderPercentage: number;
  onSendEmoji: (emojiId: number) => void;
  onToggleNAP: (targetId: number) => void;
  onDonateAlly: (targetId: number, ratio: number) => void;
  onProposePeace: () => void;
  onLaunchBoat: () => void;
  onCrossMountain: () => void;
}

export default function HumanActionsHub({
  neighbors,
  canLaunchBoat,
  canCrossMountain,
  activeBoatsCount,
  totalBoatsLaunched,
  disabled = false,
  sliderPercentage,
  onSendEmoji,
  onToggleNAP,
  onDonateAlly,
  onProposePeace,
  onLaunchBoat,
  onCrossMountain,
}: HumanActionsHubProps) {
  const [selectedNeighborId, setSelectedNeighborId] = useState<number>(
    neighbors.find((n) => !n.isNeutral)?.id ?? 0
  );
  const [lastEmittedEmoji, setLastEmittedEmoji] = useState<{ emoji: string; name: string } | null>(
    null
  );

  const enemyNeighbors = neighbors.filter((n) => !n.isNeutral);

  const handleEmojiClick = (item: HumanEmojiDef) => {
    onSendEmoji(item.id);
    setLastEmittedEmoji({ emoji: item.emoji, name: item.name });
    setTimeout(() => {
      setLastEmittedEmoji(null);
    }, 2500);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400">
            <Smile className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Human Player Action Suite</div>
            <div className="text-[11px] text-slate-400">
              Grandmaster communication, naval ops, alliances & peace voting
            </div>
          </div>
        </div>

        {lastEmittedEmoji && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs animate-bounce">
            <span className="text-base">{lastEmittedEmoji.emoji}</span>
            <span>{lastEmittedEmoji.name} sent!</span>
          </div>
        )}
      </div>

      {/* 1. Emoji Signaling & Reaction Wheel */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Grandmaster Emoji Reaction Wheel</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Broadcasts to all lobby players</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {HUMAN_EMOJIS.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => handleEmojiClick(item)}
              title={`${item.name} (${item.meaning})`}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer group hover:scale-105 active:scale-95"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {item.emoji}
              </span>
              <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center mt-0.5">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Diplomacy, Non-Aggression Pacts & Peace Referendum */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
        {/* NAP / Alliance Proposal */}
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Handshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Non-Aggression Pact (NAP)</span>
            </span>
          </div>

          <div className="flex gap-1.5">
            <select
              aria-label="Neighbor Kingdom"
              value={selectedNeighborId}
              onChange={(e) => setSelectedNeighborId(Number(e.target.value))}
              className="flex-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
            >
              {enemyNeighbors.length === 0 && <option value={0}>No adjacent enemies</option>}
              {enemyNeighbors.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name || `Bot #${n.id}`} ({n.troops.toLocaleString()} troops)
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={disabled || enemyNeighbors.length === 0}
              onClick={() => onToggleNAP(selectedNeighborId)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Toggle NAP</span>
            </button>
          </div>
        </div>

        {/* Peace Referendum Vote */}
        <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-400" />
              <span>Peace Referendum</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Endgame Truce</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 leading-tight">
              Vote to end match peacefully when holding dominant land share.
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={onProposePeace}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Call Peace</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Amphibious Naval & Mountain Incursion Ops */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        {/* Launch Amphibious Boat */}
        <button
          type="button"
          disabled={disabled || !canLaunchBoat}
          onClick={onLaunchBoat}
          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-sky-400" />
            <div>
              <div className="font-semibold text-slate-200">Amphibious Boat</div>
              <div className="text-[10px] text-slate-400">
                Active: {activeBoatsCount} · Total: {totalBoatsLaunched}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
            Launch
          </span>
        </button>

        {/* Mountain Pass Crossing */}
        <button
          type="button"
          disabled={disabled || !canCrossMountain}
          onClick={onCrossMountain}
          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <div className="font-semibold text-slate-200">Mountain Crossing</div>
              <div className="text-[10px] text-slate-400">Drill border pass</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
            Mine
          </span>
        </button>

        {/* Team Troop Transfer */}
        <button
          type="button"
          disabled={disabled || enemyNeighbors.length === 0}
          onClick={() => onDonateAlly(selectedNeighborId, sliderPercentage / 100)}
          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer disabled:opacity-50 text-left"
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <div>
              <div className="font-semibold text-slate-200">Troop Transfer</div>
              <div className="text-[10px] text-slate-400">Donate {sliderPercentage}%</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
            Donate
          </span>
        </button>
      </div>
    </div>
  );
}
