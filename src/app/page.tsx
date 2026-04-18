import Link from 'next/link';

const FEATURES = [
  {
    index: '01',
    title: 'Face tracking',
    description: 'MediaPipe runs in your browser — no server, no uploads. Webcam frames are processed in memory and discarded.',
  },
  {
    index: '02',
    title: 'Enforcement',
    description: 'Drift past the grace period and a fullscreen alert fires. It stays until you hold your gaze steady.',
  },
  {
    index: '03',
    title: 'Fully local',
    description: 'No account. No backend. Session history lives in your browser only.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2">
          <span className="text-sm font-black tracking-tight">
            <span className="text-accent">S</span>ahurLock
          </span>
          <div className="flex items-center gap-0.5">
            <Link href="/session" className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Session</Link>
            <Link href="/stats"   className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Stats</Link>
            <Link href="/session" className="ml-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">Start</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero + preview ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center px-5 pt-8 pb-6 text-center">

        <h1 className="text-[1.65rem] font-black leading-snug tracking-tight md:text-[2rem]">
          Attention tracking{' '}
          <span className="text-accent">with real consequences.</span>
        </h1>

        <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          Your webcam watches. Look away too long — a fullscreen alert locks you out until you refocus.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/session"
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition"
          >
            Start a session
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-foreground/20 hover:text-foreground transition"
          >
            View stats
          </Link>
        </div>

        {/* Terminal preview */}
        <div className="mt-5 w-full max-w-[13rem] rounded-xl border border-border bg-[#1A1A1A] p-3 text-left font-mono text-[10.5px] shadow-md">
          <div className="mb-2 flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          </div>
          <p className="text-zinc-600">attention-detector</p>
          <p className="mt-1.5 text-green-400">face_detected   true</p>
          <p className="text-green-400">confidence      0.94</p>
          <p className="mt-1.5 text-zinc-600">— 4.2s elapsed —</p>
          <p className="text-red-400">attention       offscreen</p>
          <p className="text-red-400">alert           triggered</p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section className="border-t border-border px-5 py-7">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.index}
                className={`bg-card p-4 ${i < FEATURES.length - 1 ? 'border-b border-border md:border-b-0 md:border-r' : ''}`}
              >
                <p className="mb-2 font-mono text-[9px] text-muted-foreground/40">{f.index}</p>
                <h3 className="mb-1 text-xs font-semibold text-foreground">{f.title}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-5 py-4 text-center text-[10px] text-muted-foreground/40">
        SahurLock &copy; 2026 Mohammed Alkindi &mdash; MIT License
      </footer>

    </main>
  );
}
