/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tweak in M6 (tag-style) and M8 (due-tint)
        feature: '#10B981', // emerald
        bug: '#DC2626',     // crimson
        brandPrimary: '#3E3C6B', // dark blue
        brandAccent: '#4F4C8A', // slight less dark blue
        surfacePage: '#000000', // black
        surfaceCard: '#2B2B2B', // dark gray
        textPrimary: '#FFFFFF', // white
        textMuted: '#999696', // gray
        dueSafe: '#2B2B2B', // dark blue
        dueWarning: '#C9900E', // amber
        overdue: '#A6170A', // red
        done: '#0AA1A6' // turquoise


      },
    },
  },
  plugins: [],
};
