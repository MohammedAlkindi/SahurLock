// Ambient sounds generated entirely via Web Audio API — no audio files needed.

export interface SoundDef {
  id: string;
  label: string;
  category: string;
  emoji: string;
  headphones?: boolean; // binaural beats work best with headphones
}

export const SOUNDS: SoundDef[] = [
  // ── Noise colors ────────────────────────────────────────────────────────────
  { id: 'white',       label: 'White Noise',    category: 'Noise',          emoji: '⬜' },
  { id: 'pink',        label: 'Pink Noise',     category: 'Noise',          emoji: '🌸' },
  { id: 'brown',       label: 'Brown Noise',    category: 'Noise',          emoji: '🟤' },
  { id: 'blue',        label: 'Blue Noise',     category: 'Noise',          emoji: '🔷' },
  { id: 'violet',      label: 'Violet Noise',   category: 'Noise',          emoji: '🟣' },
  { id: 'grey',        label: 'Grey Noise',     category: 'Noise',          emoji: '🩶' },
  { id: 'soft-white',  label: 'Soft White',     category: 'Noise',          emoji: '🌫️' },
  { id: 'warm-brown',  label: 'Warm Brown',     category: 'Noise',          emoji: '☕' },
  { id: 'deep-rumble', label: 'Deep Rumble',    category: 'Noise',          emoji: '🔊' },
  { id: 'airy',        label: 'Airy',           category: 'Noise',          emoji: '💨' },

  // ── Rain & Water ─────────────────────────────────────────────────────────────
  { id: 'drizzle',        label: 'Drizzle',        category: 'Rain & Water',   emoji: '🌂'  },
  { id: 'light-rain',     label: 'Light Rain',     category: 'Rain & Water',   emoji: '🌦️' },
  { id: 'rain',           label: 'Rain',           category: 'Rain & Water',   emoji: '🌧️' },
  { id: 'heavy-rain',     label: 'Heavy Rain',     category: 'Rain & Water',   emoji: '⛈️' },
  { id: 'monsoon',        label: 'Monsoon',        category: 'Rain & Water',   emoji: '🌊'  },
  { id: 'tropical-rain',  label: 'Tropical Rain',  category: 'Rain & Water',   emoji: '🌴'  },
  { id: 'spring-rain',    label: 'Spring Rain',    category: 'Rain & Water',   emoji: '🌷'  },
  { id: 'ocean-calm',     label: 'Calm Ocean',     category: 'Rain & Water',   emoji: '🌅'  },
  { id: 'ocean-waves',    label: 'Ocean Waves',    category: 'Rain & Water',   emoji: '🌊'  },
  { id: 'crashing-waves', label: 'Crashing Waves', category: 'Rain & Water',   emoji: '🏄'  },
  { id: 'gentle-stream',  label: 'Gentle Stream',  category: 'Rain & Water',   emoji: '🏞️' },
  { id: 'rushing-river',  label: 'Rushing River',  category: 'Rain & Water',   emoji: '🏔️' },
  { id: 'waterfall',      label: 'Waterfall',      category: 'Rain & Water',   emoji: '💧'  },
  { id: 'cave-drip',      label: 'Cave Drip',      category: 'Rain & Water',   emoji: '🦇'  },
  { id: 'still-pond',     label: 'Still Pond',     category: 'Rain & Water',   emoji: '🐸'  },

  // ── Wind & Weather ───────────────────────────────────────────────────────────
  { id: 'gentle-breeze',   label: 'Gentle Breeze',   category: 'Wind & Weather', emoji: '🍃' },
  { id: 'forest-wind',     label: 'Forest Wind',     category: 'Wind & Weather', emoji: '🌲' },
  { id: 'desert-wind',     label: 'Desert Wind',     category: 'Wind & Weather', emoji: '🏜️'},
  { id: 'mountain-wind',   label: 'Mountain Wind',   category: 'Wind & Weather', emoji: '⛰️'},
  { id: 'arctic-wind',     label: 'Arctic Wind',     category: 'Wind & Weather', emoji: '🌨️'},
  { id: 'storm-wind',      label: 'Storm Wind',      category: 'Wind & Weather', emoji: '🌪️'},
  { id: 'blizzard',        label: 'Blizzard',        category: 'Wind & Weather', emoji: '❄️' },
  { id: 'thunderstorm',    label: 'Thunderstorm',    category: 'Wind & Weather', emoji: '⛈️'},
  { id: 'distant-thunder', label: 'Distant Thunder', category: 'Wind & Weather', emoji: '🌩️'},
  { id: 'snowfall',        label: 'Snowfall',        category: 'Wind & Weather', emoji: '🌨️'},
  { id: 'hail',            label: 'Hail',            category: 'Wind & Weather', emoji: '🌧️'},

  // ── Nature ────────────────────────────────────────────────────────────────────
  { id: 'campfire',        label: 'Campfire',        category: 'Nature', emoji: '🔥' },
  { id: 'fireplace',       label: 'Fireplace',       category: 'Nature', emoji: '🏠' },
  { id: 'summer-night',    label: 'Summer Night',    category: 'Nature', emoji: '🌙' },
  { id: 'dawn',            label: 'Dawn',            category: 'Nature', emoji: '🌄' },
  { id: 'deep-forest',     label: 'Deep Forest',     category: 'Nature', emoji: '🌿' },
  { id: 'tropical-forest', label: 'Tropical Forest', category: 'Nature', emoji: '🦜' },
  { id: 'leaves',          label: 'Rustling Leaves', category: 'Nature', emoji: '🍂' },
  { id: 'forest-morning',  label: 'Forest Morning',  category: 'Nature', emoji: '🌳' },
  { id: 'open-plains',     label: 'Open Plains',     category: 'Nature', emoji: '🌾' },
  { id: 'marsh-night',     label: 'Marsh Night',     category: 'Nature', emoji: '🌿' },

  // ── Urban & Indoor ────────────────────────────────────────────────────────────
  { id: 'cafe',         label: 'Café',           category: 'Urban & Indoor', emoji: '☕' },
  { id: 'library',      label: 'Library',        category: 'Urban & Indoor', emoji: '📚' },
  { id: 'office',       label: 'Office',         category: 'Urban & Indoor', emoji: '💼' },
  { id: 'computer-fan', label: 'Computer Fan',   category: 'Urban & Indoor', emoji: '💻' },
  { id: 'ac-unit',      label: 'AC Unit',        category: 'Urban & Indoor', emoji: '🌬️'},
  { id: 'ceiling-fan',  label: 'Ceiling Fan',    category: 'Urban & Indoor', emoji: '🔄' },
  { id: 'train-cabin',  label: 'Train Cabin',    category: 'Urban & Indoor', emoji: '🚂' },
  { id: 'airplane',     label: 'Airplane',       category: 'Urban & Indoor', emoji: '✈️' },
  { id: 'subway',       label: 'Subway',         category: 'Urban & Indoor', emoji: '🚇' },
  { id: 'city-traffic', label: 'City Traffic',   category: 'Urban & Indoor', emoji: '🚗' },
  { id: 'night-city',   label: 'Night City',     category: 'Urban & Indoor', emoji: '🌃' },
  { id: 'underground',  label: 'Underground',    category: 'Urban & Indoor', emoji: '⛏️' },

  // ── Space & Sci-Fi ────────────────────────────────────────────────────────────
  { id: 'deep-space',    label: 'Deep Space',    category: 'Space',  emoji: '🌌' },
  { id: 'spacecraft',    label: 'Spacecraft',    category: 'Space',  emoji: '🛸' },
  { id: 'reactor',       label: 'Reactor',       category: 'Space',  emoji: '⚛️' },
  { id: 'portal',        label: 'Portal',        category: 'Space',  emoji: '🌀' },
  { id: 'nebula',        label: 'Nebula',        category: 'Space',  emoji: '🔮' },
  { id: 'cosmic-wind',   label: 'Cosmic Wind',   category: 'Space',  emoji: '🌠' },
  { id: 'black-hole',    label: 'Black Hole',    category: 'Space',  emoji: '⚫' },
  { id: 'space-station', label: 'Space Station', category: 'Space',  emoji: '🛰️'},
  { id: 'warp-drive',    label: 'Warp Drive',    category: 'Space',  emoji: '🚀' },
  { id: 'void',          label: 'Void',          category: 'Space',  emoji: '🕳️' },

  // ── Tones & Frequencies ──────────────────────────────────────────────────────
  { id: 'hz174',        label: '174 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz285',        label: '285 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz396',        label: '396 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz417',        label: '417 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz432',        label: '432 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz440',        label: '440 Hz — A',     category: 'Tones',  emoji: '🎵' },
  { id: 'hz528',        label: '528 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz639',        label: '639 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz741',        label: '741 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz852',        label: '852 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'hz963',        label: '963 Hz',         category: 'Tones',  emoji: '🎵' },
  { id: 'drone-40',     label: 'Drone 40 Hz',    category: 'Tones',  emoji: '🎸' },
  { id: 'drone-60',     label: 'Drone 60 Hz',    category: 'Tones',  emoji: '🎸' },
  { id: 'drone-80',     label: 'Drone 80 Hz',    category: 'Tones',  emoji: '🎸' },
  { id: 'drone-110',    label: 'Drone 110 Hz',   category: 'Tones',  emoji: '🎸' },
  { id: 'drone-220',    label: 'Drone 220 Hz',   category: 'Tones',  emoji: '🎸' },
  { id: 'om-136',       label: 'Om — 136 Hz',    category: 'Tones',  emoji: '🕉️' },
  { id: 'crystal-bowl', label: 'Crystal Bowl',   category: 'Tones',  emoji: '🎶' },
  { id: 'bell-fade',    label: 'Bell Fade',      category: 'Tones',  emoji: '🔔' },
  { id: 'singing-bowl', label: 'Singing Bowl',   category: 'Tones',  emoji: '🪘' },

  // ── Binaural Beats ────────────────────────────────────────────────────────────
  { id: 'delta', label: 'Delta (2 Hz)',   category: 'Binaural', emoji: '😴', headphones: true },
  { id: 'theta', label: 'Theta (6 Hz)',   category: 'Binaural', emoji: '🧘', headphones: true },
  { id: 'alpha', label: 'Alpha (10 Hz)',  category: 'Binaural', emoji: '🌊', headphones: true },
  { id: 'beta',  label: 'Beta (20 Hz)',   category: 'Binaural', emoji: '⚡', headphones: true },
  { id: 'gamma', label: 'Gamma (40 Hz)',  category: 'Binaural', emoji: '🧠', headphones: true },

  // ── Textures ──────────────────────────────────────────────────────────────────
  { id: 'warm-pad',      label: 'Warm Pad',     category: 'Textures', emoji: '🌅' },
  { id: 'deep-bass-tex', label: 'Deep Bass',    category: 'Textures', emoji: '🔉' },
  { id: 'static',        label: 'Static',       category: 'Textures', emoji: '📺' },
  { id: 'smooth',        label: 'Smooth',       category: 'Textures', emoji: '🪞' },
  { id: 'gritty',        label: 'Gritty',       category: 'Textures', emoji: '⚙️' },
  { id: 'crystal-tex',   label: 'Crystal',      category: 'Textures', emoji: '💎' },
  { id: 'murky',         label: 'Murky Depth',  category: 'Textures', emoji: '🌑' },
  { id: 'bright-focus',  label: 'Bright Focus', category: 'Textures', emoji: '💡' },
  { id: 'velvet',        label: 'Soft Velvet',  category: 'Textures', emoji: '🟫' },
  { id: 'thick-fog',     label: 'Thick Fog',    category: 'Textures', emoji: '🌁' },
  { id: 'midnight',      label: 'Midnight',     category: 'Textures', emoji: '🌙' },
  { id: 'dawn-light',    label: 'Dawn Light',   category: 'Textures', emoji: '🌤️' },
];

// ── Synthesis primitives ────────────────────────────────────────────────────────

const BUF_SEC = 10; // buffer length for all sounds

function mk1(ac: AudioContext): [AudioBuffer, Float32Array] {
  const n = Math.round(ac.sampleRate * BUF_SEC);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  return [buf, buf.getChannelData(0)];
}

function mk2(ac: AudioContext): [AudioBuffer, Float32Array, Float32Array] {
  const n = Math.round(ac.sampleRate * BUF_SEC);
  const buf = ac.createBuffer(2, n, ac.sampleRate);
  return [buf, buf.getChannelData(0), buf.getChannelData(1)];
}

function fillWhite(d: Float32Array) {
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}

function fillPink(d: Float32Array) {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616  * b5 - w * 0.0168980;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
}

function fillBrown(d: Float32Array) {
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
}

function fillBlue(d: Float32Array) {
  let prev = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    d[i] = w - prev; prev = w;
  }
}

