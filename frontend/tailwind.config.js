/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3a7bd5',
        secondary: '#00d2ff',
        accent: '#2f4858',
        soft: '#f5f8fb',
      },
    },
  },
  plugins: [],
};
