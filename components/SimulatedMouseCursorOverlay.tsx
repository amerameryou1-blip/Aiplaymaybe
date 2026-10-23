'use client';

import React from 'react';
import { MousePointer, ZoomIn, ZoomOut, Move, Target } from 'lucide-react';
import { type SimulatedMouseAction } from '@/lib/vision-action-bridge';
import type { MultiFrontPlan } from '@/lib/vision-brain-ai';

interface CursorOverlayProps {
  currentAction: SimulatedMouseAction | null;
  active: boolean;
  canvasWidth?: number;
  canvasHeight?: number;
  multiFrontPlan?: MultiFrontPlan | null;
}

export default function SimulatedMouseCursorOverlay({
  currentAction,
  active,
  multiFrontPlan,
}: CursorOverlayProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Multi-Front Tactical Reticles & Coordinated Attack Lines */}
      {multiFrontPlan && multiFrontPlan.isMultiFront && multiFrontPlan.fronts.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {multiFrontPlan.fronts.map((front, idx) => {
            const sx = front.screenX ?? 512;
            const sy = front.screenY ?? 384;
            const color =
              idx === 0
                ? '#ef4444' // Red / Crimson for Primary Strike
                : idx === 1
                ? '#f59e0b' // Amber for Flank Expansion
                : '#10b981'; // Emerald for Naval / Pocket

            return (
              <g key={`front-${front.frontIndex}`}>
                {/* Tactical dashed circle */}
                <circle
                  cx={sx}
                  cy={sy}
                  r="18"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  className="animate-spin"
                  style={{ transformOrigin: `${sx}px ${sy}px`, animationDuration: '6s' }}
                />
                <circle cx={sx} cy={sy} r="4" fill={color} />

                {/* Target badge label */}
                <rect
                  x={sx + 10}
                  y={sy - 18}
                  width="78"
                  height="18"
                  rx="3"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={color}
                  strokeWidth="1"
                />
                <text
                  x={sx + 14}
                  y={sy - 5}
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  F{idx + 1}: {front.allocatedRatioPct}% atk
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Animated Simulated Cursor */}
      {currentAction && (
        <div
          className="absolute transition-all duration-150 ease-out flex items-start gap-1"
          style={{
            left: `${currentAction.screenX}px`,
            top: `${currentAction.screenY}px`,
            transform: 'translate(-4px, -4px)',
          }}
        >
          {/* Cursor Icon */}
          <div className="relative">
            {currentAction.type === 'zoom' ? (
              (currentAction.zoomDelta || 0) < 0 ? (
                <ZoomIn className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              ) : (
                <ZoomOut className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
              )
            ) : currentAction.type === 'drag' ? (
              <Move className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-bounce" />
            ) : (
              <MousePointer className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] fill-emerald-500/30" />
            )}

            {/* Click Ripple Effect */}
            {currentAction.type === 'click' && (
              <div className="absolute -inset-3 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
            )}
          </div>

          {/* Tactical Crosshair Reticle on Click */}
          {currentAction.type === 'click' && (
            <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full border border-dashed border-emerald-400/80 animate-spin" />
          )}

          {/* AI Action Pill Label */}
          <div className="bg-slate-900/95 border border-slate-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm -mt-1 ml-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentAction.type === 'click' ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
              }`}
            />
            <span className="font-bold text-slate-200">AI Pointer:</span>
            <span className="text-emerald-300">{currentAction.rationale}</span>
          </div>
        </div>
      )}
    </div>
  );
}

