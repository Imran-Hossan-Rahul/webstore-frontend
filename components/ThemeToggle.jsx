"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "light": return <Sun strokeWidth={1.5} className="w-5 h-5" />;
      case "dark": return <Moon strokeWidth={1.5} className="w-5 h-5" />;
      case "system": return <Monitor strokeWidth={1.5} className="w-5 h-5" />;
      default: return <Monitor strokeWidth={1.5} className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case "light": return "Currently: Light (Click for Dark)";
      case "dark": return "Currently: Dark (Click for System)";
      case "system": return "Currently: System (Click for Light)";
      default: return "Toggle Theme";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
}

