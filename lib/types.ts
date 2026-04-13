export type AppState =
  | 'idle'
  | 'requesting_permission'
  | 'calibrating'
  | 'countdown'
  | 'focused'
  | 'warning'
  | 'break'
  | 'violated'
  | 'session_complete'
  | 'camera_error';

export type AttentionLevel = 'focused' | 'away' | 'uncertain';

export interface SessionConfig {
  durationMinutes: number;
  offscreenThresholdSec: number;
  breakLimit: number;
  breakDurationSec: number;
  punishmentEnabled: boolean;
}

export interface SessionStats {
  startedAt: string;
  endedAt?: string;
  totalFocusedMs: number;
  violationCount: number;
  longestDistractionMs: number;
  breakUsed: number;
  breakTimeUsedMs: number;
}

export interface AggregateStats {
  sessions: number;
  totalFocusedMs: number;
  totalViolations: number;
  totalBreakTimeMs: number;
  longestDistractionMs: number;
}

export interface SessionHistoryItem {
  id: string;
  config: SessionConfig;
  stats: SessionStats;
}

export interface BaselinePose {
  centerX: number;
  centerY: number;
  yaw: number;
  pitch: number;
}

export interface AttentionReading {
  facePresent: boolean;
  confidence: number;
  yaw: number;
  pitch: number;
  attention: AttentionLevel;
  guidance: string[];
}

export interface CalibrationReport {
  ok: boolean;
  confidence: number;
  reason: string;
  baseline: BaselinePose | null;
}

export interface RuntimeState {
  appState: AppState;
  attention: AttentionReading | null;
  remainingMs: number;
  offscreenMs: number;
  violationActive: boolean;
}
