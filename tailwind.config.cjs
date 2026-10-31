/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F7', 100: '#FFE3EA', 200: '#FFC7D5', 300: '#FF9DB5', 400: '#F47596',
          500: '#E8577D', 600: '#D13D66', 700: '#AE2C52', 800: '#8C2444', 900: '#6E1D37',
        },
      },
      fontFamily: { sans: ['Nunito', 'Cairo', 'system-ui', 'sans-serif'], ar: ['Cairo', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
