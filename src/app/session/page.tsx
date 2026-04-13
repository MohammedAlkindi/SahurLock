'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BreakControls } from '@/components/break-controls';
import { CameraPanel } from '@/components/camera-panel';
import { FocusRing } from '@/components/focus-ring';
import { SessionConfigCard } from '@/components/session-config';
import { SessionSummary } from '@/components/session-summary';
import { StatusBadge } from '@/components/status-badge';
import { ViolationOverlay } from '@/components/violation-overlay';
import { AttentionDetector } from '@/lib/attention-detector';
import { getDerivedState } from '@/lib/session-machine';
import {
  loadAggregate,
  loadHistory,
  loadSettings,
  saveSessionHistory,
  saveSettings,
  updateAggregate
} from '@/lib/storage';
import {
  AppState,
  AttentionReading,
  BaselinePose,
  SessionConfig,
  SessionHistoryItem,
  SessionStats
} from '@/lib/types';
import { calculateFocusScore, uid } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────────
const DEFAULTS: SessionConfig = {
  durationMinutes: 25,
  offscreenThresholdSec: 6,
  breakLimit: 1,
  breakDurationSec: 300,
  punishmentEnabled: true,
  punishmentMedia: '/media/sahur.mp4'
};

const STABILIZE_MS           = 2000;
const CALIBRATION_NEEDED     = 25;   // good-quality samples required to proceed
const CALIBRATION_SAMPLE_MS  = 100;  // ms between calibration samples
const CALIBRATION_HARD_LIMIT = 300;  // max total samples before forcing a build (~30s)
const CALIBRATION_STALL_AT   = 150;  // sample count at which to check for a stall
const CALIBRATION_STALL_MIN  = 10;   // good samples needed by STALL_AT to avoid stall warning
const COUNTDOWN_MS           = 3000;

