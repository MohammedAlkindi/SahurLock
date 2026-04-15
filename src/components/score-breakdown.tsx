'use client';

import type { ScoreBreakdown } from '@/lib/focus-score';

interface Props {
  breakdown: ScoreBreakdown;
  /** Show header label and total. Default true. */
  showHeader?: boolean;
}

const COMPONENTS: Array<{
  key: keyof Omit<ScoreBreakdown, 'total'>;
  label: string;
  max: number;
  bar: string;
}> = [
  { key: 'focusRatio',    label: 'Focus ratio',  max: 50, bar: 'bg-green-500'  },
  { key: 'control',       label: 'Control',      max: 25, bar: 'bg-blue-500'   },
  { key: 'recoverySpeed', label: 'Recovery',     max: 15, bar: 'bg-purple-500' },
  { key: 'stability',     label: 'Stability',    max: 10, bar: 'bg-cyan-500'   },
];

export function ScoreBreakdownPanel({ breakdown, showHeader = true }: Props) {
  return (
    <div className="space-y-0">
      {showHeader && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Score breakdown
          </span>
          <span className="text-xs text-zinc-600">out of 100</span>
        </div>
      )}

      <div className="space-y-2.5">
        {COMPONENTS.map(({ key, label, max, bar }) => {
          const value = breakdown[key] as number;
          const pct   = Math.round((value / max) * 100);
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-zinc-500">{label}</span>
                <span className="tabular-nums text-zinc-400">
                  {value}
                  <span className="text-zinc-700">/{max}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-zinc-800 pt-2.5 flex items-center justify-between text-xs">
        <span className="text-zinc-600">Total</span>
        <span className="font-bold tabular-nums text-zinc-200">{breakdown.total} / 100</span>
      </div>
    </div>
  );
}
