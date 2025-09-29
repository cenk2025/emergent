/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'DM Serif Display', 'Playfair Display', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Core colors
        primary: {
          DEFAULT: '#0E7C66',
          foreground: '#FFFFFF',
          hover: '#0B5F4F',
        },
        mint: {
          DEFAULT: '#DFF2EA',
          foreground: '#161616',
          dark: '#16302A',
        },
        secondary: {
          DEFAULT: '#D2B48C',
          foreground: '#161616',
          hover: '#C4A67A',
        },
        accent: {
          DEFAULT: '#F6C5C3',
          foreground: '#161616',
        },
        // Base colors
        background: '#FFFFFF',
        foreground: '#161616',
        muted: {
          DEFAULT: '#F7F7F7',
          foreground: '#5A5A5A',
        },
        // Card colors
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#161616',
          muted: '#DFF2EA',
        },
        // UI colors
        border: '#D8D8D8',
        input: '#FFFFFF',
        ring: '#12A389',
        // Status colors
        success: {
          DEFAULT: '#1DBF73',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#FFB020',
          foreground: '#161616',
        },
        destructive: {
          DEFAULT: '#E5484D',
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#E5484D',
          foreground: '#FFFFFF',
          background: '#FDECEC',
        },
        // Badge colors
        badge: {
          DEFAULT: '#EAF7F2',
          foreground: '#0E7C66',
        },
        // Neutral scale
        neutral: {
          100: '#F7F7F7',
          200: '#EAEAEA', 
          300: '#D8D8D8',
          400: '#A8A8A8',
          500: '#5A5A5A',
          600: '#404040',
          700: '#2A2A2A',
          800: '#161616',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(14, 124, 102, 0.05)',
        DEFAULT: '0 4px 6px rgba(14, 124, 102, 0.07)',
        md: '0 4px 6px rgba(14, 124, 102, 0.07)',
        lg: '0 10px 15px rgba(14, 124, 102, 0.1)',
        xl: '0 20px 25px rgba(14, 124, 102, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-infinite': 'slideInfinite 30s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        slideInfinite: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(-50%)',
          },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}