import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

let cachedLines: string[] | null = null;
let cachedPyScript: string | null = null;
let cachedSTable: string[] | null = null;
let cachedLTable: string[] | null = null;
let cachedByteSize = 0;

function loadArtifacts() {
  if (!cachedLines) {
    const htmlPath = path.join(process.cwd(), 'public', 'territorial_deobfuscated_full.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');
    cachedByteSize = Buffer.byteLength(html, 'utf-8');
    cachedLines = html.split('\n');

    const sMatch = html.match(/var S=(\[[\s\S]*?\]);/);
    if (sMatch) {
      try {
        cachedSTable = JSON.parse(sMatch[1]);
      } catch {
        cachedSTable = [];
      }
    } else {
      cachedSTable = [];
    }

    const lMatch = html.match(/this\.L84=(\[[\s\S]*?\]);/);
    if (lMatch) {
      try {
        cachedLTable = JSON.parse(lMatch[1]);
      } catch {
        cachedLTable = [];
      }
    } else {
      cachedLTable = [];
    }
  }
  if (!cachedPyScript) {
    const pyPath = path.join(process.cwd(), 'deobfuscate_territorial.py');
    cachedPyScript = fs.existsSync(pyPath) ? fs.readFileSync(pyPath, 'utf-8') : '';
  }
}

export async function GET(req: NextRequest) {
  loadArtifacts();
  const lines = cachedLines || [];
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'slice';

  if (mode === 'tables') {
    return NextResponse.json({
      totalLines: lines.length,
      totalBytes: cachedByteSize,
      sTable: cachedSTable || [],
      lTable: cachedLTable || [],
      pyScript: cachedPyScript || '',
    });
  }

  if (mode === 'search') {
    const query = (searchParams.get('q') || '').trim();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));
    if (!query) {
      return NextResponse.json({ matches: [], totalLines: lines.length });
    }
    const lower = query.toLowerCase();
    const matches: { line: number; text: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(lower)) {
        matches.push({
          line: i + 1,
          text: lines[i].length > 260 ? lines[i].slice(0, 260) + ' ... [truncated long line]' : lines[i],
        });
        if (matches.length >= limit) break;
      }
    }
    return NextResponse.json({ matches, totalLines: lines.length, query });
  }

  const startLine = Math.max(1, Number(searchParams.get('start') || 1));
  const count = Math.min(300, Math.max(10, Number(searchParams.get('count') || 120)));
  const endLine = Math.min(lines.length, startLine + count - 1);

  const slice = [];
  for (let i = startLine - 1; i < endLine; i++) {
    const raw = lines[i] ?? '';
    slice.push({
      line: i + 1,
      text: raw.length > 350 ? raw.slice(0, 350) + ` ... [${raw.length} chars total]` : raw,
    });
  }

  return NextResponse.json({
    totalLines: lines.length,
    totalBytes: cachedByteSize,
    startLine,
    endLine,
    slice,
  });
}
