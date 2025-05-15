/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#2563EB",
        secondary: "#64748B",
        accent: "#F59E0B",
        background: "#F1F5F9",
      },
    },
  },
  plugins: [],
};
