/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
        },
        gradient: {
          purple: '#6b21a8',
          orange: '#f97316',
          yellow: '#fbbf24',
          pink: '#ec4899',
        }
      },
      backgroundImage: {
        'gradient-vibrant': 'linear-gradient(135deg, #6b21a8 0%, #9333ea 25%, #f97316 50%, #fbbf24 75%, #ec4899 100%)',
        'gradient-primary': 'linear-gradient(135deg, #6b21a8 0%, #9333ea 50%, #f97316 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #ec4899 100%)',
        'gradient-soft': 'linear-gradient(135deg, #9333ea 0%, #f97316 50%, #ec4899 100%)',
      }
    },
  },
  plugins: [],
}