function fillViolet(d: Float32Array) {
  const tmp = new Float32Array(d.length);
  fillBlue(tmp);
  let prev = 0;
  for (let i = 0; i < d.length; i++) {
    d[i] = tmp[i] - prev; prev = tmp[i];
  }
}

// One-pole IIR lowpass
function lpf(d: Float32Array, fc: number, sr: number) {
  const a = Math.exp(-2 * Math.PI * fc / sr);
  let y = 0;
  for (let i = 0; i < d.length; i++) { y = (1 - a) * d[i] + a * y; d[i] = y; }
}

// One-pole IIR highpass
function hpf(d: Float32Array, fc: number, sr: number) {
  const a = Math.exp(-2 * Math.PI * fc / sr);
  let xp = 0, yp = 0;
  for (let i = 0; i < d.length; i++) {
    const y = a * (yp + d[i] - xp);
    xp = d[i]; yp = y; d[i] = y;
  }
}

// Normalize to peak level
function norm(d: Float32Array, peak = 0.75) {
  let mx = 0;
  for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > mx) mx = Math.abs(d[i]);
  if (mx < 1e-9) return;
  const s = peak / mx;
  for (let i = 0; i < d.length; i++) d[i] *= s;
}

// Scale in-place
function scl(d: Float32Array, g: number) {
  for (let i = 0; i < d.length; i++) d[i] *= g;
}

