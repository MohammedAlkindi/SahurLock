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
    <main className="min-h-screen">
      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-lg font-black tracking-tight">
            <span className="text-green-400">S</span>ahurLock
          </span>
          <div className="flex items-center gap-1">
            <Link href="/session" className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Session</Link>
            <Link href="/tasks"   className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Tasks</Link>
            <Link href="/stats"   className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Stats</Link>
            <Link href="/session" className="ml-2 rounded-lg bg-green-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-green-400 transition-colors">New Session</Link>
          </div>
        </div>
      </nav>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center overflow-hidden">
          <div className="h-[600px] w-[900px] rounded-full bg-green-500/8 blur-[120px]" />
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-black leading-[1.08] tracking-tight md:text-6xl">
          Attention tracking{' '}
          <span className="text-green-400">with real consequences.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base text-zinc-400">
          Your webcam watches. Look away too long and a fullscreen alert locks you
          out until you come back. No escape.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/session"
            className="rounded-lg bg-green-500 px-7 py-3 text-sm font-semibold text-black transition hover:bg-green-400"
          >
            Start a session
          </Link>
          <Link
            href="/stats"
            className="rounded-lg border border-zinc-700 px-7 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            View stats
          </Link>
        </div>

        {/* Detector output preview */}
        <div className="mx-auto mt-14 max-w-xs rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left font-mono text-xs">
          <div className="mb-3 flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          <p className="text-zinc-600">attention-detector v0.1</p>
          <p className="mt-2 text-green-500">face_detected     true</p>
          <p className="text-green-500">gaze_on_screen    true</p>
          <p className="text-green-500">confidence        0.94</p>
          <p className="mt-2 text-zinc-600">— 4.2s elapsed —</p>
          <p className="text-red-400">attention         offscreen</p>
          <p className="text-red-400">alert             triggered</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-900 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-2xl font-bold">How it works</h2>
          <div className="grid gap-px border border-zinc-800 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.index}
                className={`bg-zinc-950 p-6 ${i < FEATURES.length - 1 ? 'border-b border-zinc-800 md:border-b-0 md:border-r' : ''}`}
              >
                <p className="mb-4 font-mono text-xs text-zinc-600">{f.index}</p>
                <h3 className="mb-2 text-sm font-semibold text-zinc-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-900 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-2xl font-bold">Three steps</h2>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <p className="mb-3 font-mono text-4xl font-black text-zinc-800">{s.step}</p>
                <h3 className="mb-1.5 text-sm font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 px-4 py-8 text-center text-xs text-zinc-700">
        SahurLock &copy; 2026 Mohammed Alkindi &mdash; MIT License
      </footer>
    </main>
  );
}
