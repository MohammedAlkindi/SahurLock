'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  CheckSquare,
  BarChart2,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/session', icon: Timer,       label: 'Session' },
  { href: '/tasks',   icon: CheckSquare, label: 'Tasks'   },
  { href: '/stats',   icon: BarChart2,   label: 'Stats'   },
];

const COLLAPSED_KEY = 'sahurlock.sidebar.collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored !== null) setCollapsed(stored === 'true');
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-card transition-all duration-200',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center border-b border-border py-4',
        collapsed ? 'justify-center px-0' : 'gap-2 px-4'
      )}>
        <Link href="/" className="flex items-center gap-1.5 font-black tracking-tight hover:text-accent transition-colors">
          <Zap size={18} className="text-accent shrink-0" />
          {!collapsed && <span>SahurLock</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                collapsed && 'justify-center',
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            collapsed && 'justify-center'
          )}
        >
          {collapsed
            ? <PanelLeftOpen size={17} className="shrink-0" />
            : <><PanelLeftClose size={17} className="shrink-0" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
