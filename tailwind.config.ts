import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F3',
        ink: '#0F1A2E',
        saffron: '#FF6B35',
        tenant: '#0E7C66',
        landlord: '#B85C00',
        mute: '#6B6358',
        line: '#E8E2D5'
      },
      fontFamily: {
        display: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace']
      },
      fontSize: {
        hero: ['56px', { lineHeight: '1.05', letterSpacing: '-0.02em' }]
      },
      maxWidth: { prose: '38rem', content: '52rem' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'none' } },
        pulseSaffron: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,53,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,107,53,0)' } }
      },
      animation: {
        fadeIn: 'fadeIn 280ms ease-out both',
        pulseSaffron: 'pulseSaffron 1.2s ease-out 2'
      }
    }
  },
  plugins: []
};
export default config;
