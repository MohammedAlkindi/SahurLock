'use client';

export function ViolationOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-30 grid place-items-center bg-red-700/90">
      <div className="text-center text-white">
        <p className="text-6xl font-black tracking-widest">LOCK IN</p>
        <p className="mt-3 text-lg">Eyes on the screen. Return focus for 2 seconds.</p>
      </div>
    </div>
  );
}
