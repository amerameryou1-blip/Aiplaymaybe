'use client';

import React, { useState, useMemo } from 'react';
import {
  DEOBFUSCATION_SYMBOLS,
  BOT_DIFFICULTIES,
  calculateRedInterestCap,
  estimatePixelCombatCost,
  type SymbolEntry,
} from '@/lib/deobfuscation-data';
import { Search, Code2, Calculator, Cpu } from 'lucide-react';

interface SymbolDictionaryViewProps {
  onJumpToCode: (searchQuery: string) => void;
  onInspectLiveSingleton: (deobfuscatedName: string) => string;
}

const CATEGORIES: Array<'All' | SymbolEntry['category']> = [
  'All',
  'Singleton',
  'Core Function',
  'AI & Pathfinding',
  'UI & Rendering',
  'Storage & Network',
];

export default function SymbolDictionaryView({
  onJumpToCode,
  onInspectLiveSingleton,
}: SymbolDictionaryViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | SymbolEntry['category']>('All');
  const [inspectedSymbol, setInspectedSymbol] = useState<string | null>(null);
  const [liveSnapshotText, setLiveSnapshotText] = useState<string>('');

  // Engine combat & economy calculator state
  const [calcTerritory, setCalcTerritory] = useState(250);
  const [calcBorderPixels, setCalcBorderPixels] = useState(12);
  const [calcDefenderTroops, setCalcDefenderTroops] = useState(1800);
  const [calcDefenderLand, setCalcDefenderLand] = useState(200);

  const filteredSymbols = useMemo(() => {
    return DEOBFUSCATION_SYMBOLS.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.obfuscated.toLowerCase().includes(q) ||
        item.deobfuscated.toLowerCase().includes(q) ||
        item.constructorExpr.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCategory]);

  const redCap = useMemo(() => calculateRedInterestCap(calcTerritory), [calcTerritory]);
  const combatResult = useMemo(
    () => estimatePixelCombatCost(calcBorderPixels, calcDefenderTroops, calcDefenderLand, 0),
    [calcBorderPixels, calcDefenderTroops, calcDefenderLand]
  );

  const handleInspectLive = (sym: SymbolEntry) => {
    setInspectedSymbol(sym.deobfuscated);
    const dump = onInspectLiveSingleton(sym.deobfuscated);
    setLiveSnapshotText(dump);
  };

  return (
    <div className="space-y-8">
      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Complete Deobfuscation Symbol Dictionary
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Exact mapping of obfuscated identifiers, constructors, and simulation functions inside{' '}
            <code className="font-mono text-emerald-400">name.html</code> (Build 2154).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search symbol dictionary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol, constructor, or role..."
              className="pl-9 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 w-72"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Showing {filteredSymbols.length} of {DEOBFUSCATION_SYMBOLS.length} core engine symbols
        </div>
      </div>

      {/* Live Runtime Singleton Inspector Drawer (if active) */}
      {inspectedSymbol && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 font-mono">
              <Cpu className="w-4 h-4" />
              <span>window.TerritorialInternals.{inspectedSymbol}</span>
            </div>
            <button
              type="button"
              onClick={() => setInspectedSymbol(null)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Close Inspector
            </button>
          </div>
          <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto max-h-56">
            {liveSnapshotText}
          </pre>
        </div>
      )}

      {/* Symbol Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900 text-xs font-semibold text-slate-400">
                <th className="py-3 px-4">Obfuscated</th>
                <th className="py-3 px-4">Deobfuscated Name</th>
                <th className="py-3 px-4">Constructor / Signature</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Role in the Engine</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-sm">
              {filteredSymbols.map((sym) => (
                <tr key={sym.obfuscated} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-amber-400 whitespace-nowrap">
                    {sym.obfuscated}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                    {sym.deobfuscated}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                    {sym.constructorExpr}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                    {sym.category}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs leading-relaxed max-w-md">
                    <div>{sym.role}</div>
                    <div className="mt-1 text-slate-500 font-mono text-[11px]">
                      Keys: {sym.keyMethods.join(' · ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspectLive(sym)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                      >
                        Inspect Live
                      </button>
                      <button
                        type="button"
                        onClick={() => onJumpToCode(sym.deobfuscated)}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/50 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Find in Source</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deobfuscated Bot AI & Combat Math Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Bot Difficulty Table */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Deobfuscated Bot Difficulty Parameters (<code className="font-mono text-emerald-400">botConfig / c5</code>)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Extracted from <code className="font-mono">botConfig.dd()</code> and <code className="font-mono">botBrain.j9.jz()</code>.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 pr-3">ID</th>
                  <th className="py-2 px-3">Difficulty</th>
                  <th className="py-2 px-3 text-right">Start Ratio (kS)</th>
                  <th className="py-2 px-3 text-right">Target Ratio (kT)</th>
                  <th className="py-2 px-3 text-right">Cooldown (kR)</th>
                  <th className="py-2 pl-3 text-right">Weakest Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-300">
                {BOT_DIFFICULTIES.map((b) => (
                  <tr key={b.index}>
                    <td className="py-2 pr-3 text-amber-400">{b.index}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-200">{b.name}</td>
                    <td className="py-2 px-3 text-right">{b.initialAttackRatioPermille}</td>
                    <td className="py-2 px-3 text-right">{b.targetAttackRatioPermille}</td>
                    <td className="py-2 px-3 text-right">{b.cooldownTicks} ticks</td>
                    <td className="py-2 pl-3 text-right text-emerald-400">{b.weakestTargetProbPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Combat & Economy Formula Calculator */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Deobfuscated Combat & Economy Calculator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Exact integer math from <code className="font-mono">stepPlayerExpansionWave(player)</code> &{' '}
                <code className="font-mono">economy.k2(player)</code>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <label className="space-y-1">
              <span className="text-slate-400">Your Territory Land (gp[p])</span>
              <input
                type="number"
                min={1}
                value={calcTerritory}
                onChange={(e) => setCalcTerritory(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Expansion Ring Pixels (fx)</span>
              <input
                type="number"
                min={1}
                value={calcBorderPixels}
                onChange={(e) => setCalcBorderPixels(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Defender Troops (h3[fw])</span>
              <input
                type="number"
                min={0}
                value={calcDefenderTroops}
                onChange={(e) => setCalcDefenderTroops(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono tabular-nums"
              />
            </label>
            <label className="space-y-1">
              <span className="text-slate-400">Defender Land (gp[fw])</span>
              <input
                type="number"
                min={1}
                value={calcDefenderLand}
                onChange={(e) => setCalcDefenderLand(Number(e.target.value) || 1)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-100 font-mono tabular-nums"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800 font-mono tabular-nums">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">Red-Interest Cap (k2)</div>
              <div className="text-base font-semibold text-emerald-400 mt-0.5">
                {redCap.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">100 × Land</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">Neutral Wave Cost (gs)</div>
              <div className="text-base font-semibold text-slate-200 mt-0.5">
                {combatResult.baseCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">2 × Ring Pixels</div>
            </div>
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-[11px] text-slate-400 font-sans">Enemy Wave Cost (gt)</div>
              <div className="text-base font-semibold text-amber-400 mt-0.5">
                {combatResult.totalCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">
                Base {combatResult.baseCost} + Tax {combatResult.densityTax}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
