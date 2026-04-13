export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const formatTime = (ms: number) => {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
