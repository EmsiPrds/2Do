/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        brand: {
          dark: "#000000",
          yellow: "#FDCE00",
          light: "#EFEFEF",
          muted: "#6B6B6B",
          surface: "#F7F7F7",
          border: "#E4E4E4",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.12)",
        "input-focus": "0 0 0 3px rgba(253,206,0,0.25)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
