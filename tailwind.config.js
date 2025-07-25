/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        secondary: '#FF5722',
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
        'text-secondary': '#b0b0b0',
        success: '#4CAF50',
        error: '#f44336',
      },
      animation: {
        pulse: 'pulse 1s infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}