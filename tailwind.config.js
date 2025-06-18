/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25D366',
        secondary: '#128C7E',
        accent: '#34B7F1',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        background: '#F0F2F5',
        success: '#00C851',
        warning: '#FFB300',
        error: '#FF4444',
        info: '#33B5E5'
      },
      fontFamily: { 
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], 
        heading: ['Inter', 'ui-sans-serif', 'system-ui'] 
      }
    },
  },
  plugins: [],
}