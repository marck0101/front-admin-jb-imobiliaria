/** @type {import('tailwindcss').Config} */
import { withUt } from 'uploadthing/tw';

export default withUt({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0054F5',
        gray: '#666666',
      },
    },
  },
  plugins: [],
});
