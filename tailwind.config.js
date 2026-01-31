/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
          "display": ["Inter", "sans-serif"]
      },
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        accent: '#8b5cf6',
        text: '#f1f5f9',
        muted: '#94a3b8',
        border: '#334155',
        "primary": "#198ae6",
        "background-light": "#f6f7f8",
        "background-dark": "#0a0c10",
      }
    }
  },
  plugins: [],
}