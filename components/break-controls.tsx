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
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h3 className="font-semibold">Break Controls</h3>
      <p className="mt-1 text-sm text-zinc-400">
        {breakUsed}/{breakLimit} breaks used
      </p>
      {breakActive ? <p className="mt-2 text-yellow-400">Break remaining: {formatTime(breakRemainingMs)}</p> : null}
      <button
        onClick={onStartBreak}
        disabled={disabled || breakActive || breakUsed >= breakLimit}
        className="mt-3 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
      >
        Take Break
      </button>
    </section>
  );
}
