/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // app folder er sob file
    "./components/**/*.{js,ts,jsx,tsx}", // components folder er sob file
    "./constants/**/*.{js,ts,jsx,tsx}", // constants folder (IMPORTANT for cardShapes)
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          text: '#ededed',
        },
      },
    },
  },
  plugins: [],
};
