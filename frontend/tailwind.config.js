/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#e6531f',
        secondary: '#f28c34',
        accent: '#7a2b12',
        soft: '#fdf6f2',
      },
    },
  },
  plugins: [],
};
