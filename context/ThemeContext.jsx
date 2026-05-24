"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("system");

  const applyTheme = (newTheme) => {
    if (typeof window === "undefined") return;

    let effectiveTheme = newTheme;
    if (newTheme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);

    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "system";
    applyTheme(savedTheme);

    // Listen for system theme changes if in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (localStorage.getItem("app-theme") === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") applyTheme("dark");
    else if (theme === "dark") applyTheme("system");
    else applyTheme("light");
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

