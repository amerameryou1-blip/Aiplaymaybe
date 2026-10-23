'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Info,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen may be restricted in some iframe contexts
    }
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle reload of the game engine
  const handleReload = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = '/territorial_deobfuscated_full.html';
    }
  }, []);

  // Keyboard shortcut listener (F for fullscreen, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Auto-hide floating controls on inactivity
  const handleUserActivity = useCallback(() => {
    setIsControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 4000);
  }, []);

  useEffect(() => {
    handleUserActivity();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [handleUserActivity]);

  return (
    <main
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
      className="relative w-screen h-screen overflow-hidden bg-black select-none m-0 p-0"
    >
      {/* The Deobfuscated Original Territorial.io Game */}
      <iframe
        ref={iframeRef}
        src="/territorial_deobfuscated_full.html"
        title="Territorial.io Game"
        className="w-full h-full border-0 outline-none block m-0 p-0"
        allow="autoplay; fullscreen"
      />

      {/* Floating Minimalist Header HUD */}
      <header
        className={`absolute top-3 right-3 flex items-center gap-2 transition-all duration-300 pointer-events-auto z-50 ${
          isControlsVisible || showInfo
            ? 'opacity-100 translate-y-0'
            : 'opacity-20 hover:opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-neutral-800 shadow-xl text-neutral-300 text-xs">
          {/* Game Title Badge */}
          <span className="font-semibold tracking-wider text-neutral-100 uppercase px-1 text-[11px]">
            Territorial.io
          </span>

          <span className="w-px h-3.5 bg-neutral-800 mx-1" />

          {/* Controls / Info Button */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            title="How to Play & Controls"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Reload Game */}
          <button
            onClick={handleReload}
            title="Reload Game"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Open Raw HTML */}
          <a
            href="/territorial_deobfuscated_full.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Game in Full Standalone Window"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Game Guide Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="text-base font-bold text-white tracking-wide uppercase">
                Territorial.io Guide
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs text-neutral-300">
              <section>
                <h3 className="font-semibold text-neutral-100 uppercase tracking-wider text-[11px] mb-1">
                  1. Objective & Conquest
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Expand your borders by claiming grey neutral territory, manage your troop balance
                  and compound interest every 10 ticks, and conquer enemy nations.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-neutral-100 uppercase tracking-wider text-[11px] mb-1">
                  2. Controls & Actions
                </h3>
                <ul className="space-y-1.5 text-neutral-400 list-disc list-inside">
                  <li>
                    <strong className="text-neutral-200">Left Click</strong> on neighboring
                    neutral land or enemy borders to attack.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Attack Percentage Slider:</strong> Adjust
                    the percentage of troops sent with each wave (typically 20% - 30% for expansion).
                  </li>
                  <li>
                    <strong className="text-neutral-200">Boats & Islands:</strong> Click on open
                    coastal waters or distant islands to launch naval convoys.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Press F:</strong> Toggle fullscreen mode.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-neutral-100 uppercase tracking-wider text-[11px] mb-1">
                  3. Interest Economy
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  Every 10 ticks, players earn compound interest on banked troops. Expand prudently
                  to maintain positive growth and avoid sending 100% of troops unless executing a
                  decisive wipeout.
                </p>
              </section>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors"
              >
                Return to Game
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
