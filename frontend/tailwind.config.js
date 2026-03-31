/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          green: '#25D366',
          'dark-green': '#1ebe5d',
          light: '#ECE5DD',
        },
      },
    },
  },
  plugins: [],
}
