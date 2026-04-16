'use client';

import { formatTime } from '@/lib/utils';

export function TimerDisplay({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
  const pct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="text-sm text-muted-foreground">Session Timer</h3>
      <div className="mt-2 text-3xl font-bold">{formatTime(remainingMs)}</div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}
