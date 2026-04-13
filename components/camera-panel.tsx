'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { AttentionReading } from '@/lib/types';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  attention: AttentionReading | null;
  calibrationLeft: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
}

const ATTN_COLOR: Record<string, string> = {
  focused:  '#10b981',
  warning:  '#f59e0b',
  offscreen:'#ef4444',
  uncertain:'#64748b'
};

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFrame(
  canvas: HTMLCanvasElement,
  vW: number,
  vH: number,
  attention: AttentionReading
) {
  canvas.width  = vW;
  canvas.height = vH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, vW, vH);

  const col = ATTN_COLOR[attention.attention] ?? ATTN_COLOR.uncertain;

  // ── Face bounding box ──────────────────────────────────────────────────────
  if (attention.faceBox) {
    const { x, y, width, height } = attention.faceBox;
    ctx.save();
    ctx.strokeStyle = col + 'bb';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, x, y, width, height, 10);
    ctx.stroke();
    ctx.restore();
  }

  // ── Per-eye rendering ──────────────────────────────────────────────────────
  const eyes = [attention.leftEye, attention.rightEye];
  for (const eye of eyes) {
    if (!eye) continue;

    const ix = eye.irisX * vW;
    const iy = eye.irisY * vH;
    const ir = Math.max(eye.irisRadius * vW, 4);

    // Eye contour outline
    if (eye.contour.length >= 3) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(eye.contour[0].x * vW, eye.contour[0].y * vH);
      for (let i = 1; i < eye.contour.length; i++) {
        ctx.lineTo(eye.contour[i].x * vW, eye.contour[i].y * vH);
      }
      ctx.closePath();
      ctx.strokeStyle = col + 'cc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Subtle fill to highlight the eye region
      ctx.fillStyle = col + '18';
      ctx.fill();
      ctx.restore();
    }

    // Iris outer glow
    ctx.save();
    const glow = ctx.createRadialGradient(ix, iy, 0, ix, iy, ir * 3);
    glow.addColorStop(0, '#67e8f966');
    glow.addColorStop(1, '#67e8f900');
    ctx.beginPath();
    ctx.arc(ix, iy, ir * 3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.restore();

    // Iris ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(ix, iy, ir, 0, Math.PI * 2);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Pupil dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(ix, iy, Math.max(2.5, ir * 0.38), 0, Math.PI * 2);
    ctx.fillStyle = '#0c4a6e';
    ctx.fill();
    ctx.restore();

    // Gaze direction arrow (only when meaningful magnitude)
    const gMag = Math.hypot(eye.gazeX, eye.gazeY);
    if (gMag > 0.05) {
      const scale = ir * 4.5;
      const ex = ix + (eye.gazeX / Math.max(gMag, 0.001)) * gMag * scale;
      const ey = iy + (eye.gazeY / Math.max(gMag, 0.001)) * gMag * scale;

      ctx.save();
      ctx.strokeStyle = '#fbbf2499';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ix, iy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Arrow tip
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24cc';
      ctx.fill();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // ── Confidence text overlay (top-left corner) ──────────────────────────────
  const pct = Math.round(attention.confidence * 100);
  ctx.save();
  ctx.font = `bold ${Math.round(vH * 0.028)}px monospace`;
  ctx.fillStyle = col + 'dd';
  ctx.fillText(`${pct}%`, 10, Math.round(vH * 0.038));
  ctx.restore();
}

export function CameraPanel({
  videoRef,
  attention,
  calibrationLeft,
  onZoomIn,
  onZoomOut,
  zoomLevel
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas) return;

    if (!attention?.facePresent || !video?.videoWidth) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    drawFrame(canvas, video.videoWidth, video.videoHeight, attention);
  }, [attention, videoRef]);

  const leftOpen  = attention?.leftEye?.openRatio  ?? 0;
  const rightOpen = attention?.rightEye?.openRatio ?? 0;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Live Eye Tracking</h3>
        <span className="text-xs text-zinc-400">
          EAR L {leftOpen.toFixed(2)} / R {rightOpen.toFixed(2)}
        </span>
      </div>

      {/* Video + canvas overlay */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full object-cover transition-transform duration-150"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        />
        {/* Canvas sits on top, pointer-events:none so clicks pass through */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        {calibrationLeft > 0 ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-center text-lg font-semibold text-white">
            Calibrating… {calibrationLeft}
          </div>
        ) : null}
      </div>

      {/* Eye openness bars */}
      {(attention?.leftEye || attention?.rightEye) ? (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
          {(['Left', 'Right'] as const).map((side) => {
            const ratio = side === 'Left' ? leftOpen : rightOpen;
            const pct   = Math.min(100, Math.round(ratio * 600)); // scale EAR to %
            return (
              <div key={side}>
                <div className="mb-1">{side} eye</div>
                <div className="h-1.5 w-full rounded-full bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-100"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Zoom controls */}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={onZoomOut} className="rounded-md border border-zinc-700 px-2 py-1 text-xs">
          Zoom −
        </button>
        <button onClick={onZoomIn} className="rounded-md border border-zinc-700 px-2 py-1 text-xs">
          Zoom +
        </button>
        <span className="text-xs text-zinc-400">Zoom: {zoomLevel.toFixed(1)}×</span>
      </div>

      {attention?.guidance?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-300">
          {attention.guidance.slice(0, 4).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
