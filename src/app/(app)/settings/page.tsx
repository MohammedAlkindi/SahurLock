'use client';

import { useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';
import { SessionConfig } from '@/lib/types';
import { PUNISHMENT_CLIPS } from '@/components/session-config';

const DEFAULTS: SessionConfig = {
  durationMinutes: 25,
  offscreenThresholdSec: 6,
  breakLimit: 3,
  breakDurationSec: 300,
  punishmentEnabled: false,
  punishmentMedia: '/media/sahur.mp4',
  pomodoroEnabled: false,
  phoneDetectionEnabled: false,
};

function PillToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-widest text-zinc-600 first:pt-0">
      {title}
    </p>
  );
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SessionConfig>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setConfig(loadSettings(DEFAULTS));
    setMounted(true);
  }, []);

  const update = (patch: Partial<SessionConfig>) => {
    const next = { ...config, ...patch };
    setConfig(next);
    saveSettings(next);
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Global defaults applied to every new session.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-5">

        {/* ── Focus ─────────────────────────────────────── */}
        <SectionHeader title="Focus" />

        <div className="divide-y divide-zinc-800/60">
          <SettingRow
            label="Pomodoro auto-cycle"
            description="Breaks fire automatically at the end of each interval."
          >
            <PillToggle
              checked={config.pomodoroEnabled}
              onChange={(v) => update({ pomodoroEnabled: v })}
            />
          </SettingRow>
        </div>

        {/* ── Enforcement ───────────────────────────────── */}
        <SectionHeader title="Enforcement" />

        <div className="divide-y divide-zinc-800/60">
          <SettingRow
            label="Punishment clip"
            description="Plays a short clip whenever you trigger a violation."
          >
            <PillToggle
              checked={config.punishmentEnabled}
              onChange={(v) => update({ punishmentEnabled: v })}
            />
          </SettingRow>

          {config.punishmentEnabled && (
            <div className="py-3.5">
              <p className="mb-2 text-xs font-medium text-zinc-400">Default clip</p>
              <select
                value={config.punishmentMedia}
                onChange={(e) => update({ punishmentMedia: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
              >
                {PUNISHMENT_CLIPS.map((clip) => (
                  <option key={clip.value} value={clip.value}>
                    {clip.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Detection ─────────────────────────────────── */}
        <SectionHeader title="Detection" />

        <div className="divide-y divide-zinc-800/60 pb-2">
          <SettingRow
            label="Phone detection"
            description="Uses the webcam to flag hand-to-face posture as a violation."
          >
            <PillToggle
              checked={config.phoneDetectionEnabled}
              onChange={(v) => update({ phoneDetectionEnabled: v })}
            />
          </SettingRow>
        </div>

      </div>

      <p className="mt-4 text-center text-[11px] text-zinc-700">
        Changes save instantly — no button needed.
      </p>
    </div>
  );
}
