/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'red-core': '#E02020',
        'red-glow': '#FF4444',
        'red-dim': '#7A1010',
        'blue-core': '#1A6EFF',
        'blue-glow': '#4D9EFF',
        'blue-dim': '#0A2A5C',
        'void': '#050A0F',
        'surface': '#0B1220',
        'surface-2': '#111C2E',
        'border-c': '#1E2D45',
        'txt': {
          primary: '#E8F0FF',
          secondary: '#7A9CC0',
          muted: '#3D5A7A',
        },
        'success': '#00D68F',
        'warning': '#FFB800',
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'scan-line': 'scanLine 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glitch-scan': 'glitchScan 150ms steps(2) forwards',
        'confetti': 'confetti 0.6s ease-out forwards',
        'shake': 'shake 300ms ease-in-out',
        'count-up': 'fadeInUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-bottom': 'slideInBottom 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'blink': 'blink 1.5s steps(1) infinite',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '-2px', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100vh', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        glitchScan: {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '50%': { clipPath: 'inset(40% 0 0% 0)' },
          '100%': { clipPath: 'inset(100% 0 0 0)' },
        },
        confetti: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'scale(1.5) rotate(720deg)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(26, 110, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 110, 255, 0.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
