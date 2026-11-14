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
        themis: {
          green: '#10B981',
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
          dark: '#1E293B',
        }
      }
    },
  },
  plugins: [],
}

