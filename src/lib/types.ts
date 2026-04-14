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
  punishmentMedia: string;
}

export interface SessionPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<SessionConfig>;
}

export interface SessionStats {
  startedAt: string;
  endedAt?: string;
  totalFocusedMs: number;
  violationCount: number;
  longestDistractionMs: number;
  breakUsed: number;
  breakTimeUsedMs: number;
  focusScore?: number;
}

export interface AggregateStats {
  sessions: number;
  totalFocusedMs: number;
  totalViolations: number;
  totalBreakTimeMs: number;
  longestDistractionMs: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  totalFocusScore: number;
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

// Normalized (0–1) point relative to video frame
export interface NormPoint {
  x: number;
  y: number;
}

// Full per-eye data in normalized (0–1) video-frame coordinates
export interface EyeData {
  // Bounding box
  x: number;
  y: number;
  width: number;
  height: number;
  // Iris center
  irisX: number;
  irisY: number;
  // Iris radius (normalized by frame width)
  irisRadius: number;
  // Normalized gaze direction vector (offset of iris from eye center, per eye)
  gazeX: number;
  gazeY: number;
  // Per-eye eye-aspect-ratio (0 = closed, higher = more open)
  openRatio: number;
  // Full eyelid contour for drawing
  contour: NormPoint[];
}

export interface BaselinePose {
  centerX: number;
  centerY: number;
  yaw: number;
  pitch: number;
  roll: number;
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
  roll: number;
  attention: AttentionLevel;
  guidance: string[];
  faceBox: PixelBox | null;
  eyeDirectionX: number;
  eyeDirectionY: number;
  eyeOpenRatio: number;
  leftEye: EyeData | null;
  rightEye: EyeData | null;
  lightingCondition: 'dark' | 'backlit' | 'normal';
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
