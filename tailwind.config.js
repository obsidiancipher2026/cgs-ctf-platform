/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#08080d',
          dark: '#0c0c18',
          gray: '#12121f',
          blue: '#00e5ff',
          cyan: '#00e5ff',
          purple: '#b300ff',
          green: '#00ff88',
          red: '#ff0033',
          gold: '#ffd700',
          pink: '#ff2d79',
        },
      },
      fontFamily: {
        mono: ['Outfit', 'sans-serif'],
        cyber: ['Outfit', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glitch': 'glitch 0.3s ease-in-out',
        'pulse-cyber': 'pulseCyber 2s ease-in-out infinite',
        'scan-line': 'scanLine 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite alternate',
        'crimson-pulse': 'crimsonPulse 2s ease-in-out infinite alternate',
        'border-glow': 'borderGlow 3s ease-in-out infinite alternate',
        'drift': 'drift 20s ease-in-out infinite alternate',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite alternate',
        'cyber-float': 'cyberFloat 8s ease-in-out infinite',
        'glow-border': 'glowBorder 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00e5ff, 0 0 10px #00e5ff, 0 0 20px #00e5ff' },
          '100%': { boxShadow: '0 0 10px #b300ff, 0 0 20px #b300ff, 0 0 40px #b300ff' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
          '100%': { transform: 'translate(0)' },
        },
        pulseCyber: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        neonPulse: {
          '0%': { textShadow: '0 0 4px #00e5ff, 0 0 8px #00e5ff' },
          '100%': { textShadow: '0 0 8px #b300ff, 0 0 16px #b300ff, 0 0 32px #b300ff' },
        },
        crimsonPulse: {
          '0%': { textShadow: '0 0 4px #ff0033, 0 0 8px #ff0033' },
          '100%': { textShadow: '0 0 12px #ff0033, 0 0 24px #ff0033, 0 0 48px #ff0033' },
        },
        borderGlow: {
          '0%': { borderColor: 'rgba(0, 229, 255, 0.3)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)' },
          '50%': { borderColor: 'rgba(179, 0, 255, 0.4)', boxShadow: '0 0 30px rgba(179, 0, 255, 0.2)' },
          '100%': { borderColor: 'rgba(0, 229, 255, 0.3)', boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(30px, -20px) rotate(1deg)' },
          '66%': { transform: 'translate(-20px, 10px) rotate(-1deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        aurora: {
          '0%': { transform: 'translateX(-10%) translateY(0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translateX(5%) translateY(-10%) scale(1.1)', opacity: '0.5' },
          '100%': { transform: 'translateX(10%) translateY(0) scale(1)', opacity: '0.3' },
        },
        cyberFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-8px) rotate(0.5deg)' },
          '75%': { transform: 'translateY(4px) rotate(-0.5deg)' },
        },
        glowBorder: {
          '0%': { borderColor: 'rgba(0, 229, 255, 0.2)', boxShadow: '0 0 10px rgba(0, 229, 255, 0.05)' },
          '100%': { borderColor: 'rgba(0, 229, 255, 0.5)', boxShadow: '0 0 30px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.05)' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)',
        'cyber-gradient': 'linear-gradient(135deg, #08080d 0%, #12121f 50%, #0c0c18 100%)',
        'jap-circuit': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300e5ff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