// Mix b into a (a += b * m)
function mixInto(a: Float32Array, b: Float32Array, m: number) {
  for (let i = 0; i < a.length; i++) a[i] += b[i] * m;
}

// LFO amplitude modulation (cosine-window so it's smooth and non-harsh)
function lfoAM(d: Float32Array, freq: number, depth: number, sr: number, phase = 0) {
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    d[i] *= 1 - depth * 0.5 * (1 - Math.cos(2 * Math.PI * freq * t + phase));
  }
}

// Add a pure sine tone
function addSine(d: Float32Array, freq: number, amp: number, sr: number, phase = 0) {
  for (let i = 0; i < d.length; i++)
    d[i] += amp * Math.sin(2 * Math.PI * freq * (i / sr) + phase);
}

// Add a decaying sine (bell / bowl texture)
function addDecaySine(d: Float32Array, freq: number, decay: number, amp: number, sr: number) {
  for (let i = 0; i < d.length; i++) {
    const t = i / sr;
    d[i] += amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t);
  }
}

// Periodic decaying sines evenly spread over the buffer (loopable bowl sound)
function addPeriodicBowl(d: Float32Array, freq: number, decay: number, amp: number, sr: number, period: number) {
  const periodSamples = Math.round(period * sr);
  for (let start = 0; start < d.length; start += periodSamples) {
    for (let j = start; j < Math.min(start + periodSamples, d.length); j++) {
      const t = (j - start) / sr;
      d[j] += amp * Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t);
    }
  }
}

