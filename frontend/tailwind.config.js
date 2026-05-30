/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 18px 45px rgba(31, 41, 55, 0.12)',
      },
      colors: {
        grape: '#7C3AED',
        ocean: '#0891B2',
        mango: '#F59E0B',
        grass: '#22C55E',
        bubble: '#FDF2F8',
      },
    },
  },
  plugins: [],
};
