'use client';

import { SessionConfig, SessionStats } from '@/lib/types';
import { calculateFocusScore, formatFocusTime, formatTime, getFocusGrade } from '@/lib/utils';

interface Props {
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

export function SessionSummary({ stats, config, onReset }: Props) {
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

  const message =
    score >= 90 ? 'Excellent focus maintained throughout the session.' :
    score >= 80 ? 'Strong performance with minimal interruptions.' :
    score >= 70 ? 'Moderate performance. Some attention gaps recorded.' :
    score >= 60 ? 'Below target. Consider adjusting your environment or threshold.' :
    'Significant interruptions recorded this session.';

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header band */}
        <div className={`px-6 py-4 ${grade.bg} border-b border-zinc-800`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Session Complete
          </p>
          <p className="mt-1 text-sm text-zinc-300">{message}</p>
        </div>

        <div className="p-6">
          {/* Score display */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Focus Score</p>
              <div className={`text-7xl font-black leading-none animate-score-pop ${grade.color}`}>
                {score}
              </div>
            </div>
            <div className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl ring-2 ${grade.ring} ${grade.bg}`}>
              <span className={`text-4xl font-black ${grade.color}`}>{grade.label}</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">GRADE</span>
            </div>
          </div>

          {/* Focus bar */}
          <div className="mb-6">
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
              <span>Focus efficiency</span>
              <span className="font-semibold text-zinc-300">{focusPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${focusPct}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-6">
            <StatRow label="Focused time"       value={formatFocusTime(stats.totalFocusedMs)} highlight />
            <StatRow label="Total violations"   value={String(stats.violationCount)} />
            <StatRow label="Longest distraction" value={formatTime(stats.longestDistractionMs)} />
            <StatRow
              label="Breaks used"
              value={`${stats.breakUsed} / ${config.breakLimit}`}
            />
            {stats.breakUsed > 0 && (
              <StatRow label="Total break time" value={formatFocusTime(stats.breakTimeUsedMs)} />
            )}
          </div>

          <button
            onClick={onReset}
            className="w-full rounded-xl bg-green-500 px-4 py-3 font-bold text-black transition hover:bg-green-400"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  );
}