// Random crackle bursts (fire/wood texture)
function addCrackle(d: Float32Array, sr: number, rate = 8) {
  for (let i = 0; i < d.length; i++) {
    if (Math.random() < rate / sr) {
      const len = Math.floor(0.003 * sr * (0.3 + Math.random()));
      const amp = 0.4 + Math.random() * 0.6;
      for (let j = i; j < Math.min(i + len, d.length); j++)
        d[j] += amp * (Math.random() * 2 - 1) * Math.pow(1 - (j - i) / len, 2);
    }
  }
}

// Random drip sounds (cave water)
function addDrips(d: Float32Array, sr: number, rate = 0.4) {
  for (let i = 0; i < d.length; i++) {
    if (Math.random() < rate / sr) {
      const freq  = 400 + Math.random() * 1200;
      const decay = 12 + Math.random() * 20;
      const len   = Math.floor(0.15 * sr);
      for (let j = i; j < Math.min(i + len, d.length); j++) {
        const t = (j - i) / sr;
        d[j] += 0.5 * Math.exp(-decay * t) * Math.sin(2 * Math.PI * freq * t);
      }
    }
  }
}

// ── Main generator ──────────────────────────────────────────────────────────────

function generateBuffer(ac: AudioContext, id: string): AudioBuffer {
  const sr = ac.sampleRate;
  const [buf, d] = mk1(ac);

  switch (id) {
    // ── Noise ───────────────────────────────────────────────────────────────────
    case 'white':
      fillWhite(d); scl(d, 0.6); return buf;

    case 'pink':
      fillPink(d); norm(d, 0.7); return buf;

    case 'brown':
      fillBrown(d); norm(d, 0.75); return buf;

    case 'blue':
      fillBlue(d); norm(d, 0.55); return buf;

    case 'violet':
      fillViolet(d); norm(d, 0.45); return buf;

    case 'grey': {
      // Pink noise with heavy lowpass — muffled, neutral
      fillPink(d); lpf(d, 800, sr); norm(d, 0.7); return buf;
    }

    case 'soft-white': {
      fillWhite(d); lpf(d, 600, sr); lpf(d, 600, sr); norm(d, 0.7); return buf;
    }

    case 'warm-brown': {
      fillBrown(d); hpf(d, 40, sr); lpf(d, 2000, sr); norm(d, 0.72); return buf;
    }

    case 'deep-rumble': {
      fillBrown(d); lpf(d, 120, sr); lpf(d, 120, sr); norm(d, 0.8); return buf;
    }

    case 'airy': {
      fillWhite(d); hpf(d, 3000, sr); norm(d, 0.5); return buf;
    }

    // ── Rain & Water ─────────────────────────────────────────────────────────────
    case 'drizzle': {
      fillPink(d); hpf(d, 1500, sr); norm(d, 0.35); return buf;
    }

    case 'light-rain': {
      fillPink(d); hpf(d, 600, sr); norm(d, 0.55); return buf;
    }

    case 'rain': {
      fillPink(d); norm(d, 0.65); return buf;
    }

    case 'heavy-rain': {
      const b = new Float32Array(d.length);
      fillPink(d); fillBrown(b);
      mixInto(d, b, 0.35); norm(d, 0.72); return buf;
    }

    case 'monsoon': {
      const b = new Float32Array(d.length);
      fillPink(d); fillBrown(b);
      mixInto(d, b, 0.6); norm(d, 0.82); return buf;
    }

    case 'tropical-rain': {
      fillPink(d);
      // Mild mid boost via bandpass addition
      const mid = new Float32Array(d.length);
      fillPink(mid); lpf(mid, 1800, sr); hpf(mid, 400, sr);
      mixInto(d, mid, 0.5); norm(d, 0.72); return buf;
    }

    case 'spring-rain': {
      fillPink(d); hpf(d, 300, sr);
      lfoAM(d, 0.07, 0.18, sr); norm(d, 0.6); return buf;
    }

    case 'ocean-calm': {
      fillPink(d); lpf(d, 900, sr);
      lfoAM(d, 0.04, 0.75, sr); norm(d, 0.72); return buf;
    }

    case 'ocean-waves': {
      const b = new Float32Array(d.length);
      fillPink(d); fillBrown(b);
      mixInto(d, b, 0.4);
      lfoAM(d, 0.09, 0.72, sr); norm(d, 0.75); return buf;
    }

    case 'crashing-waves': {
      const b = new Float32Array(d.length);
      fillPink(d); fillBrown(b);
      mixInto(d, b, 0.5);
      lfoAM(d, 0.12, 0.85, sr); norm(d, 0.82); return buf;
    }

    case 'gentle-stream': {
      fillPink(d); lpf(d, 3500, sr); hpf(d, 300, sr);
      lfoAM(d, 0.25, 0.25, sr); norm(d, 0.65); return buf;
    }

    case 'rushing-river': {
      fillPink(d); hpf(d, 150, sr); lpf(d, 5000, sr);
      lfoAM(d, 0.15, 0.3, sr); norm(d, 0.75); return buf;
    }

    case 'waterfall': {
      fillWhite(d); lpf(d, 4000, sr); hpf(d, 200, sr); norm(d, 0.72); return buf;
    }

    case 'cave-drip': {
      // Near silence with periodic water drops
      fillPink(d); scl(d, 0.02);
      addDrips(d, sr, 0.5); norm(d, 0.7); return buf;
    }

    case 'still-pond': {
      fillPink(d); lpf(d, 400, sr); scl(d, 0.25);
      addDrips(d, sr, 0.15); norm(d, 0.55); return buf;
    }

    // ── Wind & Weather ───────────────────────────────────────────────────────────
    case 'gentle-breeze': {
      fillPink(d); hpf(d, 400, sr); lpf(d, 3000, sr);
      lfoAM(d, 0.05, 0.45, sr); norm(d, 0.55); return buf;
    }

    case 'forest-wind': {
      fillPink(d); hpf(d, 300, sr);
      lfoAM(d, 0.1, 0.5, sr); norm(d, 0.65); return buf;
    }

    case 'desert-wind': {
      fillPink(d); lpf(d, 2000, sr); hpf(d, 80, sr);
      lfoAM(d, 0.08, 0.6, sr, 0.5); norm(d, 0.68); return buf;
    }

    case 'mountain-wind': {
      fillPink(d); hpf(d, 500, sr);
      lfoAM(d, 0.15, 0.7, sr); norm(d, 0.72); return buf;
    }

    case 'arctic-wind': {
      fillWhite(d); hpf(d, 1000, sr);
      lfoAM(d, 0.18, 0.65, sr, 1.0); norm(d, 0.6); return buf;
    }

    case 'storm-wind': {
      fillPink(d); hpf(d, 200, sr);
      lfoAM(d, 0.2, 0.78, sr); norm(d, 0.8); return buf;
    }

    case 'blizzard': {
      fillWhite(d); hpf(d, 800, sr);
      lfoAM(d, 0.3, 0.7, sr, 0.3); norm(d, 0.65); return buf;
    }

    case 'thunderstorm': {
      const rain = new Float32Array(d.length);
      fillPink(d); fillBrown(rain); lpf(rain, 150, sr);
      mixInto(d, rain, 1.2); norm(d, 0.8); return buf;
    }

    case 'distant-thunder': {
      fillBrown(d); lpf(d, 90, sr);
      lfoAM(d, 0.06, 0.85, sr, 0.8); norm(d, 0.7); return buf;
    }

    case 'snowfall': {
      fillPink(d); lpf(d, 300, sr); scl(d, 0.15); norm(d, 0.25); return buf;
    }

    case 'hail': {
      fillWhite(d); hpf(d, 2000, sr);
      lfoAM(d, 4, 0.5, sr); norm(d, 0.6); return buf;
    }

    // ── Nature ────────────────────────────────────────────────────────────────────
    case 'campfire': {
      fillBrown(d); lpf(d, 800, sr);
      addCrackle(d, sr, 10); norm(d, 0.72); return buf;
    }

    case 'fireplace': {
      fillBrown(d); lpf(d, 600, sr);
      addCrackle(d, sr, 6); norm(d, 0.68); return buf;
    }

    case 'summer-night': {
      fillPink(d); hpf(d, 1200, sr);
      // Insect-like AM modulation at 60 Hz
      lfoAM(d, 60, 0.35, sr); norm(d, 0.55); return buf;
    }

    case 'dawn': {
      fillPink(d); hpf(d, 800, sr); lfoAM(d, 0.15, 0.2, sr); norm(d, 0.52); return buf;
    }

    case 'deep-forest': {
      const low = new Float32Array(d.length);
      fillBrown(low); lpf(low, 200, sr);
      fillPink(d);
      mixInto(d, low, 0.5); norm(d, 0.65); return buf;
    }

    case 'tropical-forest': {
      const low = new Float32Array(d.length);
      fillBrown(low); lpf(low, 150, sr);
      fillPink(d); hpf(d, 500, sr);
      lfoAM(d, 45, 0.2, sr);
      mixInto(d, low, 0.4); norm(d, 0.68); return buf;
    }

    case 'leaves': {
      fillWhite(d); lpf(d, 2500, sr); hpf(d, 600, sr);
      lfoAM(d, 1.5, 0.55, sr); norm(d, 0.55); return buf;
    }

    case 'forest-morning': {
      fillPink(d); lpf(d, 2000, sr);
      lfoAM(d, 0.07, 0.15, sr); norm(d, 0.6); return buf;
    }

    case 'open-plains': {
      fillPink(d); lpf(d, 1200, sr); hpf(d, 60, sr);
      lfoAM(d, 0.04, 0.35, sr); norm(d, 0.58); return buf;
    }

    case 'marsh-night': {
      fillPink(d); hpf(d, 900, sr);
      lfoAM(d, 55, 0.25, sr); norm(d, 0.52); return buf;
    }

    // ── Urban & Indoor ────────────────────────────────────────────────────────────
    case 'cafe': {
      fillPink(d); lpf(d, 3000, sr); hpf(d, 150, sr);
      lfoAM(d, 0.06, 0.18, sr); norm(d, 0.58); return buf;
    }

    case 'library': {
      fillPink(d); lpf(d, 800, sr); scl(d, 0.15); norm(d, 0.25); return buf;
    }

    case 'office': {
      fillPink(d); lpf(d, 1500, sr);
      addSine(d, 200, 0.04, sr); norm(d, 0.55); return buf;
    }

    case 'computer-fan': {
      fillBrown(d); lpf(d, 400, sr); hpf(d, 60, sr);
      addSine(d, 120, 0.08, sr); norm(d, 0.55); return buf;
    }

    case 'ac-unit': {
      fillPink(d); lpf(d, 600, sr); hpf(d, 80, sr);
      addSine(d, 180, 0.1, sr); norm(d, 0.6); return buf;
    }

    case 'ceiling-fan': {
      fillBrown(d); lpf(d, 300, sr);
      addSine(d, 60, 0.12, sr);
      lfoAM(d, 2.5, 0.12, sr); norm(d, 0.58); return buf;
    }

    case 'train-cabin': {
      fillBrown(d); lpf(d, 500, sr);
      lfoAM(d, 0.5, 0.2, sr);
      addSine(d, 80, 0.1, sr); norm(d, 0.72); return buf;
    }

    case 'airplane': {
      fillPink(d); lpf(d, 2000, sr); hpf(d, 100, sr);
      addSine(d, 220, 0.07, sr); norm(d, 0.72); return buf;
    }

    case 'subway': {
      const b = new Float32Array(d.length);
      fillBrown(d); lpf(d, 400, sr);
      fillWhite(b); hpf(b, 2000, sr);
      mixInto(d, b, 0.08);
      addSine(d, 90, 0.1, sr); norm(d, 0.75); return buf;
    }

    case 'city-traffic': {
      const b = new Float32Array(d.length);
      fillBrown(d); fillPink(b);
      mixInto(d, b, 0.4);
      lfoAM(d, 0.03, 0.25, sr); norm(d, 0.68); return buf;
    }

    case 'night-city': {
      const b = new Float32Array(d.length);
      fillBrown(d); scl(d, 0.6); fillPink(b); scl(b, 0.3);
      mixInto(d, b, 1); norm(d, 0.5); return buf;
    }

    case 'underground': {
      fillBrown(d); lpf(d, 250, sr);
      addSine(d, 55, 0.1, sr); norm(d, 0.7); return buf;
    }

    // ── Space ────────────────────────────────────────────────────────────────────
    case 'deep-space': {
      fillBrown(d); lpf(d, 60, sr); norm(d, 0.6); return buf;
    }

    case 'spacecraft': {
      fillPink(d); lpf(d, 1000, sr);
      addSine(d, 180, 0.08, sr);
      addSine(d, 360, 0.04, sr); norm(d, 0.65); return buf;
    }

    case 'reactor': {
      fillBrown(d); lpf(d, 300, sr);
      addSine(d, 60, 0.15, sr);
      addSine(d, 120, 0.08, sr);
      addSine(d, 240, 0.04, sr); norm(d, 0.72); return buf;
    }

    case 'portal': {
      fillPink(d); lpf(d, 2000, sr);
      addSine(d, 200, 0.06, sr);
      lfoAM(d, 0.5, 0.45, sr); norm(d, 0.68); return buf;
    }

    case 'nebula': {
      fillPink(d); lpf(d, 500, sr);
      lfoAM(d, 0.02, 0.6, sr); norm(d, 0.55); return buf;
    }

    case 'cosmic-wind': {
      fillPink(d); hpf(d, 200, sr); lpf(d, 3000, sr);
      lfoAM(d, 0.03, 0.7, sr, 1.5); norm(d, 0.6); return buf;
    }

    case 'black-hole': {
      fillBrown(d); lpf(d, 40, sr);
      addSine(d, 20, 0.2, sr); norm(d, 0.75); return buf;
    }

    case 'space-station': {
      fillPink(d); lpf(d, 800, sr);
      addSine(d, 200, 0.07, sr);
      addSine(d, 400, 0.04, sr);
      lfoAM(d, 0.08, 0.1, sr); norm(d, 0.62); return buf;
    }

    case 'warp-drive': {
      fillPink(d);
      // Rising/falling pitch illusion via slow LFO on pink noise
      lfoAM(d, 0.15, 0.55, sr);
      addSine(d, 440, 0.06, sr);
      addSine(d, 880, 0.03, sr); norm(d, 0.68); return buf;
    }

    case 'void': {
      fillPink(d); lpf(d, 80, sr); scl(d, 0.12); norm(d, 0.2); return buf;
    }

    // ── Tones ─────────────────────────────────────────────────────────────────────
    case 'hz174':
    case 'hz285':
    case 'hz396':
    case 'hz417':
    case 'hz432':
    case 'hz440':
    case 'hz528':
    case 'hz639':
    case 'hz741':
    case 'hz852':
    case 'hz963': {
      const freqMap: Record<string, number> = {
        'hz174': 174, 'hz285': 285, 'hz396': 396, 'hz417': 417, 'hz432': 432,
        'hz440': 440, 'hz528': 528, 'hz639': 639, 'hz741': 741, 'hz852': 852, 'hz963': 963,
      };
      const f = freqMap[id];
      addSine(d, f, 0.5, sr);
      addSine(d, f * 2, 0.15, sr);
      addSine(d, f * 3, 0.05, sr);
      // Tiny noise floor so it doesn't feel sterile
      const n = new Float32Array(d.length); fillPink(n); mixInto(d, n, 0.03);
      norm(d, 0.65); return buf;
    }

    case 'drone-40':
    case 'drone-60':
    case 'drone-80':
    case 'drone-110':
    case 'drone-220': {
      const droneMap: Record<string, number> = {
        'drone-40': 40, 'drone-60': 60, 'drone-80': 80, 'drone-110': 110, 'drone-220': 220,
      };
      const f = droneMap[id];
      addSine(d, f, 0.5, sr);
      addSine(d, f * 2, 0.2, sr);
      addSine(d, f * 3, 0.08, sr);
      addSine(d, f * 4, 0.04, sr);
      norm(d, 0.7); return buf;
    }

    case 'om-136': {
      addSine(d, 136.1, 0.45, sr);
      addSine(d, 272.2, 0.18, sr);
      addSine(d, 408.3, 0.06, sr);
      const n = new Float32Array(d.length); fillBrown(n); lpf(n, 200, sr);
      mixInto(d, n, 0.05); norm(d, 0.68); return buf;
    }

    case 'crystal-bowl': {
      // Multiple overlapping decaying sinusoids — feels like a bowl that keeps ringing
      addPeriodicBowl(d, 528, 0.4, 0.6, sr, BUF_SEC);
      addPeriodicBowl(d, 1056, 0.8, 0.2, sr, BUF_SEC);
      addPeriodicBowl(d, 1584, 1.2, 0.08, sr, BUF_SEC);
      norm(d, 0.7); return buf;
    }

    case 'bell-fade': {
      addDecaySine(d, 440, 0.5, 0.7, sr);
      addDecaySine(d, 880, 0.8, 0.3, sr);
      addDecaySine(d, 1320, 1.2, 0.1, sr);
      norm(d, 0.65); return buf;
    }

    case 'singing-bowl': {
      addPeriodicBowl(d, 432, 0.3, 0.65, sr, BUF_SEC);
      addPeriodicBowl(d, 864, 0.6, 0.22, sr, BUF_SEC);
      addPeriodicBowl(d, 648, 0.5, 0.15, sr, BUF_SEC);
      norm(d, 0.7); return buf;
    }

    // ── Binaural Beats (stereo) ──────────────────────────────────────────────────
    case 'delta':
    case 'theta':
    case 'alpha':
    case 'beta':
    case 'gamma': {
      const beatMap: Record<string, number> = {
        'delta': 2, 'theta': 6, 'alpha': 10, 'beta': 20, 'gamma': 40,
      };
      const beat = beatMap[id];
      const base = 200;
      const [bb, dL, dR] = mk2(ac);
      const n = Math.round(sr * BUF_SEC);
      for (let i = 0; i < n; i++) {
        const t = i / sr;
        dL[i] = 0.45 * Math.sin(2 * Math.PI * base * t);
        dR[i] = 0.45 * Math.sin(2 * Math.PI * (base + beat) * t);
      }
      // Add subtle pink floor
      const floor = new Float32Array(n); fillPink(floor); scl(floor, 0.04);
      for (let i = 0; i < n; i++) { dL[i] += floor[i]; dR[i] += floor[i]; }
      return bb;
    }

    // ── Textures ──────────────────────────────────────────────────────────────────
    case 'warm-pad': {
      addSine(d, 110, 0.3, sr);
      addSine(d, 220, 0.2, sr);
      addSine(d, 330, 0.1, sr);
      addSine(d, 440, 0.05, sr);
      const n = new Float32Array(d.length); fillBrown(n); lpf(n, 300, sr);
      mixInto(d, n, 0.08); norm(d, 0.7); return buf;
    }

    case 'deep-bass-tex': {
      fillBrown(d); lpf(d, 100, sr);
      addSine(d, 40, 0.2, sr);
      addSine(d, 80, 0.1, sr); norm(d, 0.78); return buf;
    }

    case 'static': {
      fillWhite(d); scl(d, 0.5); return buf;
    }

    case 'smooth': {
      fillPink(d); lpf(d, 400, sr); lpf(d, 400, sr); lpf(d, 400, sr); norm(d, 0.7); return buf;
    }

    case 'gritty': {
      fillWhite(d); hpf(d, 500, sr); lpf(d, 4000, sr); norm(d, 0.55); return buf;
    }

    case 'crystal-tex': {
      fillWhite(d); hpf(d, 4000, sr);
      addSine(d, 6000, 0.06, sr);
      addSine(d, 8000, 0.04, sr); norm(d, 0.45); return buf;
    }

    case 'murky': {
      fillBrown(d); lpf(d, 80, sr); lpf(d, 80, sr);
      addSine(d, 35, 0.15, sr); norm(d, 0.75); return buf;
    }

    case 'bright-focus': {
      fillPink(d); hpf(d, 1000, sr);
      addSine(d, 528, 0.06, sr); norm(d, 0.58); return buf;
    }

    case 'velvet': {
      fillPink(d);
      for (let i = 0; i < 4; i++) lpf(d, 700, sr);
      norm(d, 0.72); return buf;
    }

    case 'thick-fog': {
      fillWhite(d);
      for (let i = 0; i < 5; i++) lpf(d, 200, sr);
      norm(d, 0.72); return buf;
    }

    case 'midnight': {
      fillBrown(d); lpf(d, 180, sr);
      addSine(d, 55, 0.08, sr); scl(d, 0.7); norm(d, 0.6); return buf;
    }

    case 'dawn-light': {
      fillPink(d); hpf(d, 200, sr); lpf(d, 2500, sr);
      lfoAM(d, 0.03, 0.2, sr); norm(d, 0.58); return buf;
    }

    default:
      // Fallback: soft pink noise
      fillPink(d); norm(d, 0.6); return buf;
  }
}

// ── Module-level playback state ─────────────────────────────────────────────────

let _ctx:     AudioContext            | null = null;
let _gain:    GainNode                | null = null;
let _source:  AudioBufferSourceNode   | null = null;
let _current: string                  | null = null;

function getCtx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function playAmbient(id: string, volume = 0.25): void {
  stopAmbient();
  const ac = getCtx();
  if (ac.state === 'suspended') ac.resume();

  _gain = ac.createGain();
  _gain.gain.value = volume;
  _gain.connect(ac.destination);

  const buffer = generateBuffer(ac, id);

  _source = ac.createBufferSource();
  _source.buffer = buffer;
  _source.loop   = true;
  _source.connect(_gain);
  _source.start();
  _current = id;
}

export function stopAmbient(): void {
  try { _source?.stop(); _source?.disconnect(); } catch { /* already stopped */ }
  _source  = null;
  _gain?.disconnect();
  _gain    = null;
  _current = null;
}

export function setAmbientVolume(volume: number): void {
  if (_gain) _gain.gain.value = Math.max(0, Math.min(1, volume));
}

export function currentAmbient(): string | null {
  return _current;
}
