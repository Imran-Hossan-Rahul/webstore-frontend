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
        ink: {
          DEFAULT: 'var(--ink)',
          hover: 'var(--ink-hover)',
          active: 'var(--ink-active)',
          foreground: 'var(--on-ink)',
        },
        'on-ink': 'var(--on-ink)',
        link: 'var(--link)',
        body: 'var(--body)',
        muted: 'var(--muted)',
        'surface-soft': 'var(--surface-soft)',
        'border-soft': 'var(--border-soft)',
        'focus-ring': 'var(--focus-ring)',
        signal: 'var(--signal)',
        dark: {
          bg: '#0E1115',
          surface: '#171B21',
          text: '#FFFFFF',
          border: 'rgba(255, 255, 255, 0.15)',
        },
        brand: {
          /* New Semantic Tokens */
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          dark: 'var(--bg-dark-section)',
          interaction: 'var(--ink)',
          accent: 'var(--muted)',
          cta: 'var(--ink)',
          success: 'var(--signal)',
          text: 'var(--ink)',
          muted: 'var(--muted)',
          
          navy: 'var(--ink)', // Maps to #111418
          blue: 'var(--ink)', // Primary action maps to #111418
          cyan: 'var(--muted)', // Tech accent maps to #6A727C
          amber: 'var(--ink)', // Commercial CTA maps to #111418
          teal: 'var(--signal)', // Functional signal #0E7C86
          sky: 'var(--surface-soft)', // Surface soft tint #E6E9ED
          cloud: '#F7F9FB', // Pearl white background
          slate: 'var(--body)', // Body text #3B424A
          // Keep these for backwards compatibility with existing components
          primary: 'var(--ink)',
          secondary: 'var(--link)',
          
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