// ── Active session sidebar ─────────────────────────────────────────────────────
function LiveStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-xl font-bold tabular-nums ${accent ?? 'text-white'}`}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SessionPage() {
  const [config, setConfig]                     = useState<SessionConfig>(DEFAULTS);
  const [appState, setAppState]                 = useState<AppState>('idle');
  const [attention, setAttention]               = useState<AttentionReading | null>(null);
  const [baseline, setBaseline]                 = useState<BaselinePose | null>(null);
  const [remainingMs, setRemainingMs]           = useState(DEFAULTS.durationMinutes * 60_000);
  const [offscreenMs, setOffscreenMs]           = useState(0);
  const [stabilizeMs, setStabilizeMs]           = useState(0);
  const [calibrationGoodSamples, setCalibrationGoodSamples] = useState(0);
  const [calibStalled, setCalibStalled]         = useState(false);
  const [countdownLeft, setCountdownLeft]       = useState(0);
  const [breakUsed, setBreakUsed]               = useState(0);
  const [breakRemainingMs, setBreakRemainingMs] = useState(0);
  const [summaryStats, setSummaryStats]         = useState<SessionStats | null>(null);
  const [cameraError, setCameraError]           = useState('');
  const [manualZoom, setManualZoom]             = useState(1);
  const [violationCount, setViolationCount]     = useState(0);

  // Refs (stable across renders, no re-render on change)
  const videoRef         = useRef<HTMLVideoElement>(null);
  const audioRef         = useRef<HTMLVideoElement>(null);
  const detectorRef      = useRef<AttentionDetector | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const rafRef           = useRef<number | null>(null);
  const calibTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const calibReadingsRef = useRef<AttentionReading[]>([]);
  const appStateRef      = useRef<AppState>('idle');
  const baselineRef      = useRef<BaselinePose | null>(null);
  const configRef        = useRef<SessionConfig>(DEFAULTS);
  const breakUsedRef     = useRef(0);
  const statsRef         = useRef<SessionStats>({
    startedAt: '',
    totalFocusedMs: 0,
    violationCount: 0,
    longestDistractionMs: 0,
    breakUsed: 0,
    breakTimeUsedMs: 0
  });

  const totalMs = useMemo(() => config.durationMinutes * 60_000, [config.durationMinutes]);

  // Keep refs in sync with state
  useEffect(() => { appStateRef.current = appState; }, [appState]);
  useEffect(() => { baselineRef.current = baseline; }, [baseline]);
  useEffect(() => { configRef.current = config; }, [config]);
  useEffect(() => { breakUsedRef.current = breakUsed; }, [breakUsed]);

  // Bootstrap from localStorage
  useEffect(() => {
    const saved = loadSettings(DEFAULTS);
    setConfig(saved);
    setRemainingMs(saved.durationMinutes * 60_000);
  }, []);

  // Persist settings whenever they change
  useEffect(() => { saveSettings(config); }, [config]);

  // ── Session helpers ──────────────────────────────────────────────────────────
  const cleanupMedia = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (calibTimerRef.current) clearInterval(calibTimerRef.current);
    calibTimerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const resetSession = () => {
    cleanupMedia();
    setAppState('idle');
    setAttention(null);
    setBaseline(null);
    setOffscreenMs(0);
    setStabilizeMs(0);
    setBreakUsed(0);
    setBreakRemainingMs(0);
    setCalibrationGoodSamples(0);
    setCalibStalled(false);
    setCountdownLeft(0);
    setViolationCount(0);
    setRemainingMs(configRef.current.durationMinutes * 60_000);
    setSummaryStats(null);
    setCameraError('');
    setManualZoom(1);
    audioRef.current?.pause();
  };

  const finishSession = () => {
    cleanupMedia();
    const sessionDurationMs = configRef.current.durationMinutes * 60_000;
    const focusScore = calculateFocusScore(
      statsRef.current.totalFocusedMs,
      sessionDurationMs,
      statsRef.current.violationCount
    );
    const done: SessionStats = {
      ...statsRef.current,
      endedAt: new Date().toISOString(),
      breakUsed: breakUsedRef.current,
      focusScore
    };
    const item: SessionHistoryItem = { id: uid(), config: configRef.current, stats: done };
    saveSessionHistory(item);
    updateAggregate({
      focusedMs: done.totalFocusedMs,
      violations: done.violationCount,
      breakMs: done.breakTimeUsedMs,
      longestDistractionMs: done.longestDistractionMs,
      focusScore
    });
    loadHistory();
    loadAggregate();
    setSummaryStats(done);
    setAppState('session_complete');
  };

  const triggerPunishment = async () => {
    setAppState('violated');
    statsRef.current.violationCount += 1;
    setViolationCount(statsRef.current.violationCount);
    if (!configRef.current.punishmentEnabled) return;
    const media = audioRef.current;
    if (!media) return;
    media.volume = 1.0;
    media.currentTime = 0;
    try { await media.play(); } catch { window.alert('Punishment clip could not play. Check browser autoplay settings.'); }
  };

  // ── Main tracking loop ───────────────────────────────────────────────────────
  const startTrackingLoop = () => {
    if (rafRef.current) return;
    let lastTs = performance.now();

    const loop = async () => {
      const state = appStateRef.current;
      const now   = performance.now();
      const delta = now - lastTs;
      lastTs = now;

      // Timer advancement
      if (state === 'break') {
        setBreakRemainingMs((prev) => {
          const next = Math.max(0, prev - delta);
          statsRef.current.breakTimeUsedMs += delta;
          if (next === 0) setAppState('focused');
          return next;
        });
      } else if (['focused', 'warning', 'violated'].includes(state)) {
        setRemainingMs((prev) => {
          const next = Math.max(0, prev - delta);
          if (next <= 0) { finishSession(); return 0; }
          return next;
        });
      }

      // Attention estimate
      const reading = detectorRef.current
        ? await detectorRef.current.estimate(videoRef.current!, baselineRef.current)
        : null;
      setAttention(reading);

      const offscreen = !reading || reading.attention === 'offscreen' || !reading.facePresent;
      const warning   = !reading || reading.attention === 'warning';
      const uncertain = !reading || reading.attention === 'uncertain';

      if (state === 'violated') {
        if (!offscreen && !uncertain && !warning) {
          setStabilizeMs((prev) => {
            const next = prev + delta;
            if (next >= STABILIZE_MS) {
              audioRef.current?.pause();
              setOffscreenMs(0);
              setStabilizeMs(0);
              setAppState('focused');
              return 0;
            }
            return next;
          });
        } else {
          setStabilizeMs(0);
        }
      } else if (state === 'focused' || state === 'warning') {
        if (offscreen || warning) {
          setOffscreenMs((prev) => {
            const next = prev + delta;
            statsRef.current.longestDistractionMs = Math.max(statsRef.current.longestDistractionMs, next);
            if (next >= configRef.current.offscreenThresholdSec * 1000 && offscreen) {
              triggerPunishment();
            } else if (next >= configRef.current.offscreenThresholdSec * 350) {
              setAppState('warning');
            } else if (uncertain) {
              setAppState('warning');
            }
            return next;
          });
        } else {
          statsRef.current.totalFocusedMs += delta;
          setOffscreenMs(0);
          if (state !== 'focused') setAppState('focused');
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  // ── Calibration ──────────────────────────────────────────────────────────────
  // Called once calibration readings are collected — builds baseline or reports error.
  const finishCalibration = () => {
    if (calibTimerRef.current) { clearInterval(calibTimerRef.current); calibTimerRef.current = null; }
    const report = AttentionDetector.buildCalibration(
      calibReadingsRef.current,
      videoRef.current?.videoWidth  || 1280,
      videoRef.current?.videoHeight || 720
    );
    if (!report.ok || !report.baseline) {
      const hint = calibReadingsRef.current[calibReadingsRef.current.length - 1]?.guidance?.[0];
      setCameraError(
        report.reason || hint || 'No face detected. Adjust your position or lighting, then try again.'
      );
      setAppState('camera_error');
      return;
    }
    setBaseline(report.baseline);
    setCalibStalled(false);
    setAppState('countdown');
    setCountdownLeft(Math.ceil(COUNTDOWN_MS / 1000));
    const c = setInterval(() => setCountdownLeft((p) => Math.max(0, p - 1)), 1000);
    setTimeout(() => { clearInterval(c); setAppState('focused'); }, COUNTDOWN_MS);
  };

  // Starts (or restarts) the adaptive calibration sampling loop.
  // Does NOT re-request camera permissions — stream must already be active.
  const runCalibration = () => {
    if (calibTimerRef.current) { clearInterval(calibTimerRef.current); calibTimerRef.current = null; }
    calibReadingsRef.current = [];
    let goodSamples  = 0;
    let totalSamples = 0;
    setCalibrationGoodSamples(0);
    setCalibStalled(false);
    setCameraError('');
    setAppState('calibrating');

    calibTimerRef.current = setInterval(async () => {
      if (appStateRef.current !== 'calibrating' || !videoRef.current || !detectorRef.current) return;

      const r = await detectorRef.current.estimate(videoRef.current, null);
      calibReadingsRef.current.push(r);
      totalSamples++;

      if (r.facePresent && r.confidence >= 0.5) {
        goodSamples++;
        setCalibrationGoodSamples(goodSamples);
      }

      // Stall detection: warn if progress is too slow
      if (totalSamples === CALIBRATION_STALL_AT && goodSamples < CALIBRATION_STALL_MIN) {
        setCalibStalled(true);
      }

      // Auto-proceed once enough quality samples are collected
      if (goodSamples >= CALIBRATION_NEEDED) {
        finishCalibration();
        return;
      }

      // Hard limit reached — attempt to build from whatever was collected
      if (totalSamples >= CALIBRATION_HARD_LIMIT) {
        finishCalibration();
      }
    }, CALIBRATION_SAMPLE_MS);
  };

  // ── Start session ────────────────────────────────────────────────────────────
  const startSession = async () => {
    try {
      setCameraError('');
      setManualZoom(1);
      setViolationCount(0);
      setAppState('requesting_permission');
      setSummaryStats(null);
      setRemainingMs(configRef.current.durationMinutes * 60_000);
      setAttention(null);
      statsRef.current = {
        startedAt: new Date().toISOString(),
        totalFocusedMs: 0,
        violationCount: 0,
        longestDistractionMs: 0,
        breakUsed: 0,
        breakTimeUsedMs: 0
      };

      if (!detectorRef.current) detectorRef.current = new AttentionDetector();
      await detectorRef.current.init();
      detectorRef.current.setManualZoom(1);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      startTrackingLoop();

      // Prime audio element to satisfy browser autoplay policy
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        try { await audioRef.current.play(); audioRef.current.pause(); audioRef.current.currentTime = 0; } catch { /* ok */ }
      }

      runCalibration();
    } catch {
      setCameraError('Camera access denied or face detector failed to load.');
      setAppState('camera_error');
    }
  };

  // Retry calibration without re-requesting camera permissions.
  const retryCalibration = () => {
    runCalibration();
  };

  const takeBreak = () => {
    if (breakUsedRef.current >= configRef.current.breakLimit || appStateRef.current === 'violated') return;
    setBreakUsed((p) => p + 1);
    statsRef.current.breakUsed += 1;
    setBreakRemainingMs(configRef.current.breakDurationSec * 1000);
    setAppState('break');
    setOffscreenMs(0);
  };

  const derivedState = getDerivedState({
    attention,
    offscreenMs,
    thresholdMs: config.offscreenThresholdSec * 1000,
    onBreak: appState === 'break',
    violationActive: appState === 'violated'
  });

  // ── Derived values for display ───────────────────────────────────────────────
  const isActive     = !['idle', 'session_complete', 'camera_error'].includes(appState);
  const elapsed      = totalMs - remainingMs;
  const liveFocusPct = elapsed > 0
    ? Math.round((statsRef.current.totalFocusedMs / elapsed) * 100)
    : 0;

  const distPct = config.offscreenThresholdSec > 0
    ? Math.min(100, (offscreenMs / (config.offscreenThresholdSec * 1000)) * 100)
    : 0;

  // True when camera_error but stream is still alive (calibration failure, not permission denied)
  const streamActive = appState === 'camera_error' && streamRef.current !== null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Session</h1>
          {appState === 'countdown' && (
            <p className="mt-0.5 text-sm text-zinc-400">Starting in {countdownLeft}…</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge state={appState} />
          {isActive && (
            <div className="flex gap-2">
              {appState === 'calibrating' && (
                <button
                  onClick={resetSession}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-500 transition"
                >
                  Cancel
                </button>
              )}
              {!['calibrating', 'countdown', 'requesting_permission'].includes(appState) && (
                <>
                  <button
                    onClick={finishSession}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition"
                  >
                    End Session
                  </button>
                  <button
                    onClick={resetSession}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-zinc-500 transition"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Idle / error: config + camera side-by-side ────────────────────── */}
      {!isActive && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SessionConfigCard
              value={config}
              onChange={setConfig}
              onStart={startSession}
              disabled={appState !== 'idle' && appState !== 'camera_error'}
            />

            {appState === 'camera_error' && (
              <div className="mt-3 rounded-xl border border-red-800/60 bg-red-900/20 px-4 py-3">
                <p className="text-sm text-red-300">{cameraError}</p>
                <div className="mt-3 flex gap-2">
                  {streamActive ? (
                    <button
                      onClick={retryCalibration}
                      className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition"
                    >
                      Retry Calibration
                    </button>
                  ) : (
                    <button
                      onClick={startSession}
                      className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-600 transition"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={resetSession}
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 hover:border-zinc-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <CameraPanel
              videoRef={videoRef}
              attention={attention}
              calibrating={false}
              calibrationGoodSamples={0}
              calibrationNeeded={CALIBRATION_NEEDED}
              calibrationStalled={false}
              countdownLeft={0}
              zoomLevel={1}
              onZoomIn={() => {}}
              onZoomOut={() => {}}
            />
          </div>
        </div>
      )}

      {/* ── Active session: ring + stats | camera ─────────────────────────── */}
      {isActive && (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Left: timer ring + live metrics */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {/* Timer card */}
            <div className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/70 py-8 shadow-xl">
              <FocusRing
                remainingMs={remainingMs}
                totalMs={totalMs}
                appState={appState}
                offscreenMs={offscreenMs}
                thresholdMs={config.offscreenThresholdSec * 1000}
              />
            </div>

            {/* Live metrics card — hidden during calibration/countdown */}
            {!['calibrating', 'countdown', 'requesting_permission'].includes(appState) && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Live Stats
                </h3>
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  <LiveStat
                    label="Focus efficiency"
                    value={`${liveFocusPct}%`}
                    accent={liveFocusPct >= 80 ? 'text-green-400' : liveFocusPct >= 60 ? 'text-yellow-400' : 'text-red-400'}
                  />
                  <LiveStat
                    label="Violations"
                    value={violationCount}
                    accent={violationCount === 0 ? 'text-green-400' : 'text-red-400'}
                  />
                </div>

                {/* Distraction bar */}
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
                    <span>Off-screen meter</span>
                    <span>{(offscreenMs / 1000).toFixed(1)}s / {config.offscreenThresholdSec}s</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        distPct > 80 ? 'bg-red-500' : distPct > 50 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${distPct}%` }}
                    />
                  </div>
                </div>

                {/* Confidence */}
                {attention && (
                  <p className="mt-3 text-xs text-zinc-600">
                    Detection confidence:{' '}
                    <span className="text-zinc-400">{Math.round(attention.confidence * 100)}%</span>
                    {' · '}
                    <span className={
                      derivedState === 'focused' ? 'text-green-400' :
                      derivedState === 'warning'  ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {derivedState}
                    </span>
                  </p>
                )}

                {attention?.guidance?.length ? (
                  <ul className="mt-2 space-y-0.5 text-xs text-amber-400">
                    {attention.guidance.slice(0, 2).map((h) => (
                      <li key={h} className="flex gap-1.5"><span className="text-amber-600">!</span><span>{h}</span></li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            {/* Break controls */}
            {['focused', 'warning', 'break'].includes(appState) && config.breakLimit > 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Breaks
                </h3>
                <BreakControls
                  breakUsed={breakUsed}
                  breakLimit={config.breakLimit}
                  breakActive={appState === 'break'}
                  breakRemainingMs={breakRemainingMs}
                  onStartBreak={takeBreak}
                  disabled={!['focused', 'warning'].includes(appState)}
                />
              </div>
            )}
          </div>

          {/* Right: camera */}
          <div className="lg:col-span-3">
            <CameraPanel
              videoRef={videoRef}
              attention={attention}
              calibrating={appState === 'calibrating'}
              calibrationGoodSamples={calibrationGoodSamples}
              calibrationNeeded={CALIBRATION_NEEDED}
              calibrationStalled={calibStalled}
              countdownLeft={countdownLeft}
              zoomLevel={manualZoom}
              onZoomIn={() => {
                const n = Math.min(2, manualZoom + 0.1);
                setManualZoom(n);
                detectorRef.current?.setManualZoom(n);
              }}
              onZoomOut={() => {
                const n = Math.max(1, manualZoom - 0.1);
                setManualZoom(n);
                detectorRef.current?.setManualZoom(n);
              }}
            />
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <video ref={audioRef} className="hidden" src={config.punishmentMedia} preload="auto" playsInline loop />

      {/* Violation overlay */}
      <ViolationOverlay
        visible={appState === 'violated'}
        stabilizeMs={stabilizeMs}
        maxStabilizeMs={STABILIZE_MS}
        violationCount={violationCount}
      />

      {/* Session summary */}
      {summaryStats && (
        <SessionSummary stats={summaryStats} config={config} onReset={resetSession} />
      )}
    </main>
  );
}
