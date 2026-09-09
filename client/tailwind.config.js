/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trendyol: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f27a1a',
          600: '#ea580c',
          700: '#c2410c',
        },
        hepsiburada: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#ff6000',
          600: '#e04f00',
          700: '#b83b00',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}
