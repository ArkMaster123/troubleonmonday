import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'troubleadmin2024';
const DEFAULT_WEEKLY_POST_COUNT = 3;
const MIN_WEEKLY_POST_COUNT = 1;
const MAX_WEEKLY_POST_COUNT = 20;
const SETTINGS_PATH = path.join(process.cwd(), 'data', 'admin-settings.json');

type AdminSettings = {
  weekly_post_count: number | null;
};

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === ADMIN_PASSWORD;
}

function parseWeeklyPostCount(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  if (value < MIN_WEEKLY_POST_COUNT || value > MAX_WEEKLY_POST_COUNT) return null;
  return value;
}

function readEnvWeeklyPostCount(): number {
  const parsed = Number.parseInt(process.env.WEEKLY_POST_COUNT ?? '', 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_WEEKLY_POST_COUNT;
  return parsed;
}

function toResponse(settings: AdminSettings) {
  const envWeeklyPostCount = readEnvWeeklyPostCount();
  const effectiveWeeklyPostCount = settings.weekly_post_count ?? envWeeklyPostCount;

  return {
    settings,
    effective_weekly_post_count: effectiveWeeklyPostCount,
    source: settings.weekly_post_count === null ? 'env_or_default' : 'admin',
  };
}

async function loadSettings(): Promise<AdminSettings> {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      weekly_post_count: parseWeeklyPostCount(parsed?.weekly_post_count),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { weekly_post_count: null };
    }
    throw error;
  }
}

async function saveSettings(settings: AdminSettings): Promise<void> {
  const dir = path.dirname(SETTINGS_PATH);
  await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_PATH, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await loadSettings();
    return NextResponse.json(toResponse(settings));
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const weeklyPostCount = body?.weekly_post_count;

    if (typeof weeklyPostCount !== 'number' || !Number.isInteger(weeklyPostCount)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid weekly_post_count. Expected an integer between 1 and 20.',
        },
        { status: 400 }
      );
    }

    if (weeklyPostCount < MIN_WEEKLY_POST_COUNT || weeklyPostCount > MAX_WEEKLY_POST_COUNT) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid weekly_post_count. Expected an integer between 1 and 20.',
        },
        { status: 400 }
      );
    }

    const settings: AdminSettings = { weekly_post_count: weeklyPostCount };
    await saveSettings(settings);

    return NextResponse.json({ success: true, ...toResponse(settings) });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
