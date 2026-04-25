/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50:  '#f5f6f7',
          100: '#e6e8eb',
          200: '#c8ccd2',
          300: '#9ea5af',
          400: '#6e7684',
          500: '#4b5261',
          600: '#363c48',
          700: '#252a34',
          800: '#171b22',
          900: '#0c0f15',
        },
        brand: {
          50:  '#eefbf4',
          100: '#d5f5e3',
          200: '#aaeac8',
          300: '#72d9a5',
          400: '#3ec181',
          500: '#1ea468',
          600: '#148454',
          700: '#106a45',
          800: '#0e5339',
          900: '#0b4330',
        },
        accent: {
          amber:  '#f5a524',
          rose:   '#f31260',
          sky:    '#0ea5e9',
          violet: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft:   '0 1px 2px rgba(12,15,21,0.04), 0 4px 12px rgba(12,15,21,0.06)',
        card:   '0 2px 4px rgba(12,15,21,0.06), 0 8px 24px rgba(12,15,21,0.08)',
        pop:    '0 10px 30px -10px rgba(30,164,104,0.35)',
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up':    'fade-up 250ms ease-out both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
