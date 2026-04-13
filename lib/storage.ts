import { AggregateStats, SessionConfig, SessionHistoryItem } from '@/lib/types';

const SETTINGS_KEY = 'sahurlock.settings';
const HISTORY_KEY = 'sahurlock.history';
const AGG_KEY = 'sahurlock.aggregate';

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const loadSettings = (defaults: SessionConfig): SessionConfig => {
  if (typeof window === 'undefined') return defaults;
  return { ...defaults, ...safeParse<Partial<SessionConfig>>(localStorage.getItem(SETTINGS_KEY), {}) };
};

export const saveSettings = (settings: SessionConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

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

export const loadAggregate = (): AggregateStats => {
  if (typeof window === 'undefined') {
    return {
      sessions: 0,
      totalFocusedMs: 0,
      totalViolations: 0,
      totalBreakTimeMs: 0,
      longestDistractionMs: 0
    };
  }
  return safeParse<AggregateStats>(localStorage.getItem(AGG_KEY), {
    sessions: 0,
    totalFocusedMs: 0,
    totalViolations: 0,
    totalBreakTimeMs: 0,
    longestDistractionMs: 0
  });
};

export const updateAggregate = (input: {
  focusedMs: number;
  violations: number;
  breakMs: number;
  longestDistractionMs: number;
}) => {
  if (typeof window === 'undefined') return;
  const agg = loadAggregate();
  const next: AggregateStats = {
    sessions: agg.sessions + 1,
    totalFocusedMs: agg.totalFocusedMs + input.focusedMs,
    totalViolations: agg.totalViolations + input.violations,
    totalBreakTimeMs: agg.totalBreakTimeMs + input.breakMs,
    longestDistractionMs: Math.max(agg.longestDistractionMs, input.longestDistractionMs)
  };
  localStorage.setItem(AGG_KEY, JSON.stringify(next));
};
