'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateSessionNotes } from '@/lib/storage';
import { SessionConfig, SessionStats } from '@/lib/types';
import { calculateFocusScore, formatFocusTime, formatTime, getFocusGrade } from '@/lib/utils';

interface Props {
  sessionId: string;
  stats: SessionStats;
  config: SessionConfig;
  onReset: () => void;
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-3">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${highlight ? 'text-green-400' : 'text-zinc-100'}`}>
        {value}
      </span>
    </div>
  );
}

export function SessionSummary({ sessionId, stats, config, onReset }: Props) {
  const sessionDurationMs = config.durationMinutes * 60_000;
  const score = stats.focusScore ?? calculateFocusScore(
    stats.totalFocusedMs,
    sessionDurationMs,
    stats.violationCount
  );
  const grade = getFocusGrade(score);

  const focusPct = sessionDurationMs > 0
    ? Math.round((stats.totalFocusedMs / sessionDurationMs) * 100)
    : 0;

  const [notes, setNotes] = useState(stats.notes ?? '');

  const handleNotesChange = (val: string) => {
    setNotes(val);
    updateSessionNotes(sessionId, val);
  };

  const message =
    score >= 90 ? 'Clean session.' :
    score >= 80 ? 'Solid.' :
    score >= 70 ? 'Some drift, but you stayed in it.' :
    score >= 60 ? 'Rough one. Tighten up next time.' :
    'You need to lock in.';

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className={`px-6 py-4 ${grade.bg} border-b border-zinc-800`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Session Complete</p>
          <p className="mt-1 text-sm text-zinc-300">{message}</p>
        </div>

        <div className="p-6">
          {/* Score */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="mb-1 text-xs text-zinc-500">Focus Score</p>
              <div className={`text-7xl font-black leading-none ${grade.color}`}>{score}</div>
            </div>
            <div className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl ring-2 ${grade.ring} ${grade.bg}`}>
              <span className={`text-4xl font-black ${grade.color}`}>{grade.label}</span>
              <span className="mt-0.5 text-[10px] text-zinc-500">GRADE</span>
            </div>
          </div>

          {/* Focus bar */}
          <div className="mb-6">
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
              <span>Focus efficiency</span>
              <span className="font-semibold text-zinc-300">{focusPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${focusPct}%` }} />
            </div>
          </div>

          {/* Task */}
          {stats.taskTitle && (
            <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-800/40 px-4 py-2.5 text-xs">
              <span className="text-zinc-600">Working on </span>
              <span className="font-medium text-zinc-300">{stats.taskTitle}</span>
            </div>
          )}

          {/* Stats */}
          <div className="mb-4 space-y-2">
            <StatRow label="Focused time"        value={formatFocusTime(stats.totalFocusedMs)} highlight />
            <StatRow label="Total violations"    value={String(stats.violationCount)} />
            <StatRow label="Longest distraction" value={formatTime(stats.longestDistractionMs)} />
            <StatRow label="Breaks used"         value={`${stats.breakUsed} / ${config.breakLimit}`} />
            {stats.breakUsed > 0 && (
              <StatRow label="Total break time"  value={formatFocusTime(stats.breakTimeUsedMs)} />
            )}
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Session notes (optional)…"
            rows={2}
            className="mb-4 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 py-2.5 text-xs text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />

          <button
            onClick={onReset}
            className="w-full rounded-xl bg-green-500 px-4 py-3 font-bold text-black transition hover:bg-green-400"
          >
            Start New Session
          </button>
          <Link
            href="/stats"
            className="mt-2 block w-full rounded-xl border border-zinc-700 px-4 py-3 text-center text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          >
            View Stats
          </Link>
        </div>
      </div>
    </div>
  );
}
