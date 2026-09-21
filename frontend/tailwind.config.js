/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        surface: {
          DEFAULT: '#ffffff',
          hover: '#f7f7f7',
          active: '#f3f3f3',
          subtle: '#fafafa',
        },
        border: {
          DEFAULT: '#e5e5e5',
          strong: '#d4d4d4',
          subtle: '#ebebeb',
        },
        ink: {
          primary: '#111111',
          secondary: '#666666',
          muted: '#8a8a8a',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          neutral: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'dropdown': '0 4px 16px -2px rgba(0, 0, 0, 0.08)',
        'modal': '0 12px 32px -4px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
