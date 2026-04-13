'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadAggregate, loadHistory } from '@/lib/storage';
import { AggregateStats, SessionHistoryItem } from '@/lib/types';
import {
  calculateFocusScore,
  formatFocusTime,
  formatTime,
  getFocusGrade
} from '@/lib/utils';

// ── Sub-components ─────────────────────────────────────────────────────────────
function AggCard({
  label,
  value,
  sub,
  accent
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 text-3xl font-black tabular-nums ${accent ?? 'text-white'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
    </div>
  );
}

function ScoreBar({ score, date }: { score: number; date: string }) {
  const grade = getFocusGrade(score);
  return (
    <div className="group flex flex-col items-center gap-1">
      <span className={`text-xs font-bold ${grade.color}`}>{score}</span>
      <div
        className="relative w-8 rounded-sm bg-zinc-800 overflow-hidden"
        style={{ height: '80px' }}
        title={`${date}: ${score}`}
      >
        <div
          className={`absolute bottom-0 w-full rounded-sm transition-all ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ height: `${score}%` }}
        />
      </div>
      <span className="text-[9px] text-zinc-600 rotate-45 origin-left mt-1 w-6 overflow-hidden truncate">
        {date.split(' ').slice(1, 3).join(' ')}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const [agg, setAgg]         = useState<AggregateStats | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);

  useEffect(() => {
    setAgg(loadAggregate());
    setHistory(loadHistory());
  }, []);

  if (!agg) return null;

  const hasData = agg.sessions > 0;
  const avgScore = hasData && agg.sessions > 0
    ? Math.round(agg.totalFocusScore / agg.sessions)
    : 0;

  // Last 12 sessions for chart (chronological order)
  const chartSessions = [...history].slice(0, 12).reverse().map((item) => {
    const score = item.stats.focusScore ?? calculateFocusScore(
      item.stats.totalFocusedMs,
      item.config.durationMinutes * 60_000,
      item.stats.violationCount
    );
    const date = item.stats.startedAt
      ? new Date(item.stats.startedAt).toDateString()
      : '—';
    return { score, date, id: item.id };
  });

  // Recent 5 sessions for table
  const recentSessions = history.slice(0, 5).map((item) => {
    const score = item.stats.focusScore ?? calculateFocusScore(
      item.stats.totalFocusedMs,
      item.config.durationMinutes * 60_000,
      item.stats.violationCount
    );
    const grade = getFocusGrade(score);
    return { item, score, grade };
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your Stats</h1>
          <p className="mt-1 text-sm text-zinc-500">Local data only — never uploaded.</p>
        </div>
        <Link
          href="/session"
          className="rounded-xl bg-green-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-green-400 transition"
        >
          New Session
        </Link>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 py-24 text-center">
          <p className="text-lg font-semibold text-zinc-300">No sessions recorded</p>
          <p className="text-sm text-zinc-600">Complete a session to see data here.</p>
          <Link href="/session" className="mt-3 rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-green-400 transition">
            Start a session
          </Link>
        </div>
      ) : (
        <>
          {/* Streak */}
          <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-600">Daily streak</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <span className="font-mono text-5xl font-black tabular-nums text-zinc-100">
                  {agg.currentStreak}
                </span>
                <span className="ml-2 text-base text-zinc-500">
                  day{agg.currentStreak !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-600">Best</p>
                <p className="font-mono text-xl font-bold text-zinc-400">
                  {agg.longestStreak}
                  <span className="ml-1 text-sm font-normal text-zinc-600">day{agg.longestStreak !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Aggregate cards ─────────────────────────────────────────── */}
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <AggCard
              label="Sessions"
              value={String(agg.sessions)}
              sub="total completed"
            />
            <AggCard
              label="Total Focus"
              value={formatFocusTime(agg.totalFocusedMs)}
              sub="focused time"
              accent="text-green-400"
            />
            <AggCard
              label="Avg Score"
              value={String(avgScore)}
              sub="focus quality"
              accent={getFocusGrade(avgScore).color}
            />
            <AggCard
              label="Violations"
              value={String(agg.totalViolations)}
              sub="all time"
              accent={agg.totalViolations === 0 ? 'text-green-400' : 'text-zinc-300'}
            />
          </div>

          {/* ── Score chart ─────────────────────────────────────────────── */}
          {chartSessions.length > 0 && (
            <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
              <h2 className="mb-5 text-sm font-semibold text-zinc-300">
                Focus Score — last {chartSessions.length} sessions
              </h2>
              <div className="flex items-end gap-2 overflow-x-auto pb-4">
                {chartSessions.map((s) => (
                  <ScoreBar key={s.id} score={s.score} date={s.date} />
                ))}
              </div>
              {/* Y-axis reference lines */}
              <div className="mt-2 flex gap-4 text-xs text-zinc-700">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-green-600/50" />80–100</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-yellow-600/50" />60–79</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded bg-red-600/50" />&lt;60</span>
              </div>
            </div>
          )}

          {/* ── Recent sessions table ──────────────────────────────────── */}
          {recentSessions.length > 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-3">
                <h2 className="text-sm font-semibold text-zinc-300">Recent Sessions</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-600">
                    <th className="px-5 py-2.5 text-left font-medium">Date</th>
                    <th className="px-5 py-2.5 text-left font-medium">Duration</th>
                    <th className="px-5 py-2.5 text-left font-medium">Score</th>
                    <th className="px-5 py-2.5 text-left font-medium">Focused</th>
                    <th className="px-5 py-2.5 text-left font-medium">Violations</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map(({ item, score, grade }) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="px-5 py-3 text-zinc-400 text-xs">
                        {item.stats.startedAt
                          ? new Date(item.stats.startedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{item.config.durationMinutes} min</td>
                      <td className="px-5 py-3">
                        <span className={`font-bold ${grade.color}`}>{score}</span>
                        <span className={`ml-1.5 rounded px-1.5 py-0.5 text-xs font-bold ${grade.bg} ${grade.color}`}>
                          {grade.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-300">{formatFocusTime(item.stats.totalFocusedMs)}</td>
                      <td className="px-5 py-3">
                        <span className={item.stats.violationCount === 0 ? 'text-green-400' : 'text-zinc-300'}>
                          {item.stats.violationCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length > 5 && (
                <div className="border-t border-zinc-800 px-5 py-3 text-xs text-zinc-600">
                  Showing 5 of {history.length} sessions (last 30 stored)
                </div>
              )}
            </div>
          )}

          {/* ── All-time records ──────────────────────────────────────── */}
          <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-600">All-time records</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-zinc-500 text-xs">Longest distraction</p>
                <p className="text-zinc-200 font-semibold">{formatTime(agg.longestDistractionMs)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Total break time</p>
                <p className="text-zinc-200 font-semibold">{formatFocusTime(agg.totalBreakTimeMs)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Last session</p>
                <p className="text-zinc-200 font-semibold">{agg.lastSessionDate || '—'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
