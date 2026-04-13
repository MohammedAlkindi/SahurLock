'use client';

import type { RefObject } from 'react';
import { AttentionReading } from '@/lib/types';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  attention: AttentionReading | null;
  calibrationLeft: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
}

export function CameraPanel({ videoRef, attention, calibrationLeft, onZoomIn, onZoomOut, zoomLevel }: Props) {
  const box = attention?.faceBox;
  const frameW = videoRef.current?.videoWidth || 1;
  const frameH = videoRef.current?.videoHeight || 1;
  const eyeVector = attention
    ? {
        x: Math.max(-1, Math.min(1, attention.eyeDirectionX * 2.5)),
        y: Math.max(-1, Math.min(1, attention.eyeDirectionY * 2.5))
      }
    : null;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Live Tracking</h3>
        <span className="text-xs text-zinc-400">Confidence: {Math.round((attention?.confidence ?? 0) * 100)}%</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
        {box ? (
          <div
            className="pointer-events-none absolute border-2 border-emerald-400"
            style={{
              left: `${(box.x / frameW) * 100}%`,
              top: `${(box.y / frameH) * 100}%`,
              width: `${(box.width / frameW) * 100}%`,
              height: `${(box.height / frameH) * 100}%`
            }}
          />
        ) : null}
        {eyeVector ? (
          <div className="pointer-events-none absolute right-3 top-3 h-12 w-12 rounded-full border border-zinc-300/60 bg-black/50">
            <div
              className="absolute h-2 w-2 rounded-full bg-cyan-300"
              style={{ left: `${50 + eyeVector.x * 40}%`, top: `${50 + eyeVector.y * 40}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
        ) : null}
        {calibrationLeft > 0 ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-center text-lg font-semibold text-white">
            Calibrating... {calibrationLeft}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={onZoomOut} className="rounded-md border border-zinc-700 px-2 py-1 text-xs">
          Zoom -
        </button>
        <button onClick={onZoomIn} className="rounded-md border border-zinc-700 px-2 py-1 text-xs">
          Zoom +
        </button>
        <span className="text-xs text-zinc-400">Fallback zoom: {zoomLevel.toFixed(2)}x</span>
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
