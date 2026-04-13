'use client';

import type { RefObject } from 'react';
import { AttentionReading } from '@/lib/types';

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  attention: AttentionReading | null;
  calibrationLeft: number;
}

export function CameraPanel({ videoRef, attention, calibrationLeft }: Props) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">Live Tracking</h3>
        <span className="text-xs text-zinc-400">Confidence: {Math.round((attention?.confidence ?? 0) * 100)}%</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
        {calibrationLeft > 0 ? (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-center text-lg font-semibold text-white">
            Calibrating... {calibrationLeft}
          </div>
        ) : null}
      </div>
      {attention?.guidance?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-300">
          {attention.guidance.slice(0, 3).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
