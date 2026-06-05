/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#172033',
          950: '#0a0f1e',
        },
      },
    },
  },
  plugins: [],
};
