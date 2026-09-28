"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  const applyTheme = useCallback((newTheme) => {
    if (typeof window === "undefined") return;

    // Force dark mode permanently for the marketplace pivot
    setTheme("dark");
    localStorage.setItem("app-theme", "dark");

    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  useEffect(() => {
    applyTheme("dark"); // Force dark on mount

    // Theme is locked to dark mode
    return () => {};
  }, []);

  const toggleTheme = () => {
    // Disabled: platform is strictly light mode for now
  };

  return (
    <ThemeContext.Provider value={{ theme, applyTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

