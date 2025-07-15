/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ubuntu', 'Inter', 'sans-serif'],
        display: ['Nunito', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6f2ea',
          100: '#c1dfc8',
          200: '#9acbab',
          300: '#71b68c',
          400: '#4ea670',
          500: '#2E7D32', // Rwandan green
          600: '#287029',
          700: '#216023',
          800: '#195116',
          900: '#0f350c',
        },
        secondary: {
          50: '#fff9e1',
          100: '#ffedb4',
          200: '#ffe184',
          300: '#ffd54f',
          400: '#fcc827',
          500: '#FBC02D', // Rwandan yellow
          600: '#e5a50a',
          700: '#c18800',
          800: '#9d6c00',
          900: '#7d5700',
        },
        accent: {
          50: '#e3f0fa',
          100: '#b9d9f2',
          200: '#8abfe9',
          300: '#57a5e0',
          400: '#2e91d8',
          500: '#1565C0', // Rwandan blue
          600: '#1159ac',
          700: '#0d4c97',
          800: '#083f82',
          900: '#05336e',
        },
        rwandan: {
          green: '#2E7D32',
          yellow: '#FBC02D',
          blue: '#1565C0',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'button': '0 4px 6px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        '300': '300ms',
      },
      backgroundImage: {
        'imigongo-pattern': "url('/src/assets/imigongo-pattern.png')",
        'rwanda-texture': "url('/src/assets/rwanda-texture.png')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 