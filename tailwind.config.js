/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base: '#05070C',
        surface: {
          DEFAULT: '#0B0F17',
          raised: '#12161F',
        },
        // Accent — Aurora gradient palette
        aurora: {
          violet: '#7C5CFF',
          cyan: '#22D3EE',
          emerald: '#34E89E',
        },
        // Signal / status
        signal: {
          amber: '#FFB020',
        },
        alert: {
          coral: '#FF5C72',
        },
        // Text
        txt: {
          primary: '#F5F7FA',
          secondary: '#9AA4B2',
          muted: '#5B6472',
        },
        // Border
        'border-c': 'rgba(255,255,255,0.08)',
        // Legacy aliases (updated values)
        void: '#05070C',
        'surface-2': '#12161F',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.4)',
        card: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px -8px rgba(0,0,0,0.4)',
        aurora: '0 0 60px -20px rgba(124,92,255,0.15)',
        'glow-violet': '0 0 40px -10px rgba(124,92,255,0.2)',
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
        'aurora-drift': 'auroraDrift 20s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
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
        auroraDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px -10px rgba(124,92,255,0.2)' },
          '50%': { boxShadow: '0 0 40px -5px rgba(124,92,255,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)',
        'gradient-aurora': 'linear-gradient(135deg, #7C5CFF, #22D3EE, #34E89E)',
        'gradient-aurora-text': 'linear-gradient(90deg, #7C5CFF, #22D3EE, #34E89E)',
      },
    },
  },
  plugins: [],
}
