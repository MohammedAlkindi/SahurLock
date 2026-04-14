'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import {
  clearAllData,
  deleteSessionById,
  loadAggregate,
  loadHistory,
} from '@/lib/storage';
import { AggregateStats, SessionHistoryItem } from '@/lib/types';
import { calculateFocusScore, formatFocusTime, formatTime, getFocusGrade } from '@/lib/utils';

function safeScore(item: SessionHistoryItem): number {
  const s = item.stats.focusScore ?? calculateFocusScore(
    item.stats.totalFocusedMs,
    item.config.durationMinutes * 60_000,
    item.stats.violationCount,
  );
  return Number.isNaN(s) ? 0 : s;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${accent ?? 'text-foreground'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground/60">{sub}</p>}
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color     = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex flex-col items-center gap-1" title={`${label}: ${score}`}>
      <span className={`text-[10px] font-bold tabular-nums ${textColor}`}>{score}</span>
      <div className="relative w-7 overflow-hidden rounded-sm bg-muted" style={{ height: 72 }}>
        <div className={`absolute bottom-0 w-full rounded-sm ${color}`} style={{ height: `${Math.max(2, score)}%` }} />
      </div>
      <span className="w-7 overflow-hidden truncate text-center text-[9px] text-muted-foreground/60">{label}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function StatsPage() {
  const [agg,       setAgg]       = useState<AggregateStats | null>(null);
  const [history,   setHistory]   = useState<SessionHistoryItem[]>([]);
  const [confirming, setConfirming] = useState(false);

  const reload = () => {
    setAgg(loadAggregate());
    setHistory(loadHistory());
  };

  useEffect(() => { reload(); }, []);

  if (!agg) return null;

  const hasData   = agg.sessions > 0;
  const rawAvg    = hasData ? agg.totalFocusScore / agg.sessions : 0;
  const avgScore  = Number.isNaN(rawAvg) ? 0 : Math.round(rawAvg);
  const bestScore = history.length
    ? Math.max(...history.map(safeScore))
    : 0;

  const chartItems = [...history].slice(0, 16).reverse().map((item) => ({
    score: safeScore(item),
    label: item.stats.startedAt
      ? new Date(item.stats.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : '—',
    id: item.id,
  }));

  const handleDelete = (id: string) => {
    deleteSessionById(id);
    reload();
  };

  const handleClearAll = () => {
    clearAllData();
    setConfirming(false);
    reload();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black tracking-tight">Stats</h1>
        <div className="flex items-center gap-2">
          {hasData && (
            confirming ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-900/20 px-3 py-2">
                <span className="text-xs text-red-300">Delete everything?</span>
                <button onClick={handleClearAll} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 transition">Yes, clear</button>
                <button onClick={() => setConfirming(false)} className="text-xs text-muted-foreground hover:text-foreground transition">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-red-800/60 hover:text-red-400 transition">
                Clear data
              </button>
            )
          )}
          <Link href="/session" className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground hover:opacity-90 transition">
            New Session
          </Link>
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card/50 py-24 text-center">
          <p className="text-base font-semibold text-muted-foreground">No sessions yet</p>
          <Link href="/session" className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition">
            Start a session
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Sessions"   value={String(agg.sessions)} />
            <StatCard label="Focus time" value={formatFocusTime(agg.totalFocusedMs)} accent="text-green-400" />
            <StatCard label="Avg score"  value={String(avgScore)}  accent={getFocusGrade(avgScore).color} />
            <StatCard label="Best score" value={String(bestScore)} accent={getFocusGrade(bestScore).color} />
            <StatCard
              label="Streak"
              value={`${agg.currentStreak}d`}
              sub={`best ${agg.longestStreak}d`}
              accent={agg.currentStreak > 0 ? 'text-orange-400' : 'text-muted-foreground'}
            />
          </div>

          {chartItems.length > 1 && (
            <div className="mb-5 rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Score trend</h2>
                <div className="flex gap-3 text-[10px] text-muted-foreground/50">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 rounded bg-green-500/50" />80+</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 rounded bg-yellow-500/50" />60–79</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-2.5 rounded bg-red-500/50" />&lt;60</span>
                </div>
              </div>
              <div className="flex items-end gap-1.5 overflow-x-auto pb-1">
                {chartItems.map((s) => <ScoreBar key={s.id} score={s.score} label={s.label} />)}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold text-foreground">
                History
                <span className="ml-2 text-xs font-normal text-muted-foreground">{history.length} session{history.length !== 1 ? 's' : ''}</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Focus %</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Violations</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Longest lapse</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => {
                    const score     = safeScore(item);
                    const grade     = getFocusGrade(score);
                    const sessionMs = item.config.durationMinutes * 60_000;
                    const focusPct  = sessionMs > 0 ? Math.round((item.stats.totalFocusedMs / sessionMs) * 100) : 0;

                    return (
                      <tr key={item.id} className="border-b border-border/40 transition hover:bg-muted/20">
                        <td className="px-5 py-3">
                          <p className="text-xs text-muted-foreground">
                            {item.stats.startedAt
                              ? new Date(item.stats.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </p>
                          {item.stats.taskTitle && (
                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground/50">{item.stats.taskTitle}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground">{item.config.durationMinutes} min</td>
                        <td className="px-4 py-3">
                          <span className={`font-bold tabular-nums ${grade.color}`}>{score}</span>
                          <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${grade.bg} ${grade.color}`}>{grade.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div className={`h-full rounded-full ${focusPct >= 80 ? 'bg-green-500' : focusPct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${focusPct}%` }} />
                            </div>
                            <span className="tabular-nums text-xs text-muted-foreground">{focusPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={item.stats.violationCount === 0 ? 'text-green-400' : 'text-foreground'}>
                            {item.stats.violationCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground">
                          {item.stats.longestDistractionMs > 0 ? formatTime(item.stats.longestDistractionMs) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded p-1.5 text-muted-foreground/30 transition hover:bg-muted hover:text-red-400"
                            aria-label="Delete session"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {history.length === 30 && (
              <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                Showing last 30 sessions
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
