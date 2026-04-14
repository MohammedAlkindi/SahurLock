// Allow CSS side-effect imports (e.g. import './globals.css' in layout.tsx)
declare module '*.css';

// ── Spotify Web Playback SDK ──────────────────────────────────────────────────

declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface Album {
    uri: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  }

  interface Artist {
    uri: string;
    name: string;
  }

  interface Track {
    uri: string;
    id: string | null;
    type: 'track' | 'episode' | 'ad';
    name: string;
    duration_ms: number;
    artists: Artist[];
    album: Album;
    is_playable: boolean;
  }

  interface PlaybackContext {
    uri: string | null;
    metadata: Record<string, string> | null;
  }

  interface PlaybackDisallows {
    pausing?: boolean;
    peeking_next?: boolean;
    peeking_prev?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
  }

  interface TrackWindow {
    current_track: Track;
    previous_tracks: Track[];
    next_tracks: Track[];
  }

  interface PlaybackState {
    context: PlaybackContext;
    disallows: PlaybackDisallows;
    paused: boolean;
    position: number;
    repeat_mode: 0 | 1 | 2;
    shuffle: boolean;
    track_window: TrackWindow;
  }

  interface WebPlaybackInstance {
    device_id: string;
  }

  interface WebPlaybackError {
    message: string;
  }

  type ErrorTypes =
    | 'initialization_error'
    | 'authentication_error'
    | 'account_error'
    | 'playback_error';

  class Player {
    constructor(options: PlayerInit);
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'ready',                 cb: (instance: WebPlaybackInstance) => void): void;
    addListener(event: 'not_ready',             cb: (instance: WebPlaybackInstance) => void): void;
    addListener(event: 'player_state_changed',  cb: (state: PlaybackState | null) => void): void;
    addListener(event: ErrorTypes,              cb: (err: WebPlaybackError) => void): void;
    removeListener(event: string,               cb?: (...args: unknown[]) => void): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }
}

interface Window {
  Spotify: typeof Spotify;
  onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
}
