'use client';

import { AppState } from '@/lib/types';
import { cn } from '@/lib/cn';

const labelMap: Record<AppState, string> = {
  idle: 'Idle',
  requesting_permission: 'Requesting Camera',
  calibrating: 'Calibrating',
  countdown: 'Get Ready',
  focused: 'Focused',
  warning: 'Warning',
  break: 'On Break',
  violated: 'VIOLATED',
  session_complete: 'Complete',
  camera_error: 'Camera Error'
};

export function StatusBadge({ state }: { state: AppState }) {
  if (state === 'idle') return null;
  return (
    <span
      className={cn(
        'rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide',
        ['requesting_permission', 'countdown'].includes(state) && 'bg-muted text-muted-foreground',
        state === 'calibrating'     && 'bg-blue-500/15 text-blue-400',
        state === 'focused'         && 'bg-green-500/15 text-green-400 shadow-[0_0_8px_0_rgba(34,197,94,0.25)]',
        state === 'warning'         && 'bg-yellow-500/15 text-yellow-400',
        state === 'break'           && 'bg-yellow-500/15 text-yellow-400',
        state === 'violated'        && 'bg-red-500/15 text-red-400 shadow-[0_0_8px_0_rgba(239,68,68,0.3)]',
        state === 'camera_error'    && 'bg-red-500/15 text-red-400',
        state === 'session_complete' && 'bg-purple-500/15 text-purple-400',
      )}
    >
      {labelMap[state]}
    </span>
  );
}
