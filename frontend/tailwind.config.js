/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F7F2',
        charcoal: {
          DEFAULT: '#242424',
          50: '#F2F2F2',
          100: '#E6E6E6',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#404040',
          600: '#242424',
          700: '#1D1D1D',
          800: '#151515',
          900: '#0E0E0E'
        },
        lime: {
          DEFAULT: '#C5F36A',
          hover: '#B5E655',
          light: '#EAF9CE',
          dark: '#93C42D'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          muted: '#F0F0EB',
          subtle: '#FAFAFA'
        },
        border: {
          DEFAULT: '#E5E5DF',
          hover: '#D1D1CB'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        'card': '0 2px 8px -2px rgba(36,36,36,0.06), 0 1px 4px -1px rgba(36,36,36,0.04)',
        'card-hover': '0 8px 24px -4px rgba(36,36,36,0.08), 0 2px 6px -1px rgba(36,36,36,0.04)',
        'accent': '0 4px 14px 0 rgba(197, 243, 106, 0.39)',
      }
    },
  },
  plugins: [],
}
