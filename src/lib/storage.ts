import { AggregateStats, SessionConfig, SessionHistoryItem } from '@/lib/types';

const SETTINGS_KEY = 'sahurlock.settings';
const HISTORY_KEY  = 'sahurlock.history';
const AGG_KEY      = 'sahurlock.aggregate';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const AGGREGATE_DEFAULTS: AggregateStats = {
  sessions: 0,
  totalFocusedMs: 0,
  totalViolations: 0,
  totalBreakTimeMs: 0,
  longestDistractionMs: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: '',
  totalFocusScore: 0
};

function computeStreak(
  lastDate: string,
  current: number,
  longest: number
): { currentStreak: number; longestStreak: number } {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();

  if (!lastDate) return { currentStreak: 1, longestStreak: Math.max(1, longest) };
  if (lastDate === today) return { currentStreak: current, longestStreak: longest };
  if (lastDate === yesterday) {
    const next = current + 1;
    return { currentStreak: next, longestStreak: Math.max(next, longest) };
  }
  // Streak broken
  return { currentStreak: 1, longestStreak: longest };
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const loadSettings = (defaults: SessionConfig): SessionConfig => {
  if (typeof window === 'undefined') return defaults;
  return { ...defaults, ...safeParse<Partial<SessionConfig>>(localStorage.getItem(SETTINGS_KEY), {}) };
};

export const saveSettings = (settings: SessionConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// ── Session history ────────────────────────────────────────────────────────────

export const loadHistory = (): SessionHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  return safeParse<SessionHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
};

export const saveSessionHistory = (item: SessionHistoryItem) => {
  if (typeof window === 'undefined') return;
  const current = loadHistory();
  const next = [item, ...current].slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

// ── Aggregate stats ────────────────────────────────────────────────────────────

export const loadAggregate = (): AggregateStats => {
  if (typeof window === 'undefined') return { ...AGGREGATE_DEFAULTS };
  return safeParse<AggregateStats>(localStorage.getItem(AGG_KEY), { ...AGGREGATE_DEFAULTS });
};

export const updateAggregate = (input: {
  focusedMs: number;
  violations: number;
  breakMs: number;
  longestDistractionMs: number;
  focusScore: number;
}) => {
  if (typeof window === 'undefined') return;
  const agg = loadAggregate();
  const { currentStreak, longestStreak } = computeStreak(
    agg.lastSessionDate,
    agg.currentStreak,
    agg.longestStreak
  );
  const next: AggregateStats = {
    sessions: agg.sessions + 1,
    totalFocusedMs: agg.totalFocusedMs + input.focusedMs,
    totalViolations: agg.totalViolations + input.violations,
    totalBreakTimeMs: agg.totalBreakTimeMs + input.breakMs,
    longestDistractionMs: Math.max(agg.longestDistractionMs, input.longestDistractionMs),
    currentStreak,
    longestStreak,
    lastSessionDate: new Date().toDateString(),
    totalFocusScore: (agg.totalFocusScore ?? 0) + input.focusScore
  };
  localStorage.setItem(AGG_KEY, JSON.stringify(next));
};
