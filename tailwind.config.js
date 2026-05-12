/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050816',
        panel: '#0B1020',
        border: '#1E293B',
        primary: '#E5E7EB',
        muted: '#94A3B8',
        'accent-cyan': '#22D3EE',
        'accent-blue': '#3B82F6',
        'accent-purple': '#8B5CF6',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#22C55E'
      },
      boxShadow: {
        glow: '0 0 20px rgba(34,211,238,0.3)',
        panel: '0 20px 40px rgba(5,8,22,0.35)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
}
