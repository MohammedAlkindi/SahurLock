import Link from 'next/link';

const FEATURES = [
  {
    index: '01',
    title: 'Face mesh detection',
    description:
      'MediaPipe tracks 468 facial landmarks per frame, entirely in your browser. Gaze direction, eye openness, and head pose are computed locally — no model server, no round trips.'
  },
  {
    index: '02',
    title: 'Attention enforcement',
    description:
      'A configurable grace period determines how long you can look away. Exceed it and a fullscreen alert fires, blocking your view until you hold your gaze steady for two seconds.'
  },
  {
    index: '03',
    title: 'Local by design',
    description:
      'Webcam frames are processed in-memory and never transmitted. No account, no backend, no analytics. Session history is stored in browser localStorage only.'
  }
];

const STEPS = [
  {
    step: '01',
    title: 'Configure',
    description: 'Choose a preset or set your own session duration, grace period, and break allowance.'
  },
  {
    step: '02',
    title: 'Calibrate',
    description: 'Position yourself in frame. SahurLock records your neutral head pose in under four seconds.'
  },
  {
    step: '03',
    title: 'Work',
    description: 'The tracker runs silently. An alert fires when you drift past the threshold; hold your gaze to recover.'
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center overflow-hidden">
          <div className="h-[600px] w-[900px] rounded-full bg-green-500/8 blur-[120px]" />
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Local · No cloud · No account
        </div>

        <h1 className="mx-auto max-w-3xl text-5xl font-black leading-[1.08] tracking-tight md:text-6xl">
          Attention tracking{' '}
          <span className="text-green-400">with real consequences.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base text-zinc-400">
          SahurLock monitors your gaze via MediaPipe face mesh. Step away from the
          screen too long and a fullscreen alert fires — no escape until you return.
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
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Capabilities
          </p>
          <h2 className="mb-12 text-2xl font-bold">How it works under the hood</h2>
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
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Getting started
          </p>
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

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-900 px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Start a session</h2>
        <p className="mt-3 text-sm text-zinc-500">Calibration takes under four seconds.</p>
        <Link
          href="/session"
          className="mt-7 inline-block rounded-lg bg-green-500 px-8 py-3 text-sm font-semibold text-black transition hover:bg-green-400"
        >
          Open session page
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 px-4 py-8 text-center text-xs text-zinc-700">
        SahurLock &copy; 2026 Mohammed Alkindi &mdash; MIT License
      </footer>
    </main>
  );
}
