'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, Copy, Check, FileCode, Terminal, Database } from 'lucide-react';

interface SourceLine {
  line: number;
  text: string;
}

interface SourceInspectorViewProps {
  initialSearchQuery?: string;
}

const CODE_BOOKMARKS = [
  { label: 'bootGame() & Singletons', query: 'function bootGame(' },
  { label: 'stepSimulationTick()', query: 'function stepSimulationTick()' },
  { label: 'renderGameFrame()', query: 'function renderGameFrame()' },
  { label: 'stepPlayerExpansionWave()', query: 'function stepPlayerExpansionWave(' },
  { label: 'BotBrain (cl)', query: 'function BotBrain()' },
  { label: 'BotConfig (c5)', query: 'function BotConfig()' },
  { label: 'Economy (cZ)', query: 'function Economy()' },
  { label: 'NavalSystem (d6)', query: 'function NavalSystem()' },
  { label: 'MapManager (dB)', query: 'function MapManager()' },
  { label: 'ActionDispatcher (cy)', query: 'function ActionDispatcher()' },
  { label: 'window.TerritorialGym', query: 'window.TerritorialGym =' },
];

export default function SourceInspectorView({ initialSearchQuery = '' }: SourceInspectorViewProps) {
  const [subTab, setSubTab] = useState<'html' | 'python' | 'tables'>('html');
  const [startLine, setStartLine] = useState(1);
  const [totalLines, setTotalLines] = useState(20163);
  const [totalBytes, setTotalBytes] = useState(972397);
  const [slice, setSlice] = useState<SourceLine[]>([]);
  const [loadingSlice, setLoadingSlice] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchMatches, setSearchMatches] = useState<SourceLine[]>([]);
  const [searching, setSearching] = useState(false);

  const [sTable, setSTable] = useState<string[]>([]);
  const [lTable, setLTable] = useState<string[]>([]);
  const [pyScript, setPyScript] = useState<string>('');
  const [tableFilter, setTableFilter] = useState('');
  const [copiedPy, setCopiedPy] = useState(false);

  const fetchSlice = useCallback(async (start: number) => {
    setLoadingSlice(true);
    try {
      const res = await fetch(`/api/source?mode=slice&start=${start}&count=100`);
      const data = await res.json();
      setSlice(data.slice || []);
      if (data.totalLines) setTotalLines(data.totalLines);
      if (data.totalBytes) setTotalBytes(data.totalBytes);
      setStartLine(data.startLine || start);
    } catch (err) {
      console.error('Failed to load source slice:', err);
    } finally {
      setLoadingSlice(false);
    }
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchMatches([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/source?mode=search&q=${encodeURIComponent(q)}&limit=60`);
      const data = await res.json();
      setSearchMatches(data.matches || []);
      if (data.matches && data.matches.length > 0) {
        fetchSlice(Math.max(1, data.matches[0].line - 5));
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  }, [fetchSlice]);

  useEffect(() => {
    let ignore = false;
    const loadInitial = async () => {
      try {
        const res = await fetch('/api/source?mode=slice&start=1&count=100');
        const data = await res.json();
        if (!ignore) {
          setSlice(data.slice || []);
          if (data.totalLines) setTotalLines(data.totalLines);
          if (data.totalBytes) setTotalBytes(data.totalBytes);
          setStartLine(data.startLine || 1);
        }
      } catch (err) {
        console.error('Failed to load initial slice:', err);
      }
    };
    loadInitial();

    fetch('/api/source?mode=tables')
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) {
          if (data.sTable) setSTable(data.sTable);
          if (data.lTable) setLTable(data.lTable);
          if (data.pyScript) setPyScript(data.pyScript);
          if (data.totalLines) setTotalLines(data.totalLines);
          if (data.totalBytes) setTotalBytes(data.totalBytes);
        }
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!initialSearchQuery || !initialSearchQuery.trim()) return;
    let ignore = false;
    const q = initialSearchQuery;
    fetch(`/api/source?mode=search&q=${encodeURIComponent(q)}&limit=60`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore && data.matches) {
          setSearchMatches(data.matches);
          if (data.matches.length > 0) {
            const start = Math.max(1, data.matches[0].line - 5);
            fetch(`/api/source?mode=slice&start=${start}&count=100`)
              .then((s) => s.json())
              .then((sData) => {
                if (!ignore && sData.slice) {
                  setSlice(sData.slice);
                  setStartLine(sData.startLine || start);
                }
              });
          }
        }
      })
      .catch(console.error);

    return () => {
      ignore = true;
    };
  }, [initialSearchQuery]);

  const handleCopyPython = () => {
    if (!pyScript) return;
    navigator.clipboard?.writeText(pyScript);
    setCopiedPy(true);
    setTimeout(() => setCopiedPy(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">
            Deobfuscated Source & String Table Explorer
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-mono tabular-nums">
            territorial_deobfuscated_full.html · {totalLines.toLocaleString()} formatted lines ·{' '}
            {(totalBytes / 1024).toFixed(1)} KB · 0 syntax errors
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setSubTab('html')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'html'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>territorial_deobfuscated_full.html</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('python')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'python'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>deobfuscate_territorial.py</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('tables')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'tables'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>S[] & L84[] String Tables</span>
            </button>
          </div>

          <a
            href="/territorial_deobfuscated_full.html"
            download="territorial_deobfuscated_full.html"
            className="px-3.5 py-2 text-xs font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </a>
        </div>
      </div>

      {subTab === 'html' && (
        <div className="space-y-4">
          {/* Quick Jump Bookmarks */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Jump to section:</span>
            {CODE_BOOKMARKS.map((bm) => (
              <button
                key={bm.label}
                type="button"
                onClick={() => {
                  setSearchQuery(bm.query);
                  runSearch(bm.query);
                }}
                className="px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
              >
                {bm.label}
              </button>
            ))}
          </div>

          {/* Search & Line Navigation Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(searchQuery);
              }}
              className="flex items-center gap-2 flex-1"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  aria-label="Search deobfuscated source code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all 20,163 lines (e.g., stepSimulationTick, TerritorialGym, L(109)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors whitespace-nowrap shrink-0"
              >
                {searching ? 'Searching...' : 'Search Source'}
              </button>
              {searchMatches.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchMatches([]);
                  }}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Clear ({searchMatches.length} matches)
                </button>
              )}
            </form>

            <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
              <span className="text-slate-400">Lines {startLine}–{Math.min(totalLines, startLine + 99)}</span>
              <button
                type="button"
                onClick={() => fetchSlice(Math.max(1, startLine - 100))}
                disabled={startLine <= 1 || loadingSlice}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded"
              >
                Prev 100
              </button>
              <button
                type="button"
                onClick={() => fetchSlice(Math.min(totalLines - 50, startLine + 100))}
                disabled={startLine + 100 > totalLines || loadingSlice}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded"
              >
                Next 100
              </button>
              <button
                type="button"
                onClick={() => fetchSlice(Math.max(1, totalLines - 230))}
                className="px-2.5 py-1 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/50 rounded"
              >
                Jump to TerritorialGym
              </button>
            </div>
          </div>

          {/* Search Matches Strip */}
          {searchMatches.length > 0 && (
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 max-h-44 overflow-y-auto">
              <div className="text-xs font-medium text-slate-400">
                Found {searchMatches.length} matches for <code className="text-emerald-400">{searchQuery}</code> (click any match to jump):
              </div>
              <div className="space-y-1">
                {searchMatches.map((m) => (
                  <button
                    key={m.line}
                    type="button"
                    onClick={() => fetchSlice(Math.max(1, m.line - 5))}
                    className="w-full text-left px-2.5 py-1 text-xs font-mono hover:bg-slate-800 rounded flex items-center gap-3 transition-colors"
                  >
                    <span className="text-amber-400 w-16 shrink-0 tabular-nums">Line {m.line}</span>
                    <span className="text-slate-300 truncate">{m.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Code Viewer */}
          <div className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
            <div className="overflow-x-auto max-h-[540px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
              {loadingSlice ? (
                <div className="py-12 text-center text-slate-400">Loading deobfuscated source lines...</div>
              ) : (
                slice.map((item) => {
                  const isHighlighted =
                    searchQuery.trim().length > 0 &&
                    item.text.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <div
                      key={item.line}
                      className={`flex items-start gap-4 px-2 py-0.5 rounded ${
                        isHighlighted ? 'bg-emerald-950/60 text-emerald-200' : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <span className="w-14 shrink-0 text-right text-slate-500 select-none tabular-nums">
                        {item.line}
                      </span>
                      <span className="whitespace-pre break-all">{item.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'python' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono">
                deobfuscate_territorial.py
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                String-safe tokenizer, S[] inliner, L() localizer annotator, symbol renamer, formatter, and TerritorialGym injector.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPython}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                {copiedPy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPy ? 'Copied' : 'Copy Script'}</span>
              </button>
              <a
                href="/deobfuscate_territorial.py"
                download="deobfuscate_territorial.py"
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .py</span>
              </a>
            </div>
          </div>
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto max-h-[560px] overflow-y-auto leading-relaxed">
            {pyScript || 'Loading Python script...'}
          </pre>
        </div>
      )}

      {subTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Filter S and L84 string tables"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                placeholder="Filter S[...] or L(...) strings..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono tabular-nums">
              var S = [{sTable.length} strings] · this.L84 = [{lTable.length} localization strings]
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* S[] String Table */}
            <div className="border border-slate-800 rounded-lg bg-slate-900/60 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  Inlined String Table (var S = [...])
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {sTable.length} entries
                </span>
              </div>
              <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-800/70 font-mono text-xs">
                {sTable
                  .map((val, idx) => ({ idx, val }))
                  .filter(
                    (item) =>
                      !tableFilter.trim() ||
                      item.val.toLowerCase().includes(tableFilter.toLowerCase()) ||
                      `s[${item.idx}]`.includes(tableFilter.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.idx} className="px-4 py-2 flex items-start gap-3 hover:bg-slate-800/40">
                      <span className="text-amber-400 w-16 shrink-0 tabular-nums">S[{item.idx}]</span>
                      <span className="text-slate-300 break-all">
                        {JSON.stringify(item.val.length > 90 ? item.val.slice(0, 90) + '...' : item.val)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* L84[] Localization Table */}
            <div className="border border-slate-800 rounded-lg bg-slate-900/60 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 font-mono">
                  Annotated Localization Table (L(index))
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {lTable.length} entries
                </span>
              </div>
              <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-800/70 font-mono text-xs">
                {lTable
                  .map((val, idx) => ({ idx, val }))
                  .filter(
                    (item) =>
                      !tableFilter.trim() ||
                      item.val.toLowerCase().includes(tableFilter.toLowerCase()) ||
                      `l(${item.idx})`.includes(tableFilter.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.idx} className="px-4 py-2 flex items-start gap-3 hover:bg-slate-800/40">
                      <span className="text-emerald-400 w-16 shrink-0 tabular-nums">L({item.idx})</span>
                      <span className="text-slate-300 break-words">{JSON.stringify(item.val)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
