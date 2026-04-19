"use client";

import { useTheme } from "@/context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <FiMoon className="text-lg text-black dark:text-white" />
      ) : (
        <FiSun className="text-lg text-black dark:text-white" />
      )}
    </button>
  );
}

