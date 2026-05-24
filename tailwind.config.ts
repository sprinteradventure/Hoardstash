/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm Yarn-Inspired Palette
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F5F0E8',
        },
        sand: '#EDE6D8',
        beige: '#E8DDD0',
        taupe: '#C4B5A5',
        'warm-gray': '#A89888',
        brown: {
          DEFAULT: '#6B5D4D',
          dark: '#4A4035',
        },
        gold: {
          DEFAULT: '#C4A77D',
          dark: '#B5986E',
        },
        // Legacy purple for backward compatibility
        primary: {
          DEFAULT: '#C4A77D',
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#EDE6D8',
          300: '#E8DDD0',
          400: '#C4B5A5',
          500: '#C4A77D',
          600: '#B5986E',
          700: '#6B5D4D',
          800: '#4A4035',
          900: '#3A3025',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
