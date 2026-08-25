import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        p-1.5 rounded-lg transition duration-200
        dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/5
        text-lm-text2 hover:text-lm-text1 hover:bg-black/5
        ${className}
      `}
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
