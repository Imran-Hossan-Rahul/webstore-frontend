"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  const applyTheme = (newTheme) => {
    if (typeof window === "undefined") return;

    // Force light mode permanently for the marketplace pivot
    setTheme("light");
    localStorage.setItem("app-theme", "light");

    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");
  };

  useEffect(() => {
    applyTheme("light"); // Force light on mount

    // Theme is locked to light mode
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

