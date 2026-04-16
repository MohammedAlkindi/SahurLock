'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, Plus, X } from 'lucide-react';
import { loadTasks } from '@/lib/storage';
import { SessionConfig, SessionPreset, Task } from '@/lib/types';

export const PUNISHMENT_CLIPS = [
  { label: 'Sahur',            value: '/media/sahur.mp4' },
  { label: 'Fahh',             value: '/media/fahh.mp4' },
  { label: 'Fahhhhhhhh',       value: '/media/fahhhhhhhh.mp4' },
  { label: 'Gey Echo',         value: '/media/gey-echo.mp4' },
  { label: 'Oh Shit Not Good', value: '/media/oh-shit-not-good.mp4' },
  { label: 'Rip My Granny',    value: '/media/rip-my-granny.mp4' },
];

const PRESETS: SessionPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    description: '25 min · 3 breaks · 5 min',
    config: { durationMinutes: 25, breakDurationSec: 300, breakLimit: 3, offscreenThresholdSec: 6 }
  },
  {
    id: 'deep',
    name: 'Deep Work',
    description: '90 min · 2 breaks · 10 min',
    config: { durationMinutes: 90, breakDurationSec: 600, breakLimit: 2, offscreenThresholdSec: 8 }
  },
  {
    id: 'sprint',
    name: 'Sprint',
    description: '45 min · 2 breaks · 5 min',
    config: { durationMinutes: 45, breakDurationSec: 300, breakLimit: 2, offscreenThresholdSec: 5 }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Configure manually',
    config: {}
  }
];

interface Props {
  value: SessionConfig;
  onChange: (next: SessionConfig) => void;
  onStart: () => void;
  disabled?: boolean;
  selectedTaskId: string;
  onTaskChange: (id: string) => void;
  hideStartButton?: boolean;
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

// ── Task selector ─────────────────────────────────────────────────────────────

function TaskSelector({
  tasks,
  selectedTaskId,
  onTaskChange,
  disabled,
}: {
  tasks: Task[];
  selectedTaskId: string;
  onTaskChange: (id: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskChange('');
  };

  return (
    <div ref={ref} className="relative">
      {selectedTask ? (
        // Selected pill
        <div className="flex items-center gap-1.5">
          <button
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="max-w-[160px] truncate">{selectedTask.title}</span>
          </button>
          <button
            disabled={disabled}
            onClick={clear}
            className="rounded p-1 text-zinc-600 transition hover:text-zinc-400 disabled:opacity-50"
            aria-label="Clear task"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        // Trigger button
        <button
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-500 hover:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={11} />
          Add or select task
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1.5 w-56 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl">
          {tasks.length === 0 ? (
            <div className="px-3 py-3 text-xs text-zinc-600">
              No tasks yet —{' '}
              <a href="/tasks" className="text-zinc-400 underline hover:text-zinc-200 transition">
                add one
              </a>
            </div>
          ) : (
            <div className="py-1">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { onTaskChange(t.id); setOpen(false); }}
                  className={clsx(
                    'flex w-full items-center px-3 py-2 text-left text-xs transition',
                    selectedTaskId === t.id
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                  )}
                >
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export function SessionConfigCard({ value, onChange, onStart, disabled, selectedTaskId, onTaskChange, hideStartButton }: Props) {
  const [activePreset, setActivePreset] = useState<string>('pomodoro');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      {/* Custom config fields */}
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

      {/* Task selector */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <p className="mb-2 text-xs font-medium text-zinc-400">Working on</p>
        <TaskSelector
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          onTaskChange={onTaskChange}
          disabled={disabled}
        />
      </div>

      {/* Advanced overrides */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition"
        >
          <ChevronDown
            size={13}
            className={clsx('transition-transform', showAdvanced && 'rotate-180')}
          />
          Advanced
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3">
            {/* Grace period override — only for non-custom (custom shows it above) */}
            {!isCustom && (
              <NumInput
                label="Grace period override (sec)"
                hint="2–30"
                value={value.offscreenThresholdSec}
                min={2}
                max={30}
                onChange={(n) => onChange({ ...value, offscreenThresholdSec: n })}
              />
            )}

            {/* Punishment clip override — only shown if punishment is enabled in settings */}
            {value.punishmentEnabled && (
              <label className="block space-y-1">
                <span className="text-xs font-medium text-zinc-400">Punishment clip</span>
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
        )}
      </div>

      {!hideStartButton && (
        <button
          disabled={disabled}
          onClick={onStart}
          className="mt-5 w-full rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          Start Session
        </button>
      )}
    </section>
  );
}
