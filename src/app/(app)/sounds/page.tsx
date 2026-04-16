'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Volume2, VolumeX, Square, Headphones } from 'lucide-react';
import { SpotifyPanel } from '@/components/spotify-panel';
import {
  SOUNDS,
  SoundDef,
  playAmbient,
  stopAmbient,
  setAmbientVolume,
  currentAmbient,
} from '@/lib/ambient-sound';

// Ordered list of categories for the filter bar
const CATEGORIES = [
  'All',
  'Noise',
  'Rain & Water',
  'Wind & Weather',
  'Nature',
  'Urban & Indoor',
  'Space',
  'Tones',
  'Binaural',
  'Textures',
];

export default function SoundsPage() {
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [volume, setVolumeState]      = useState(0.25);
  const [category, setCategory]       = useState('All');
  const [query, setQuery]             = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  // Sync with any sound that was already playing (e.g. started from another page)
  useEffect(() => {
    setActiveId(currentAmbient());
  }, []);

  const filtered = useMemo<SoundDef[]>(() => {
    let list = SOUNDS;
    if (category !== 'All') list = list.filter((s) => s.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((s) =>
        s.label.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [category, query]);

  const toggle = (id: string) => {
    if (activeId === id) {
      stopAmbient();
      setActiveId(null);
    } else {
      playAmbient(id, volume);
      setActiveId(id);
    }
  };

  const handleVolume = (v: number) => {
    setVolumeState(v);
    setAmbientVolume(v);
  };

  const stop = () => {
    stopAmbient();
    setActiveId(null);
  };

  const activeSound = SOUNDS.find((s) => s.id === activeId) ?? null;

  // Scroll active category pill into view
  useEffect(() => {
    if (!filterRef.current) return;
    const active = filterRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [category]);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Now playing bar ──────────────────────────────────────────────────── */}
      {activeSound && (
        <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-sm px-5 py-3 flex items-center gap-4">
          <span className="text-lg">{activeSound.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{activeSound.label}</p>
            <p className="text-[11px] text-muted-foreground">{activeSound.category}</p>
          </div>
          {activeSound.headphones && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-amber-400">
              <Headphones size={11} /> headphones
            </span>
          )}
          <div className="flex items-center gap-2">
            <VolumeX size={13} className="text-zinc-600 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-24 h-1 cursor-pointer accent-green-500"
            />
            <Volume2 size={13} className="text-zinc-500 shrink-0" />
          </div>
          <button
            onClick={stop}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-red-800 hover:text-red-400 transition"
          >
            <Square size={10} className="fill-current" />
            Stop
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-5 py-8 flex-1">
        {/* ── Page header ────────────────────────────────────────────────────── */}
        <div className="mb-7">
          <h1 className="text-2xl font-black tracking-tight">Sounds</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {SOUNDS.length} ambient sounds — all generated in your browser, no files
          </p>
        </div>

        {/* ── Search + category filter ────────────────────────────────────────── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sounds…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-56 rounded-lg border border-zinc-700 bg-zinc-800/60 pl-8 pr-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
          </div>

          {/* Category pills — horizontal scroll */}
          <div
            ref={filterRef}
            className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                data-active={category === cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                  category === cat
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sound grid ─────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-600">No sounds match your search.</p>
        ) : (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((sound) => {
              const isActive = activeId === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => toggle(sound.id)}
                  className={`relative flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                    isActive
                      ? 'border-green-600 bg-green-600/10 ring-1 ring-green-600/30'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/50'
                  }`}
                >
                  <span className="text-xl leading-none">{sound.emoji}</span>
                  <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-green-300' : 'text-zinc-200'}`}>
                    {sound.label}
                  </span>
                  {sound.headphones && (
                    <Headphones size={9} className="text-amber-500 shrink-0" />
                  )}
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_4px_1px_#22c55e]" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Music section (Spotify) ─────────────────────────────────────────── */}
        <div className="mt-12">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight">Music</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Stream music via Spotify while you work</p>
          </div>
          <div className="max-w-sm">
            <SpotifyPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
