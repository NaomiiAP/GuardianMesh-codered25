/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        node: {
          healthy: '#10B981',
          compromised: '#EF4444',
          isolated: '#F59E0B',
          restored: '#6366F1',
        },
      },
    },
  },
  plugins: [],
};