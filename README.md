# SahurLock MVP

SahurLock is a browser-based focus enforcement app that uses your webcam and client-side face tracking to estimate attention. If you're off-screen too long (outside allowed breaks), it triggers a fullscreen **LOCK IN** punishment overlay and optionally plays a local meme clip.

## Features

- Next.js App Router + TypeScript + Tailwind CSS
- Client-side webcam processing using the browser Face Detection API (with graceful uncertainty fallback)
- Explicit app states: idle, requesting permission, calibrating, countdown, focused, warning, break, violated, session complete, camera error
- 2.5s calibration and visible 3s countdown before session starts
- Warning at 50% off-screen threshold
- Violation clear requires 2s continuous attention stabilization
- Configurable session duration, thresholds, break count/duration, punishment on/off
- Local persistence for settings, history, and aggregate stats
- No frame upload; all processing stays in browser

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Punishment media asset

Expected path:

- `public/media/sahur.mp4`

A placeholder instruction file is included at `public/media/README.md`. Replace/add `sahur.mp4` with your own clip.

## Known limitations

- Detection depends on browser support for `FaceDetector` (Chromium-based browsers recommended). Unsupported browsers will stay in uncertain mode and avoid aggressive punishment.
- Browsers require user interaction for media playback. SahurLock primes playback after **Start Session** but still gracefully falls back to visual-only alert if playback is blocked.
- Landmark quality can drop in low light, extreme camera angles, or lower-end devices.
