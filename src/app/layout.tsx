import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SahurLock — Browser-based attention tracking',
  description:
    'Real-time eye gaze tracking via MediaPipe. Configurable grace period, punishment clips on violation. 100% local, no cloud.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-black tracking-tight hover:text-green-400 transition-colors"
            >
              <span className="text-green-400">S</span>ahurLock
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/session"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Session
              </Link>
              <Link
                href="/stats"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/session"
                className="ml-2 rounded-lg bg-green-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
              >
                New Session
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
