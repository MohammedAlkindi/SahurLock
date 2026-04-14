'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SpotifyService } from '@/lib/spotify';

type Status = 'loading' | 'success' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:          'You cancelled the Spotify login.',
  state_mismatch:         'Security check failed. Please try connecting again.',
  token_exchange_failed:  'Could not connect to Spotify. Please try again.',
  server_misconfigured:   'Spotify is not configured on this server.',
  unknown:                'Something went wrong. Please try again.',
};

export default function SpotifyCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [status,      setStatus]      = useState<Status>('loading');
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [countdown,   setCountdown]   = useState(3);

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      setErrorMsg(ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.unknown);
      setStatus('error');
      return;
    }

    // Parse tokens from hash fragment and hand off to the service
    const service = SpotifyService.getInstance();
    const saved   = service.handleHashCallback();

    if (!saved) {
      setErrorMsg(ERROR_MESSAGES.unknown);
      setStatus('error');
      return;
    }

    // Fetch profile to confirm connection and get display name
    service.getProfile()
      .then((profile) => {
        setDisplayName(profile.display_name);
        setStatus('success');
      })
      .catch(() => {
        // Tokens saved but profile fetch failed — still a success
        setStatus('success');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect countdown after success
  useEffect(() => {
    if (status !== 'success') return;
    if (countdown <= 0) { router.replace('/session'); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  return (
    <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Spotify wordmark */}
        <div className="mb-8 flex items-center justify-center gap-2.5 text-[#1DB954]">
          <svg viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="text-xl font-black tracking-tight">Spotify</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl">

          {/* ── Loading ── */}
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-zinc-700 border-t-[#1DB954] animate-spin" />
              <p className="text-sm font-medium text-zinc-300">Connecting…</p>
            </div>
          )}

          {/* ── Success ── */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1DB954]/15 ring-1 ring-[#1DB954]/30">
                <svg viewBox="0 0 24 24" width={28} height={28} fill="#1DB954">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>

              <div>
                <p className="text-base font-bold text-white">
                  {displayName ? displayName : 'Connected'}
                </p>
                <p className="mt-1 text-sm text-zinc-400">Spotify is ready.</p>
              </div>

              <div className="w-full rounded-lg border border-zinc-800 bg-zinc-800/40 px-4 py-2.5 text-xs text-zinc-500">
                Redirecting to session in{' '}
                <span className="font-semibold text-zinc-300">{countdown}s</span>…
              </div>

              <Link
                href="/session"
                className="w-full rounded-lg bg-[#1DB954] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#1ed760] active:scale-[0.98]"
              >
                Go to session now
              </Link>
            </div>
          )}

          {/* ── Error ── */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
                <svg viewBox="0 0 24 24" width={28} height={28} fill="#f87171">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </div>

              <div>
                <p className="text-base font-bold text-white">Connection failed</p>
                <p className="mt-1 text-sm text-zinc-400">{errorMsg}</p>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Link
                  href="/api/spotify/login"
                  className="w-full rounded-lg bg-[#1DB954] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#1ed760] active:scale-[0.98]"
                >
                  Try again
                </Link>
                <Link
                  href="/session"
                  className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                >
                  Back to session
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
