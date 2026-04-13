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
  if (!attention || attention.attention === 'uncertain') return 'warning';
  if (attention.attention === 'warning') return 'warning';
  if (attention.attention === 'offscreen' && offscreenMs >= thresholdMs * 0.5) return 'warning';
  return 'focused';
};
