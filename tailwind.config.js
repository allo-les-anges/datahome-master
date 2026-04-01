/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 'primary' pointe maintenant vers la variable injectée dynamiquement
        primary: 'var(--brand-primary)', 
      },
      fontFamily: {
        'serif': ['var(--font-serif)', 'serif'],
        'sans': ['var(--font-main)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}