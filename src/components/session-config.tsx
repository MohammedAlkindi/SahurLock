'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { loadTasks } from '@/lib/storage';
import { SessionConfig, SessionPreset, Task } from '@/lib/types';

const PRESETS: SessionPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 min · 1 break · 5 min',
    config: { durationMinutes: 25, breakDurationSec: 300, breakLimit: 3, offscreenThresholdSec: 6, pomodoroEnabled: true }
  },
  {
    id: 'deep',
    name: 'Deep Work',
    description: '90 min · 2 breaks · 10 min',
    config: { durationMinutes: 90, breakDurationSec: 600, breakLimit: 2, offscreenThresholdSec: 8, pomodoroEnabled: false }
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: '45 min · 2 breaks · 5 min',
    config: { durationMinutes: 45, breakDurationSec: 300, breakLimit: 2, offscreenThresholdSec: 5, pomodoroEnabled: false }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Configure manually',
    config: {}
  }
];

const PUNISHMENT_CLIPS = [
  { label: 'Sahur',            value: '/media/sahur.mp4' },
  { label: 'Fahh',             value: '/media/fahh.mp4' },
  { label: 'Fahhhhhhhh',       value: '/media/fahhhhhhhh.mp4' },
  { label: 'Gey Echo',         value: '/media/gey-echo.mp4' },
  { label: 'Oh Shit Not Good', value: '/media/oh-shit-not-good.mp4' },
  { label: 'Rip My Granny',    value: '/media/rip-my-granny.mp4' },
];

interface Props {
  value: SessionConfig;
  onChange: (next: SessionConfig) => void;
  onStart: () => void;
  disabled?: boolean;
  selectedTaskId: string;
  onTaskChange: (id: string) => void;
}

function NumInput({
  label, hint, value, onChange, min, max, step = 1
}: {
  label: string; hint?: string; value: number;
  onChange: (n: number) => void; min: number; max: number; step?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      {hint && <span className="ml-1 text-xs text-zinc-600">({hint})</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
      />
    </label>
  );
}

function PresetDuration({ preset }: { preset: SessionPreset }) {
  const minutes = preset.config.durationMinutes;
  if (!minutes) return <span className="font-mono text-lg font-bold text-zinc-500">—</span>;
  return (
    <span>
      <span className="font-mono text-xl font-black tabular-nums text-zinc-300">{minutes}</span>
      <span className="ml-0.5 text-xs text-zinc-600">min</span>
    </span>
  );
}

export function SessionConfigCard({ value, onChange, onStart, disabled, selectedTaskId, onTaskChange }: Props) {
  const [activePreset, setActivePreset] = useState<string>('pomodoro');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(loadTasks().filter((t) => t.status === 'active'));
  }, []);

  const selectPreset = (preset: SessionPreset) => {
    setActivePreset(preset.id);
    if (preset.id !== 'custom') onChange({ ...value, ...preset.config });
  };

  const isCustom = activePreset === 'custom';

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl">
      <h2 className="text-sm font-semibold text-zinc-100">Session Setup</h2>

      {/* Preset selector */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            disabled={disabled}
            onClick={() => selectPreset(p)}
            className={clsx(
              'flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition',
              disabled && 'cursor-not-allowed opacity-40',
              activePreset === p.id
                ? 'border-green-600 bg-green-600/10'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/40'
            )}
          >
            <PresetDuration preset={p} />
            <span className="mt-1.5 text-xs font-semibold text-zinc-200">{p.name}</span>
            <span className="text-[10px] text-zinc-600">{p.description}</span>
          </button>
        ))}
      </div>

      {/* Custom config */}
      {isCustom && (
        <div className="mt-4 grid gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
          <NumInput label="Duration (minutes)" hint="5–240"  value={value.durationMinutes}     min={5}   max={240} onChange={(n) => onChange({ ...value, durationMinutes: n })} />
          <NumInput label="Grace period (sec)"  hint="2–30"   value={value.offscreenThresholdSec} min={2}   max={30}  onChange={(n) => onChange({ ...value, offscreenThresholdSec: n })} />
          <NumInput label="Breaks per session"  hint="0–10"   value={value.breakLimit}           min={0}   max={10}  onChange={(n) => onChange({ ...value, breakLimit: n })} />
          <NumInput label="Break duration (sec)" hint="10–900" value={value.breakDurationSec}     min={10}  max={900} onChange={(n) => onChange({ ...value, breakDurationSec: n })} />
        </div>
      )}

      {/* Quick summary for presets */}
      {!isCustom && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-600">
          <span>{value.durationMinutes} min</span>
          <span>·</span>
          <span>{value.offscreenThresholdSec}s grace</span>
          <span>·</span>
          <span>{value.breakLimit} break{value.breakLimit !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{value.breakDurationSec}s each</span>
        </div>
      )}

      {/* Pomodoro toggle */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={value.pomodoroEnabled}
            disabled={disabled || value.breakLimit === 0}
            onChange={(e) => onChange({ ...value, pomodoroEnabled: e.target.checked })}
            className="h-4 w-4 rounded accent-green-500"
          />
          <span>Pomodoro auto-cycle</span>
          <span className="text-xs text-zinc-600">— breaks fire automatically</span>
        </label>
      </div>

      {/* Punishment clip */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={value.punishmentEnabled}
            disabled={disabled}
            onChange={(e) => onChange({ ...value, punishmentEnabled: e.target.checked })}
            className="h-4 w-4 rounded accent-green-500"
          />
          <span>Punishment clip</span>
          <span className="text-xs text-zinc-600">— plays on violation</span>
        </label>

        {value.punishmentEnabled && (
          <label className="mt-3 block space-y-1">
            <span className="text-xs font-medium text-zinc-500">Clip</span>
            <select
              value={value.punishmentMedia}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, punishmentMedia: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
            >
              {PUNISHMENT_CLIPS.map((clip) => (
                <option key={clip.value} value={clip.value}>{clip.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Task selector */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <p className="mb-2 text-xs font-medium text-zinc-400">Working on</p>
        {tasks.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              disabled={disabled}
              onClick={() => onTaskChange('')}
              className={clsx(
                'rounded-lg border px-3 py-1.5 text-xs transition',
                selectedTaskId === ''
                  ? 'border-zinc-500 bg-zinc-700 text-zinc-200'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
              )}
            >
              Nothing specific
            </button>
            {tasks.map((t) => (
              <button
                key={t.id}
                disabled={disabled}
                onClick={() => onTaskChange(t.id)}
                className={clsx(
                  'rounded-lg border px-3 py-1.5 text-xs transition',
                  selectedTaskId === t.id
                    ? 'border-green-600 bg-green-600/10 text-green-400'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                )}
              >
                {t.title}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600">
            No tasks yet.{' '}
            <a href="/tasks" className="text-zinc-500 underline hover:text-zinc-300 transition">
              Add one
            </a>
          </p>
        )}
      </div>

      <button
        disabled={disabled}
        onClick={onStart}
        className="mt-5 w-full rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
      >
        Start Session
      </button>
    </section>
  );
}
