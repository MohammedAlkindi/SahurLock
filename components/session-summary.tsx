'use client';

import { SessionStats } from '@/lib/types';
import { formatTime } from '@/lib/utils';

export function SessionSummary({ stats, onReset }: { stats: SessionStats; onReset: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
        <h2 className="text-2xl font-bold">Session Complete 🎉</h2>
        <div className="mt-4 space-y-2 text-sm text-zinc-200">
          <p>Total focused time: {formatTime(stats.totalFocusedMs)}</p>
          <p>Violations: {stats.violationCount}</p>
          <p>Longest distraction: {formatTime(stats.longestDistractionMs)}</p>
          <p>Breaks used: {stats.breakUsed}</p>
          <p>Total break time: {formatTime(stats.breakTimeUsedMs)}</p>
        </div>
        <button onClick={onReset} className="mt-5 w-full rounded-lg bg-green-500 px-3 py-2 font-semibold text-black">
          Start New Session
        </button>
      </div>
    </div>
  );
}
