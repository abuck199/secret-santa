/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#9b8578',
          dark: '#6b5d52',
        },
        cream: '#F5EBE0',
        beige: {
          light: '#EDEDE9',
          DEFAULT: '#E3D5CA',
          dark: '#D5BDAF',
        },
      },
    },
  },
  plugins: [],
}