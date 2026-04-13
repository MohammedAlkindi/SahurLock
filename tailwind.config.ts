import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sahur: {
          bg: '#09090b',
          card: '#111827',
          accent: '#22c55e',
          warn: '#f59e0b',
          danger: '#ef4444'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
