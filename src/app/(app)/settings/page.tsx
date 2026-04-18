'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Play, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, Eye, Video } from 'lucide-react';
import { loadSettings, saveSettings, loadCustomVideoMeta, saveCustomVideoMeta, clearCustomVideoMeta, setCustomVideoBlobUrl } from '@/lib/storage';
import { getVideoBlob, saveVideoBlob, deleteVideoBlob } from '@/lib/video-storage';
import { SessionConfig, CustomVideoMeta } from '@/lib/types';
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
  advancedEyeTrackingEnabled: false,
};

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const ALLOWED_TYPES   = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function PillToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}

function Row({
  label,
  description,
  children,
  compact,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${compact ? 'py-2.5' : 'py-3'}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-none">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <p className="pt-5 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 first:pt-0">
      {title}
    </p>
  );
}

function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ── Punishment media panel ─────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

function PunishmentMediaPanel({
  config,
  update,
}: {
  config: SessionConfig;
  update: (patch: Partial<SessionConfig>) => void;
}) {
  const [meta,         setMeta]         = useState<CustomVideoMeta | null>(null);
  const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMsg,     setErrorMsg]     = useState('');
  const [showPreview,  setShowPreview]  = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const m = loadCustomVideoMeta();
    setMeta(m);
    if (m) {
      getVideoBlob(m.id).then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setCustomVideoBlobUrl(url);
        }
      }).catch(() => {});
    }
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFile = async (file: File) => {
    setErrorMsg('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg('Unsupported format — use MP4, WebM, OGG, or MOV.');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setErrorMsg(`File too large (max ${formatFileSize(MAX_VIDEO_BYTES)}).`);
      return;
    }
    setUploadStatus('uploading');
    try {
      if (meta) { await deleteVideoBlob(meta.id); if (previewUrl) URL.revokeObjectURL(previewUrl); }
      const id   = `custom_${Date.now()}`;
      await saveVideoBlob(id, file.slice(0, file.size, file.type));
      const newMeta: CustomVideoMeta = { id, name: file.name, size: file.size, type: file.type, addedAt: new Date().toISOString() };
      saveCustomVideoMeta(newMeta);
      setMeta(newMeta);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setCustomVideoBlobUrl(url);
      update({ punishmentMedia: 'custom' });
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 2500);
    } catch {
      setUploadStatus('error');
      setErrorMsg('Failed to save. Try again.');
    }
  };

  const handleDelete = async () => {
    if (!meta) return;
    try { await deleteVideoBlob(meta.id); } catch {}
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    clearCustomVideoMeta();
    setCustomVideoBlobUrl(null);
    setMeta(null);
    setPreviewUrl(null);
    setShowPreview(false);
    if (config.punishmentMedia === 'custom') update({ punishmentMedia: '/media/sahur.mp4' });
  };

  const hasCustom = !!meta && config.punishmentMedia === 'custom';

  return (
    <div className="space-y-2.5">
      {/* Built-in clip selector */}
      {!hasCustom && (
        <select
          value={config.punishmentMedia === 'custom' ? '/media/sahur.mp4' : config.punishmentMedia}
          onChange={(e) => update({ punishmentMedia: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
        >
          {PUNISHMENT_CLIPS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      )}

      {/* Custom video row */}
      {meta ? (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Video size={13} className="shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium text-foreground">{meta.name}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground/60">{formatFileSize(meta.size)}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {previewUrl && (
                <button onClick={() => setShowPreview((v) => !v)} className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition">
                  <Play size={10} className="inline mr-0.5" />preview
                </button>
              )}
              <button onClick={() => fileInputRef.current?.click()} className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition">
                <RefreshCw size={10} className="inline mr-0.5" />replace
              </button>
              <button onClick={handleDelete} className="rounded px-1 py-0.5 text-[10px] text-red-500 hover:text-red-600 transition">
                <Trash2 size={10} />
              </button>
            </div>
          </div>

          {showPreview && previewUrl && (
            <div className="mt-2 overflow-hidden rounded border border-border">
              <video src={previewUrl} controls className="w-full max-h-32 bg-black" />
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            {hasCustom ? (
              <>
                <span className="flex items-center gap-1 text-[10px] text-green-600"><CheckCircle2 size={10} />Active</span>
                <button onClick={() => update({ punishmentMedia: '/media/sahur.mp4' })} className="text-[10px] text-muted-foreground hover:text-foreground transition">Use built-in</button>
              </>
            ) : (
              <button onClick={() => update({ punishmentMedia: 'custom' })} className="text-[10px] font-medium text-accent hover:underline">Use this custom video</button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadStatus === 'uploading'}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/10 py-3 text-xs text-muted-foreground transition hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        >
          {uploadStatus === 'uploading'
            ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border border-accent border-t-transparent" />Saving…</>
            : <><Upload size={13} />Upload custom video (MP4 · WebM · up to 200 MB)</>
          }
        </button>
      )}

      {uploadStatus === 'success' && (
        <p className="flex items-center gap-1 text-[10px] text-green-600"><CheckCircle2 size={10} />Saved</p>
      )}
      {(uploadStatus === 'error' || errorMsg) && (
        <p className="flex items-center gap-1 text-[10px] text-red-600"><AlertCircle size={10} />{errorMsg || 'Error'}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [config,  setConfig]  = useState<SessionConfig>(DEFAULTS);
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
    <div className="mx-auto max-w-md px-4 py-7">
      <div className="mb-6">
        <h1 className="text-xl font-black tracking-tight">Settings</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">Global defaults for every session.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card px-4">

        {/* ── Focus ─────────────────────────────────────── */}
        <SectionLabel title="Focus" />
        <div className="divide-y divide-border/50">
          <Row label="Pomodoro auto-cycle" description="Auto-breaks at interval end." compact>
            <PillToggle checked={config.pomodoroEnabled} onChange={(v) => update({ pomodoroEnabled: v })} />
          </Row>
        </div>

        {/* ── Enforcement ───────────────────────────────── */}
        <SectionLabel title="Enforcement" />
        <div className="divide-y divide-border/50">
          <Row label="Punishment clip" description="Plays a clip on violation." compact>
            <PillToggle checked={config.punishmentEnabled} onChange={(v) => update({ punishmentEnabled: v })} />
          </Row>

          {config.punishmentEnabled && (
            <Disclosure label="Configure media">
              <PunishmentMediaPanel config={config} update={update} />
            </Disclosure>
          )}
        </div>

        {/* ── Detection ─────────────────────────────────── */}
        <SectionLabel title="Detection" />
        <div className="divide-y divide-border/50">
          <Row label="Phone detection" description="Flags hand-to-face posture." compact>
            <PillToggle checked={config.phoneDetectionEnabled} onChange={(v) => update({ phoneDetectionEnabled: v })} />
          </Row>
        </div>

        {/* ── Advanced ──────────────────────────────────── */}
        <SectionLabel title="Advanced" />
        <div className="divide-y divide-border/50 pb-1">
          <Row label="Advanced eye tracking" description="Tracks iris direction, not just head pose." compact>
            <PillToggle
              checked={!!config.advancedEyeTrackingEnabled}
              onChange={(v) => update({ advancedEyeTrackingEnabled: v })}
            />
          </Row>

          {config.advancedEyeTrackingEnabled && (
            <Disclosure label="How advanced tracking works">
              <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                <p>
                  Standard tracking detects when your head turns away. Advanced mode also reads iris position — you can fail even if your face is forward but your eyes drift off screen.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border bg-background p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60 mb-1.5">Standard</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />Face detected</div>
                      <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-border shrink-0" />Eyes (ignored)</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-accent/30 bg-background p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/70 mb-1.5">Advanced</p>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center gap-1.5"><Eye size={9} className="text-accent shrink-0" />Face detected</div>
                      <div className="flex items-center gap-1.5"><Eye size={9} className="text-accent shrink-0" />Eyes on screen</div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/50">Best results in good lighting, looking directly at your screen during calibration.</p>
              </div>
            </Disclosure>
          )}
        </div>

      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground/40">
        Changes save instantly.
      </p>
    </div>
  );
}
