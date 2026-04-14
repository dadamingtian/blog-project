/** @type {import("tailwindcss").Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f766e',
          light: '#14b8a6',
          dark: '#115e59'
        }
      }
    }
  },
  plugins: []
};
