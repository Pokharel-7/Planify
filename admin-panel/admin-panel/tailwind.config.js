/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        slate: {
          925: '#0b1220',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          300: '#8fb4ff',
          500: '#135bec',
          600: '#0d47a1',
          700: '#0a3a85',
        },
        clay: '#e8623d',
        mist: '#f6f7fb',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
};
