'use client';

import { formatTime } from '@/lib/utils';

export function TimerDisplay({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const pct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <h3 className="text-sm text-zinc-400">Session Timer</h3>
      <div className="mt-2 text-3xl font-bold">{formatTime(remainingMs)}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}
