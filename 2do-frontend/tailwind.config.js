/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        brand: {
          dark:    "#212121",   // dark background
          yellow:  "#FDCE00",   // accent
          light:   "#EFEFEF",   // light background
          muted:   "#6B6B6B",
          surface: "#EFEFEF",
          border:  "#E4E4E4",
        },
        ink: {
          1: "rgba(255,255,255,0.92)",   // primary text  (dark mode)
          2: "rgba(255,255,255,0.55)",   // secondary text
          3: "rgba(255,255,255,0.30)",   // tertiary / labels
          4: "rgba(255,255,255,0.12)",   // subtle borders
          5: "rgba(255,255,255,0.05)",   // card surfaces
          6: "rgba(255,255,255,0.03)",   // dimmed surfaces
        },
        // Light-mode semantic palette
        lm: {
          bg:       "#EFEFEF",
          surface:  "#FFFFFF",
          surface2: "#E8E8E8",
          border:   "rgba(0,0,0,0.08)",
          border2:  "rgba(0,0,0,0.12)",
          text1:    "rgba(0,0,0,0.88)",
          text2:    "rgba(0,0,0,0.50)",
          text3:    "rgba(0,0,0,0.32)",
        },
      },
      boxShadow: {
        card:        "0 1px 2px rgba(0,0,0,0.20), 0 0 0 1px rgba(255,255,255,0.05)",
        "card-lift": "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
        "glow-y":    "0 0 40px rgba(253,206,0,0.08)",
        "input-focus": "0 0 0 3px rgba(253,206,0,0.20)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg:  "0.75rem",
        xl:  "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      spacing: {
        "px": "1px",
        "0.5": "2px",
        "sidebar": "17rem",
      },
    },
  },
  plugins: [],
};
