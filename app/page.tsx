'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BreakControls } from '@/components/break-controls';
import { CameraPanel } from '@/components/camera-panel';
import { SessionConfigCard } from '@/components/session-config';
import { SessionSummary } from '@/components/session-summary';
import { StatusBadge } from '@/components/status-badge';
import { TimerDisplay } from '@/components/timer-display';
import { ViolationOverlay } from '@/components/violation-overlay';
import { AttentionDetector } from '@/lib/attention-detector';
import { getDerivedState } from '@/lib/session-machine';
import { loadAggregate, loadHistory, loadSettings, saveSessionHistory, saveSettings, updateAggregate } from '@/lib/storage';
import { AppState, AttentionReading, BaselinePose, SessionConfig, SessionHistoryItem, SessionStats } from '@/lib/types';
import { uid } from '@/lib/utils';

const DEFAULTS: SessionConfig = {
  durationMinutes: 25,
  offscreenThresholdSec: 6,
  breakLimit: 2,
  breakDurationSec: 60,
  punishmentEnabled: true
};

const STABILIZE_MS = 2000;
const CALIBRATION_MS = 3000;
const CALIBRATION_SAMPLE_MS = 100;
const COUNTDOWN_MS = 3000;

export default function HomePage() {
  const [config, setConfig] = useState<SessionConfig>(DEFAULTS);
  const [appState, setAppState] = useState<AppState>('idle');
  const [attention, setAttention] = useState<AttentionReading | null>(null);
  const [baseline, setBaseline] = useState<BaselinePose | null>(null);
  const [remainingMs, setRemainingMs] = useState(config.durationMinutes * 60_000);
  const [offscreenMs, setOffscreenMs] = useState(0);
  const [stabilizeMs, setStabilizeMs] = useState(0);
  const [calibrationLeft, setCalibrationLeft] = useState(0);
  const [countdownLeft, setCountdownLeft] = useState(0);
  const [breakUsed, setBreakUsed] = useState(0);
  const [breakRemainingMs, setBreakRemainingMs] = useState(0);
  const [summaryStats, setSummaryStats] = useState<SessionStats | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [historyCount, setHistoryCount] = useState(0);
  const [aggregateSessions, setAggregateSessions] = useState(0);
  const [manualZoom, setManualZoom] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<AttentionDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const calibrationReadingsRef = useRef<AttentionReading[]>([]);
  const appStateRef = useRef<AppState>('idle');
  const baselineRef = useRef<BaselinePose | null>(null);
  const configRef = useRef<SessionConfig>(DEFAULTS);
  const breakUsedRef = useRef(0);

  const statsRef = useRef<SessionStats>({
    startedAt: '',
    totalFocusedMs: 0,
    violationCount: 0,
    longestDistractionMs: 0,
    breakUsed: 0,
    breakTimeUsedMs: 0
  });

  const totalMs = useMemo(() => config.durationMinutes * 60_000, [config.durationMinutes]);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    baselineRef.current = baseline;
  }, [baseline]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    breakUsedRef.current = breakUsed;
  }, [breakUsed]);

  useEffect(() => {
    const next = loadSettings(DEFAULTS);
    setConfig(next);
    setRemainingMs(next.durationMinutes * 60_000);
    setHistoryCount(loadHistory().length);
    setAggregateSessions(loadAggregate().sessions);
  }, []);

  useEffect(() => {
    saveSettings(config);
  }, [config]);

  const cleanupMedia = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
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
    setCalibrationLeft(0);
    setCountdownLeft(0);
    setRemainingMs(configRef.current.durationMinutes * 60_000);
    setSummaryStats(null);
    setCameraError('');
    setManualZoom(1);
    audioRef.current?.pause();
  };

  const finishSession = () => {
    cleanupMedia();
    const done: SessionStats = {
      ...statsRef.current,
      endedAt: new Date().toISOString(),
      breakUsed: breakUsedRef.current
    };
    const item: SessionHistoryItem = { id: uid(), config: configRef.current, stats: done };
    saveSessionHistory(item);
    updateAggregate({
      focusedMs: done.totalFocusedMs,
      violations: done.violationCount,
      breakMs: done.breakTimeUsedMs,
      longestDistractionMs: done.longestDistractionMs
    });
    setSummaryStats(done);
    setHistoryCount(loadHistory().length);
    setAggregateSessions(loadAggregate().sessions);
    setAppState('session_complete');
  };

  const triggerPunishment = async () => {
    setAppState('violated');
    statsRef.current.violationCount += 1;
    if (!configRef.current.punishmentEnabled) return;
    const media = audioRef.current;
    if (!media) return;
    media.volume = 1.0;
    media.currentTime = 0;
    try {
      await media.play();
    } catch {
      window.alert('LOCK IN ⚠️ Meme clip unavailable.');
    }
  };

  const startTrackingLoop = () => {
    if (rafRef.current) return;
    let lastTs = performance.now();
    const loop = async () => {
      const state = appStateRef.current;
      const now = performance.now();
      const delta = now - lastTs;
      lastTs = now;

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
          if (next <= 0) {
            finishSession();
            return 0;
          }
          return next;
        });
      }

      const reading = detectorRef.current ? await detectorRef.current.estimate(videoRef.current!, baselineRef.current) : null;
      setAttention(reading);

      const offscreen = !reading || reading.attention === 'offscreen' || !reading.facePresent;
      const warning = !reading || reading.attention === 'warning';
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

  const startSession = async () => {
    try {
      setCameraError('');
      setManualZoom(1);
      setAppState('requesting_permission');
      setSummaryStats(null);
      setRemainingMs(configRef.current.durationMinutes * 60_000);
      statsRef.current = {
        startedAt: new Date().toISOString(),
        totalFocusedMs: 0,
        violationCount: 0,
        longestDistractionMs: 0,
        breakUsed: 0,
        breakTimeUsedMs: 0
      };

      if (!detectorRef.current) {
        detectorRef.current = new AttentionDetector();
      }
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

      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        try {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch {
          // fallback handled in trigger
        }
      }

      setAppState('calibrating');
      setCalibrationLeft(Math.ceil(CALIBRATION_MS / 1000));
      calibrationReadingsRef.current = [];

      const calTick = setInterval(() => setCalibrationLeft((prev) => Math.max(0, prev - 1)), 1000);
      const sampleTimer = setInterval(async () => {
        if (appStateRef.current !== 'calibrating' || !videoRef.current || !detectorRef.current) return;
        const reading = await detectorRef.current.estimate(videoRef.current, null);
        calibrationReadingsRef.current.push(reading);
      }, CALIBRATION_SAMPLE_MS);

      setTimeout(() => {
        clearInterval(calTick);
        clearInterval(sampleTimer);
        const report = AttentionDetector.buildCalibration(
          calibrationReadingsRef.current,
          videoRef.current?.videoWidth || 1280,
          videoRef.current?.videoHeight || 720
        );
        if (!report.ok || !report.baseline) {
          const latestHints = calibrationReadingsRef.current[calibrationReadingsRef.current.length - 1]?.guidance ?? [];
          setCameraError(report.reason || latestHints[0] || 'Could not detect a face during calibration.');
          setAppState('camera_error');
          return;
        }
        setBaseline(report.baseline);
        setAppState('countdown');
        setCountdownLeft(Math.ceil(COUNTDOWN_MS / 1000));

        const c = setInterval(() => setCountdownLeft((prev) => Math.max(0, prev - 1)), 1000);

        setTimeout(() => {
          clearInterval(c);
          setAppState('focused');
        }, COUNTDOWN_MS);
      }, CALIBRATION_MS);
    } catch {
      setCameraError('Camera unavailable or face detector failed to initialize.');
      setAppState('camera_error');
    }
  };

  const takeBreak = () => {
    if (breakUsedRef.current >= configRef.current.breakLimit || appStateRef.current === 'violated') return;
    setBreakUsed((prev) => prev + 1);
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

  const status = appState === 'countdown' ? `Starting in ${countdownLeft}` : cameraError;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">SahurLock</h1>
        <p className="max-w-2xl text-zinc-300">
          Meme-powered focus enforcement. Everything runs locally in your browser — no webcam uploads.
        </p>
        <div className="flex items-center gap-3">
          <StatusBadge state={appState} />
          {status ? <span className="text-sm text-zinc-400">{status}</span> : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <SessionConfigCard value={config} onChange={setConfig} onStart={startSession} disabled={appState !== 'idle'} />
        <CameraPanel
          videoRef={videoRef}
          attention={attention}
          calibrationLeft={calibrationLeft}
          zoomLevel={manualZoom}
          onZoomIn={() => {
            const next = Math.min(2, manualZoom + 0.1);
            setManualZoom(next);
            detectorRef.current?.setManualZoom(next);
          }}
          onZoomOut={() => {
            const next = Math.max(1, manualZoom - 0.1);
            setManualZoom(next);
            detectorRef.current?.setManualZoom(next);
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TimerDisplay remainingMs={remainingMs} totalMs={totalMs} />
        <BreakControls
          breakUsed={breakUsed}
          breakLimit={config.breakLimit}
          breakActive={appState === 'break'}
          breakRemainingMs={breakRemainingMs}
          onStartBreak={takeBreak}
          disabled={!['focused', 'warning'].includes(appState)}
        />
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm">
          <h3 className="font-semibold">Session Stats</h3>
          <p className="mt-2 text-zinc-300">Violations: {statsRef.current.violationCount}</p>
          <p className="text-zinc-300">Current distraction: {(offscreenMs / 1000).toFixed(1)}s</p>
          <p className="text-zinc-300">Derived state: {derivedState}</p>
          <p className="text-zinc-300">Recovery stabilization: {(stabilizeMs / 1000).toFixed(1)}s</p>
          <p className="text-zinc-300">History entries: {historyCount}</p>
          <p className="text-zinc-300">Total sessions (local): {aggregateSessions}</p>
        </section>
      </div>

      <video ref={audioRef} className="hidden" src="/media/sahur.mp4" preload="auto" playsInline loop />

      <ViolationOverlay visible={appState === 'violated'} />

      {appState !== 'idle' && appState !== 'session_complete' ? (
        <div className="flex gap-2">
          <button onClick={finishSession} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">
            End Session
          </button>
          <button onClick={resetSession} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">
            Reset
          </button>
        </div>
      ) : null}

      {summaryStats ? <SessionSummary stats={summaryStats} onReset={resetSession} /> : null}
    </main>
  );
}
