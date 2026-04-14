type OscType = 'sine' | 'square' | 'triangle';

function playSequence(
  notes: { freq: number; start: number; duration: number }[],
  volume = 0.25,
  type: OscType = 'sine'
) {
  if (typeof window === 'undefined') return;
  try {
    const ctx  = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);

    notes.forEach(({ freq, start, duration }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type           = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(1, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    });

    // Auto-close context after all notes finish
    const total = Math.max(...notes.map((n) => n.start + n.duration)) + 0.2;
    setTimeout(() => ctx.close(), total * 1000);
  } catch { /* AudioContext unavailable */ }
}

export const sounds = {
  breakStart() {
    playSequence([
      { freq: 440, start: 0,    duration: 0.12 },
      { freq: 554, start: 0.13, duration: 0.12 },
    ]);
  },
  breakEnd() {
    playSequence([
      { freq: 554, start: 0,    duration: 0.12 },
      { freq: 440, start: 0.13, duration: 0.12 },
    ]);
  },
  sessionComplete() {
    playSequence([
      { freq: 523, start: 0,    duration: 0.15 },
      { freq: 659, start: 0.16, duration: 0.15 },
      { freq: 784, start: 0.32, duration: 0.30 },
    ], 0.2);
  },
  violation(count: number) {
    // Escalates in harshness with each violation
    const vol  = Math.min(0.5, 0.2 + count * 0.06);
    const freq = Math.max(120, 220 - count * 15);
    playSequence([{ freq, start: 0, duration: 0.2 }], vol, 'square');
  },
  pomodoroRound() {
    playSequence([
      { freq: 660, start: 0,    duration: 0.1 },
      { freq: 660, start: 0.12, duration: 0.1 },
      { freq: 880, start: 0.24, duration: 0.2 },
    ], 0.2);
  },
};
