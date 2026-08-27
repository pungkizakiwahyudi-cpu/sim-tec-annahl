/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        islamic: {
          primary: '#0D3B2E',    // Dark Forest Green
          dark: '#08281E',       // Ultra Dark Green
          medium: '#1A5C42',     // Medium Emerald
          light: '#247A58',      // Light Emerald Accent
          gold: {
            DEFAULT: '#C9A84C',  // Islamic Gold Accent
            light: '#E2C775',    // Highlight Gold
            dark: '#8B7536',     // Muted Gold
            border: '#D4AF37',   // Gold Border Accent
          },
          bg: '#F8FAF9',         // Soft Cream-Gray Light BG
        },
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      fontFamily: {
        sans:   ['Plus Jakarta Sans', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      },
      backgroundImage: {
        'islamic-pattern': "radial-gradient(#C9A84C 0.75px, transparent 0.75px)",
      },
    },
  },
  plugins: [],
}