import Link from 'next/link';

const FEATURES = [
  {
    index: '01',
    title: 'Face tracking',
    description:
      'MediaPipe runs entirely in your browser — no server, no uploads. It tracks your gaze direction, head pose, and eye openness on every frame.'
  },
  {
    index: '02',
    title: 'Punishment on violation',
    description:
      'Drift past the grace period and a fullscreen alert fires. It stays until you hold your gaze steady for two seconds. You cannot click it away.'
  },
  {
    index: '03',
    title: 'Nothing leaves your device',
    description:
      'No account. No backend. Webcam frames are processed in memory and discarded. Session history lives in your browser.'
  }
];

const STEPS = [
  {
    step: '01',
    title: 'Configure',
    description: 'Pick a preset or dial in your own duration, grace period, and breaks.'
  },
  {
    step: '02',
    title: 'Calibrate',
    description: 'Sit in frame. SahurLock reads your neutral pose in a few seconds and locks it in.'
  },
  {
    step: '03',
    title: 'Work',
    description: 'The tracker runs in the background. Drift too far and the alert fires. Stay focused to clear it.'
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-black tracking-tight">
            <span className="text-accent">S</span>ahurLock
          </span>
          <div className="flex items-center gap-1">
            <Link href="/session" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Session</Link>
            <Link href="/tasks"   className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Tasks</Link>
            <Link href="/stats"   className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Stats</Link>
            <Link href="/session" className="ml-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">New Session</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-16 pt-14 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center overflow-hidden">
          <div className="h-[500px] w-[800px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-2xl">
          <h1 className="text-[3.25rem] font-black leading-[1.05] tracking-tight md:text-[4rem]">
            Attention tracking{' '}
            <span className="text-accent">with real consequences.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
            Your webcam watches. Look away too long and a fullscreen alert locks you
            out until you come back. No escape.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <Link
              href="/session"
              className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              Start a session
            </Link>
            <Link
              href="/stats"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
            >
              View stats
            </Link>
          </div>

          {/* Detector output preview */}
          <div className="mx-auto mt-8 max-w-[17rem] rounded-xl border border-border bg-[#1A1A1A] p-4 text-left font-mono text-xs shadow-lg">
            <div className="mb-3 flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>
            <p className="text-zinc-500">attention-detector v0.1</p>
            <p className="mt-2 text-green-400">face_detected     true</p>
            <p className="text-green-400">gaze_on_screen    true</p>
            <p className="text-green-400">confidence        0.94</p>
            <p className="mt-2 text-zinc-500">— 4.2s elapsed —</p>
            <p className="text-red-400">attention         offscreen</p>
            <p className="text-red-400">alert             triggered</p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-2xl font-bold">How it works</h2>
          <div className="grid gap-px border border-border rounded-2xl overflow-hidden md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.index}
                className={`bg-card p-6 ${i < FEATURES.length - 1 ? 'border-b border-border md:border-b-0 md:border-r' : ''}`}
              >
                <p className="mb-4 font-mono text-xs text-muted-foreground/50">{f.index}</p>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-border px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-2xl font-bold">Three steps</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <p className="mb-3 font-mono text-4xl font-black text-border">{s.step}</p>
                <h3 className="mb-1.5 text-sm font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground/50">
        SahurLock &copy; 2026 Mohammed Alkindi &mdash; MIT License
      </footer>
    </main>
  );
}
