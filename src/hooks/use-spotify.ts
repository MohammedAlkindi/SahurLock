'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SpotifyPlaybackState,
  SpotifyProfile,
  SpotifySearchResults,
  SpotifyService,
} from '@/lib/spotify';

export interface UseSpotifyReturn {
  // State
  connected: boolean;
  playerReady: boolean;
  profile: SpotifyProfile | null;
  playbackState: SpotifyPlaybackState | null;
  searchResults: SpotifySearchResults | null;
  error: string | null;
  isSearching: boolean;
  volume: number;

  // Actions
  login: () => void;
  logout: () => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  play: (options?: { context_uri?: string; uris?: string[] }) => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (percent: number) => Promise<void>;
  transferToPlayer: () => Promise<void>;
  clearError: () => void;
}

export function useSpotify(): UseSpotifyReturn {
  const service = SpotifyService.getInstance();

  const [connected,      setConnected]      = useState(service.isConnected);
  const [playerReady,    setPlayerReady]    = useState(service.playerReady);
  const [profile,        setProfile]        = useState<SpotifyProfile | null>(null);
  const [playbackState,  setPlaybackState]  = useState<SpotifyPlaybackState | null>(null);
  const [searchResults,  setSearchResults]  = useState<SpotifySearchResults | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [isSearching,    setIsSearching]    = useState(false);
  const [volume,         setVolumeState]    = useState(70);

  const playerInitRef = useRef(false);
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Subscribe to service events ───────────────────────────────────────────

  useEffect(() => {
    const unsub = service.subscribe((event) => {
      switch (event.type) {
        case 'auth_changed':
          setConnected(event.connected);
          if (!event.connected) {
            setProfile(null);
            setPlaybackState(null);
            setPlayerReady(false);
          }
          break;
        case 'device_ready':
          setPlayerReady(true);
          break;
        case 'device_lost':
          setPlayerReady(false);
          break;
        case 'state_changed':
          setPlaybackState(event.state);
          break;
        case 'error':
          setError(event.message);
          break;
      }
    });
    return unsub;
  }, [service]);

  // ── Consume OAuth callback on mount ───────────────────────────────────────

  useEffect(() => {
    // Check for error from callback redirect
    const cbError = service.consumeCallbackError();
    if (cbError) {
      setError(
        cbError === 'access_denied'
          ? 'Spotify login was cancelled.'
          : cbError === 'state_mismatch'
          ? 'Login failed: security check failed. Please try again.'
          : 'Spotify login failed. Please try again.'
      );
    }

    // Parse tokens from hash fragment if present
    const gotTokens = service.handleHashCallback();
    if (gotTokens) setConnected(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Init player + fetch profile when connected ────────────────────────────

  useEffect(() => {
    if (!connected) return;

    // Fetch profile
    service.getProfile()
      .then(setProfile)
      .catch((err: Error) => setError(err.message));

    // Init Playback SDK (only once per mount)
    if (!playerInitRef.current) {
      playerInitRef.current = true;
      service.initPlayer().catch((err: Error) => setError(err.message));
    }
  }, [connected, service]);

  // ── Poll playback state every 5s when player is not handling SDK events ───

  useEffect(() => {
    if (!connected) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    // The SDK fires state changes automatically, but poll as a fallback
    // (e.g. when playback was started from another device)
    pollRef.current = setInterval(() => {
      service.getPlaybackState()
        .then((state) => { if (state) setPlaybackState(state); })
        .catch(() => { /* silent */ });
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connected, service]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(() => service.login(), [service]);
  const logout = useCallback(() => {
    playerInitRef.current = false;
    service.logout();
  }, [service]);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await service.search(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [service]);

  const clearSearch = useCallback(() => setSearchResults(null), []);

  const play = useCallback(async (options?: { context_uri?: string; uris?: string[] }) => {
    try {
      await service.play(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playback failed');
    }
  }, [service]);

  const pause = useCallback(async () => {
    try {
      await service.pause();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pause failed');
    }
  }, [service]);

  const next = useCallback(async () => {
    try {
      await service.next();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Skip failed');
    }
  }, [service]);

  const previous = useCallback(async () => {
    try {
      await service.previous();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Previous failed');
    }
  }, [service]);

  const setVolume = useCallback(async (percent: number) => {
    setVolumeState(percent);
    try {
      await service.setVolume(percent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Volume change failed');
    }
  }, [service]);

  const transferToPlayer = useCallback(async () => {
    try {
      await service.transferToPlayer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    }
  }, [service]);

  const clearError = useCallback(() => setError(null), []);

  return {
    connected,
    playerReady,
    profile,
    playbackState,
    searchResults,
    error,
    isSearching,
    volume,
    login,
    logout,
    search,
    clearSearch,
    play,
    pause,
    next,
    previous,
    setVolume,
    transferToPlayer,
    clearError,
  };
}
