'use client';

import { AppState } from '@/lib/types';
import clsx from 'clsx';

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
  return (
    <span
      className={clsx('rounded-full px-4 py-2 text-sm font-semibold', {
        'bg-zinc-700 text-white': ['idle', 'requesting_permission', 'countdown'].includes(state),
        'bg-blue-600 text-white': state === 'calibrating',
        'bg-green-600 text-white': state === 'focused',
        'bg-yellow-500 text-black': state === 'warning' || state === 'break',
        'bg-red-600 text-white': state === 'violated' || state === 'camera_error',
        'bg-purple-600 text-white': state === 'session_complete'
      })}
    >
      {labelMap[state]}
    </span>
  );
}
