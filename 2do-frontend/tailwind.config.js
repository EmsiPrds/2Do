/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        // 🎨 Your Custom Colors
        brand: {
          dark: "#212121",
          yellow: "#FDCE00",
          light: "#EFEFEF",
        },
      },
    },
  },
  plugins: [],
};
