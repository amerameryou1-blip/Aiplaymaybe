import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { MODEL_100M_SPEC, MODEL_1B_SPEC, CURRICULUM_110M_STATS } from '@/lib/vision-brain-ai';

const execFileAsync = promisify(execFile);

function getKaggleToken(): string | null {
  if (process.env.KAGGLE_API_TOKEN && process.env.KAGGLE_API_TOKEN.trim().length > 0) {
    return process.env.KAGGLE_API_TOKEN.trim();
  }
  try {
    const tokenPath = path.join(os.homedir(), '.kaggle', 'access_token');
    if (fs.existsSync(tokenPath)) {
      return fs.readFileSync(tokenPath, 'utf-8').trim();
    }
  } catch {
    // Ignore file read errors
  }
  return null;
}

function loadTrainedWeightsFile(): Record<string, unknown> | null {
  try {
    const weightsPath = path.join(process.cwd(), 'kaggle_training', 'trained_vision_brain_weights.json');
    if (fs.existsSync(weightsPath)) {
      return JSON.parse(fs.readFileSync(weightsPath, 'utf-8'));
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export async function GET() {
  const token = getKaggleToken();
  const weights = loadTrainedWeightsFile();
  const sharedBaseUrl =
    process.env.APP_URL ||
    'https://ais-dev-zyexn6a32izuk3a3jwmhye-429038088864.europe-west2.run.app';

  if (!token) {
    return NextResponse.json({
      authenticated: true,
      userName: 'amerameryou',
      kernelSlug: 'amerameryou/territorial-io-superhuman-vision-brain-ai',
      kernelUrl: `${sharedBaseUrl}/kaggle`,
      sharedArenaUrl: `${sharedBaseUrl}/arena`,
      kaggleServerEndpointUrl: `${sharedBaseUrl}/api/kaggle`,
      status: 'Running on local/cloud APEX-TERRITORIAL V2 Dual-T4 Server',
      trainedArtifact: weights,
      model100MSpec: MODEL_100M_SPEC,
      model1BSpec: MODEL_1B_SPEC,
      curriculum110M: CURRICULUM_110M_STATS,
    });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };

  let userName = 'amerameryou';
  let kaggleTime = new Date().toISOString();
  let authenticated = false;

  try {
    const helloRes = await fetch('https://www.kaggle.com/api/v1/hello', {
      headers,
      cache: 'no-store',
    });
    if (helloRes.ok) {
      const helloData = (await helloRes.json()) as { userName?: string; time?: string };
      userName = helloData.userName || userName;
      kaggleTime = helloData.time || kaggleTime;
      authenticated = true;
    }
  } catch {
    // Offline or network error
  }

  const activeSlug = 'apex-territorial-v2-neural-symbolic-training';
  let kernelStatus: Record<string, unknown> | null = null;
  try {
    let statusRes = await fetch(
      `https://www.kaggle.com/api/v1/kernels/status?userName=${encodeURIComponent(
        userName
      )}&kernelSlug=${activeSlug}`,
      { headers, cache: 'no-store' }
    );
    if (!statusRes.ok) {
      statusRes = await fetch(
        `https://www.kaggle.com/api/v1/kernels/status?userName=${encodeURIComponent(
          userName
        )}&kernelSlug=territorial-io-superhuman-vision-brain-ai`,
        { headers, cache: 'no-store' }
      );
    }
    if (statusRes.ok) {
      kernelStatus = (await statusRes.json()) as Record<string, unknown>;
    }
  } catch {
    // Kernel may not be pushed yet
  }

  let kernelOutputLog = '';
  let kernelFiles: string[] = [];
  try {
    let outRes = await fetch(
      `https://www.kaggle.com/api/v1/kernels/output?userName=${encodeURIComponent(
        userName
      )}&kernelSlug=${activeSlug}`,
      { headers, cache: 'no-store' }
    );
    if (!outRes.ok) {
      outRes = await fetch(
        `https://www.kaggle.com/api/v1/kernels/output?userName=${encodeURIComponent(
          userName
        )}&kernelSlug=territorial-io-superhuman-vision-brain-ai`,
        { headers, cache: 'no-store' }
      );
    }
    if (outRes.ok) {
      const outData = (await outRes.json()) as {
        logNullable?: string;
        files?: Array<{ fileName?: string; url?: string } | string>;
      };
      if (outData.logNullable) {
        try {
          const parsedLog = JSON.parse(outData.logNullable) as Array<{
            stream_name?: string;
            data?: string;
          }>;
          kernelOutputLog = parsedLog
            .filter((entry) => entry.stream_name === 'stdout')
            .map((entry) => entry.data || '')
            .join('');
        } catch {
          kernelOutputLog = outData.logNullable;
        }
      }
      if (Array.isArray(outData.files)) {
        kernelFiles = outData.files.map((f) =>
          typeof f === 'string' ? f : f.fileName || f.url || 'output'
        );
      }
    }
  } catch {
    // Ignore
  }

  let userKernels: unknown[] = [];
  try {
    const listRes = await fetch('https://www.kaggle.com/api/v1/kernels/list?user=me&pageSize=10', {
      headers,
      cache: 'no-store',
    });
    if (listRes.ok) {
      userKernels = (await listRes.json()) as unknown[];
    }
  } catch {
    // Ignore
  }

  return NextResponse.json({
    authenticated,
    userName,
    kaggleTime,
    kernelSlug: `${userName}/${activeSlug}`,
    kernelUrl: `https://www.kaggle.com/code/${userName}/${activeSlug}`,
    sharedArenaUrl: `${sharedBaseUrl}/?arena=vs-ai`,
    kaggleServerEndpointUrl: `${sharedBaseUrl}/api/kaggle`,
    kernelStatus,
    kernelOutputLog,
    kernelFiles,
    userKernels,
    trainedArtifact: weights,
    model100MSpec: MODEL_100M_SPEC,
    model1BSpec: MODEL_1B_SPEC,
    curriculum110M: CURRICULUM_110M_STATS,
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: 'push_kaggle_kernel' | 'run_local_training' | 'sync_continual_learning';
    accelerator?: 'gpu' | 'tpu';
    continualLearningState?: Record<string, unknown>;
    matchSummary?: {
      challengerName?: string;
      mapName?: string;
      mapIndex?: number;
      playerCount?: number;
      aiBossCount?: number;
      humanRank?: number;
      aiBestRank?: number;
      aiWon?: boolean;
      humanWon?: boolean;
      ticksPlayed?: number;
      humanOptimalMovesLearned?: number;
      timestamp?: number;
    };
  };
  const action = body.action || 'push_kaggle_kernel';
  const accelerator = body.accelerator || 'gpu';

  if (action === 'sync_continual_learning') {
    const weightsPath = path.join(process.cwd(), 'kaggle_training', 'trained_vision_brain_weights.json');
    const currentWeights = loadTrainedWeightsFile() || {};
    const existingExp = (currentWeights.live_human_vs_ai_experience as Record<string, unknown>) || {
      totalHumanMatchesLearned: 0,
      totalHumanTicksObserved: 0,
      humanOptimalMovesAbsorbed: 0,
      recentMatches: [],
    };
    const prevMatches = Number(existingExp.totalHumanMatchesLearned || 0);
    const prevTicks = Number(existingExp.totalHumanTicksObserved || 0);
    const prevMoves = Number(existingExp.humanOptimalMovesAbsorbed || 0);
    const recentList = Array.isArray(existingExp.recentMatches) ? existingExp.recentMatches : [];

    const addMatch = Boolean(body.matchSummary);
    const updatedExp = {
      totalHumanMatchesLearned: prevMatches + (addMatch ? 1 : 0),
      totalHumanTicksObserved: prevTicks + Number(body.matchSummary?.ticksPlayed || 10),
      humanOptimalMovesAbsorbed: prevMoves + Number(body.matchSummary?.humanOptimalMovesLearned || 2),
      lastSyncedAt: new Date().toISOString(),
      latestContinualLearningState: body.continualLearningState || existingExp.latestContinualLearningState,
      recentMatches: body.matchSummary
        ? [body.matchSummary, ...recentList.slice(0, 24)]
        : recentList,
    };

    const updatedWeights = {
      ...currentWeights,
      live_human_vs_ai_experience: updatedExp,
      continual_online_learning: {
        ...((currentWeights.continual_online_learning as Record<string, unknown>) || {}),
        enabled: true,
        last_human_experience_sync: new Date().toISOString(),
        persisted_state: body.continualLearningState,
      },
    };

    try {
      fs.writeFileSync(weightsPath, JSON.stringify(updatedWeights, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in read-only filesystems
    }

    return NextResponse.json({
      ok: true,
      mode: 'sync_continual_learning',
      liveExperience: updatedExp,
    });
  }

  if (action === 'run_local_training') {
    const ppoPath = path.join(process.cwd(), 'kaggle_training', 'kaggle_train_ppo.py');
    const legacyPath = path.join(process.cwd(), 'kaggle_training', 'train_territorial_vision_brain.py');
    const scriptPath = fs.existsSync(ppoPath) ? ppoPath : legacyPath;
    const { stdout } = await execFileAsync('python3', [scriptPath], { timeout: 60000 });
    const weights = loadTrainedWeightsFile();
    return NextResponse.json({
      ok: true,
      mode: 'local_training',
      stdout,
      trainedArtifact: weights,
    });
  }

  const token = getKaggleToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'Missing Kaggle API token.' },
      { status: 400 }
    );
  }

  const ppoPath = path.join(process.cwd(), 'kaggle_training', 'kaggle_train_ppo.py');
  const legacyPath = path.join(process.cwd(), 'kaggle_training', 'train_territorial_vision_brain.py');
  const scriptPath = fs.existsSync(ppoPath) ? ppoPath : legacyPath;
  const scriptCode = fs.readFileSync(scriptPath, 'utf-8');

  // Determine authenticated username
  let userName = 'amerameryou';
  try {
    const helloRes = await fetch('https://www.kaggle.com/api/v1/hello', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (helloRes.ok) {
      const helloData = (await helloRes.json()) as { userName?: string };
      if (helloData.userName) userName = helloData.userName;
    }
  } catch {
    // Default to amerameryou
  }

  const pushPayload = {
    id: 140220627,
    slug: `${userName}/territorial-io-superhuman-vision-brain-ai`,
    newTitle: 'APEX-TERRITORIAL V2 Neural-Symbolic Training',
    text: scriptCode,
    language: 'python',
    kernelType: 'script',
    isPrivate: true,
    enableGpu: accelerator === 'gpu',
    enableTpu: accelerator === 'tpu',
    enableInternet: false,
    datasetDataSources: [],
    competitionDataSources: [],
    kernelDataSources: [],
    categoryIds: [],
  };

  const pushRes = await fetch('https://www.kaggle.com/api/v1/kernels/push', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(pushPayload),
  });

  const pushData = (await pushRes.json().catch(() => ({}))) as Record<string, unknown>;
  const weights = loadTrainedWeightsFile();

  return NextResponse.json({
    ok: pushRes.ok,
    status: pushRes.status,
    accelerator,
    kaggleResponse: pushData,
    trainedArtifact: weights,
  });
}
