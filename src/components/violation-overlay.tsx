'use client';

interface Props {
  visible: boolean;
  stabilizeMs: number;
  maxStabilizeMs: number;
  violationCount: number;
}

export function ViolationOverlay({ visible, stabilizeMs, maxStabilizeMs, violationCount }: Props) {
  if (!visible) return null;

  const recoveryPct = maxStabilizeMs > 0 ? Math.min(100, (stabilizeMs / maxStabilizeMs) * 100) : 0;
  const recovering  = recoveryPct > 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 animate-violation-pulse">
      {/* Full-screen red fill */}
      <div className="absolute inset-0 bg-red-950/95" />

      {/* Animated border glow */}
      <div className="animate-border-glow absolute inset-0 border-4 border-red-500/80" />

      {/* Scan line effect */}
      <div className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-red-400/10 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Main warning */}
        <div>
          <p className="text-[80px] font-black leading-none tracking-widest text-white drop-shadow-2xl md:text-[120px]">
            LOCK IN
          </p>
          <p className="mt-3 text-lg font-medium text-red-200">
            Eyes on screen. Hold your gaze to recover.
          </p>
        </div>

        {/* Recovery progress */}
        <div className="w-full max-w-xs">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-red-300">Recovery</span>
            <span className={`font-bold tabular-nums ${recovering ? 'text-green-400' : 'text-red-400'}`}>
              {recoveryPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-red-800 bg-red-900/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${recoveryPct}%` }}
            />
          </div>
          {recovering && (
            <p className="mt-2 text-xs text-green-400/70">Maintaining gaze&hellip;</p>
          )}
        </div>

        {violationCount > 1 && (
          <div className="rounded border border-red-900 bg-red-950/60 px-4 py-1.5 text-xs text-red-500">
            Alert {violationCount} of this session
          </div>
        )}
      </div>
    </div>
  );
}
