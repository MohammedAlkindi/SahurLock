import { clamp } from '@/lib/utils';
import type { SessionConfig, SessionStats } from '@/lib/types';

export interface ScoreBreakdown {
  /** Time actively focused as a 0–50 point component */
  focusRatio: number;
  /** Violation self-control as a 0–25 point component (fewer = higher) */
  control: number;
  /** Speed of returning to focus after each violation, 0–15 */
  recoverySpeed: number;
  /** Smoothness — how infrequently attention drifted into warning, 0–10 */
  stability: number;
  /** Final clamped 0–100 score */
  total: number;
}

/**
 * Compute a richer 4-component focus score.
 *
 * Falls back gracefully for sessions that pre-date the new tracking fields
 * (recoveryTimes / focusTransitions) so old history keeps rendering correctly.
 *
 * Component weights (sum = 100):
 *   focusRatio      50 pts  — core metric: how much time was spent focused
 *   control         25 pts  — violation discipline (0 = 25, 10+ = 0)
 *   recoverySpeed   15 pts  — how fast the user re-focused after each lapse
 *   stability       10 pts  — how rarely attention drifted to "warning"
 */
export function computeDetailedScore(
  stats: SessionStats,
  config: SessionConfig,
): ScoreBreakdown {
  const totalMs = config.durationMinutes * 60_000;
  if (totalMs <= 0) {
    return { focusRatio: 0, control: 0, recoverySpeed: 0, stability: 0, total: 0 };
  }

  // ── 1. Focus ratio (0–50) ─────────────────────────────────────────────────
  const focusRatio = clamp((stats.totalFocusedMs / totalMs) * 50, 0, 50);

  // ── 2. Control (0–25) ─────────────────────────────────────────────────────
  // 0 violations → 25 pts; 10+ → 0 pts; linear in between
  const control = clamp((1 - stats.violationCount / 10) * 25, 0, 25);

  // ── 3. Recovery speed (0–15) ──────────────────────────────────────────────
  // No violations ⟹ perfect recovery score (15).
  // With violations, average recovery time drives score.
  // 0 ms avg → 15 pts; 10 000 ms avg → 0 pts.
  let recoverySpeed = 15;
  if (stats.violationCount > 0) {
    const times = stats.recoveryTimes ?? [];
    const avgMs = times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      // Legacy sessions: estimate from longest distraction (conservative)
      : Math.min((stats.longestDistractionMs ?? 0) * 0.5, 8_000);
    recoverySpeed = clamp((1 - avgMs / 10_000) * 15, 0, 15);
  }

  // ── 4. Stability (0–10) ───────────────────────────────────────────────────
  // Each "warning" entry counts as a focus transition.
  // 0 transitions → 10 pts; 20+ → 0 pts; linear.
  const transitions = stats.focusTransitions ?? 0;
  const stability   = clamp((1 - transitions / 20) * 10, 0, 10);

  const total = Math.round(clamp(focusRatio + control + recoverySpeed + stability, 0, 100));

  return {
    focusRatio:    round1(focusRatio),
    control:       round1(control),
    recoverySpeed: round1(recoverySpeed),
    stability:     round1(stability),
    total,
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
