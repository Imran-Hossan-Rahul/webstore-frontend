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
          bg: '#000000',
          surface: '#0A0A0A',
          text: '#FFFFFF',
          border: '#262626',
        },
        brand: {
          primary: '#4F46E5', // Professional Indigo
          secondary: '#6366F1',
          surface: '#F8FAFC',
          dark: '#0F172A',
          "glass": 'rgba(255, 255, 255, 0.02)',
        }
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'liberation mono', 'courier new', 'monospace'],
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '8px', 
        '2xl': '8px',
        '3xl': '8px',
        'full': '9999px',
      },
      keyframes: {
        jelly: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '25%': { transform: 'scale(0.9, 1.1)' },
          '50%': { transform: 'scale(1.1, 0.9)' },
          '75%': { transform: 'scale(0.95, 1.05)' },
        },
        bounceRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.95)' },
        }
      },
      animation: {
        'jelly': 'jelly 0.5s ease-in-out',
        'bounce-right': 'bounceRight 0.5s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
