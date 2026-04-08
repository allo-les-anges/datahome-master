/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--brand-primary)',
      },
      fontFamily: {
        // "playfair.variable" dans layout.tsx est "--font-playfair"
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        // "montserrat.variable" dans layout.tsx est "--font-montserrat"
        sans: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
        // Optionnel : ajouter les autres si besoin
        mono: ['var(--font-roboto)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}