import { AppState, AttentionReading } from '@/lib/types';

interface TransitionInput {
  attention: AttentionReading | null;
  offscreenMs: number;
  thresholdMs: number;
  onBreak: boolean;
  violationActive: boolean;
}

export const getDerivedState = ({
  attention,
  offscreenMs,
  thresholdMs,
  onBreak,
  violationActive
}: TransitionInput): AppState => {
  if (onBreak) return 'break';
  if (violationActive) return 'violated';
  if (!attention) return 'focused';

  if (attention.attention === 'uncertain') return 'warning';
  if (offscreenMs >= thresholdMs * 0.5 && (attention.attention === 'away' || !attention.facePresent)) return 'warning';
  return 'focused';
};
