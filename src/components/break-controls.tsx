'use client';

import { formatTime } from '@/lib/utils';

interface Props {
  breakUsed: number;
  breakLimit: number;
  breakActive: boolean;
  breakRemainingMs: number;
  onStartBreak: () => void;
  disabled?: boolean;
}

export function BreakControls({
  breakUsed,
  breakLimit,
  breakActive,
  breakRemainingMs,
  onStartBreak,
  disabled
}: Props) {
  const remaining = breakLimit - breakUsed;
  const exhausted  = remaining <= 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Break dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: Math.max(breakLimit, 1) }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < breakUsed ? 'bg-zinc-600' : 'bg-yellow-400'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-zinc-500">
          {remaining} break{remaining !== 1 ? 's' : ''} left
        </span>
      </div>

      {breakActive ? (
        <div className="rounded-xl border border-yellow-800/50 bg-yellow-900/20 px-4 py-3 text-center">
          <p className="text-xs text-yellow-500 mb-1">Break ends in</p>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">{formatTime(breakRemainingMs)}</p>
        </div>
      ) : (
        <button
          onClick={onStartBreak}
          disabled={disabled || exhausted}
          className="w-full rounded-xl border border-yellow-700/40 bg-yellow-500/10 px-4 py-2.5 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Take Break
        </button>
      )}
    </div>
  );
}
