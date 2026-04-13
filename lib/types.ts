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

export type AttentionLevel = 'focused' | 'warning' | 'offscreen' | 'uncertain';

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

export interface PixelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BaselinePose {
  centerX: number;
  centerY: number;
  yaw: number;
  pitch: number;
  eyeCenterX: number;
  eyeCenterY: number;
  eyeOpenRatio: number;
  faceBox: PixelBox;
}

export interface AttentionReading {
  facePresent: boolean;
  confidence: number;
  yaw: number;
  pitch: number;
  attention: AttentionLevel;
  guidance: string[];
  faceBox: PixelBox | null;
  eyeDirectionX: number;
  eyeDirectionY: number;
  eyeOpenRatio: number;
}

export interface CalibrationReport {
  ok: boolean;
  confidence: number;
  reason: string;
  baseline: BaselinePose | null;
  sampleCount: number;
  detectionRate: number;
}

export interface RuntimeState {
  appState: AppState;
  attention: AttentionReading | null;
  remainingMs: number;
  offscreenMs: number;
  violationActive: boolean;
}
