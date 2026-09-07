import type { Config, DailyProgress, Stats, TileState } from '../types';

const CONFIG_KEY = 'wordleConfig';
const DAILY_KEY = 'wordleDaily';
const STATS_KEY = 'wordleStats';

// --- Config ---

export function loadConfig(): Partial<Config> {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveConfig(config: Config): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// --- Daily progress ---

export function loadDailyProgress(key: string): DailyProgress | null {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, DailyProgress>;
    return all[key] ?? null;
  } catch {
    return null;
  }
}

export function saveDailyProgress(key: string, progress: DailyProgress): void {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    const all: Record<string, DailyProgress> = raw ? JSON.parse(raw) : {};
    all[key] = progress;
    // Keep only last 30 keys to avoid unbounded growth
    const keys = Object.keys(all);
    if (keys.length > 30) delete all[keys[0]];
    localStorage.setItem(DAILY_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

// --- Stats ---

export function loadStats(key: string): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats();
    const all = JSON.parse(raw) as Record<string, Stats>;
    return all[key] ?? defaultStats();
  } catch {
    return defaultStats();
  }
}

export function saveStats(key: string, stats: Stats): void {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    const all: Record<string, Stats> = raw ? JSON.parse(raw) : {};
    all[key] = stats;
    localStorage.setItem(STATS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function updateStats(
  key: string,
  won: boolean,
  attempts: number,
): Stats {
  const stats = loadStats(key);
  stats.played += 1;
  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    const bucket = String(attempts);
    stats.distribution[bucket] = (stats.distribution[bucket] ?? 0) + 1;
  } else {
    stats.currentStreak = 0;
  }
  saveStats(key, stats);
  return stats;
}

function defaultStats(): Stats {
  return { played: 0, won: 0, currentStreak: 0, maxStreak: 0, distribution: {} };
}

export function buildEvaluationsFromRaw(raw: { guesses: string[]; evaluations: unknown[][] }): TileState[][] {
  return raw.evaluations.map(row =>
    (row as string[]).map(v => v as TileState)
  );
}
