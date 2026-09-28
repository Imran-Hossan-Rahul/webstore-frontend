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
          /* New Semantic Tokens */
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          dark: 'var(--bg-dark-section)',
          interaction: 'var(--bg-primary-interaction)',
          accent: 'var(--bg-tech-accent)',
          cta: 'var(--bg-important-cta)',
          success: 'var(--bg-success)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          
          navy: '#0B2545', // Midnight Navy (Primary)
          blue: '#1D5FD1', // Trust Blue (Primary Action)
          cyan: '#22C7E8', // Circuit Cyan (Tech Accent)
          amber: '#F5A623', // Signal Amber (Commercial CTA)
          teal: '#0B7A68', // Verified Teal (Success)
          sky: '#DCE9FB', // Sky Tint (Soft surface)
          cloud: '#F4F7FB', // Cloud (Background)
          slate: '#34435A', // Slate (Body text)
          // Keep these for backwards compatibility with existing components
          primary: '#0B2545',
          secondary: '#1D5FD1',
          
          
          "glass": 'rgba(255, 255, 255, 0.02)',
        },
        apple: {
          ink: 'var(--apple-ink)',
          secondary: 'var(--apple-text-secondary)',
          muted: 'var(--apple-text-muted)',
          canvas: 'var(--apple-canvas)',
          parchment: 'var(--apple-parchment)',
          surfaceDark: 'var(--apple-surface-dark)',
          hairline: 'var(--apple-hairline)',
          accent: 'var(--apple-accent)',
          accentDark: 'var(--apple-accent-ondark)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-ibm-plex-sans)', '"IBM Plex Sans"', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', '"IBM Plex Mono"', 'monospace'],
        bengali: ['var(--font-noto-sans-bengali)', '"Noto Sans Bengali"', 'sans-serif'],
        text: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
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
        'apple-sm': '8px',
        'apple-md': '11px',
        'apple-lg': '18px',
        'apple-pill': '980px',
      },
      boxShadow: {
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
        none: 'none',
        product: '3px 5px 30px rgba(0,0,0,0.22)',
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
