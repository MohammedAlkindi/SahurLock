'use client';

import { SessionConfig } from '@/lib/types';

interface Props {
  value: SessionConfig;
  onChange: (next: SessionConfig) => void;
  onStart: () => void;
  disabled?: boolean;
}

const Input = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
}) => (
  <label className="space-y-1 text-sm">
    <span className="text-zinc-300">{label}</span>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
    />
  </label>
);

export function SessionConfigCard({ value, onChange, onStart, disabled }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl">
      <h2 className="text-lg font-semibold">Session Setup</h2>
      <p className="mt-1 text-sm text-zinc-400">All processing stays in your browser. Webcam frames are never uploaded.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input
          label="Session duration (minutes)"
          value={value.durationMinutes}
          min={5}
          max={240}
          onChange={(n) => onChange({ ...value, durationMinutes: n })}
        />
        <Input
          label="Off-screen grace (seconds)"
          value={value.offscreenThresholdSec}
          min={2}
          max={30}
          onChange={(n) => onChange({ ...value, offscreenThresholdSec: n })}
        />
        <Input
          label="Allowed breaks per session"
          value={value.breakLimit}
          min={0}
          max={10}
          onChange={(n) => onChange({ ...value, breakLimit: n })}
        />
        <Input
          label="Per-break duration (seconds)"
          value={value.breakDurationSec}
          min={10}
          max={900}
          onChange={(n) => onChange({ ...value, breakDurationSec: n })}
        />
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          checked={value.punishmentEnabled}
          onChange={(e) => onChange({ ...value, punishmentEnabled: e.target.checked })}
        />
        Meme punishment mode (audio/video)
      </label>

      <button
        disabled={disabled}
        onClick={onStart}
        className="mt-5 w-full rounded-xl bg-green-500 px-4 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
      >
        Start Session
      </button>
    </section>
  );
}
