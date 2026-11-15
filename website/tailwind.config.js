/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8f0f9',
          100: '#c5d9f0',
          200: '#9ec0e6',
          300: '#77a7dc',
          400: '#5994d5',
          500: '#3b81ce',
          600: '#2d6fb8',
          700: '#1e5a9e',
          800: '#104682',
          900: '#0F4C81',
          950: '#0a3560',
        },
        emerald: {
          600: '#2E7D32',
          700: '#256028',
          800: '#1b4a1e',
        },
        orange: {
          400: '#FFB74D',
          500: '#FF9800',
          600: '#F57C00',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'counter': 'counter 2s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0F4C81 0%, #1e6baf 50%, #2E7D32 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'card': '0 4px 20px rgba(15, 76, 129, 0.12)',
        'card-hover': '0 8px 40px rgba(15, 76, 129, 0.25)',
        'nav': '0 2px 20px rgba(15, 76, 129, 0.15)',
      },
      backdropBlur: {
        'glass': '4px',
      },
    },
  },
  plugins: [],
}
