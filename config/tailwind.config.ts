import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}', './src/lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        ring: 'var(--ring)',
        sahur: {
          bg: '#09090b',
          card: '#111827',
          accent: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        'violation-pulse': 'violation-pulse 1.2s ease-in-out infinite',
        'violation-shake': 'violation-shake 0.5s ease-in-out',
        'border-glow': 'border-glow 1.5s ease-in-out infinite',
        'scan': 'scan-line 3s linear infinite',
        'score-pop': 'score-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }
    }
  },
  plugins: []
} satisfies Config;
