"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "@/utils/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_lang");
    if (savedLang && (savedLang === "en" || savedLang === "bn")) {
      setLangState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang) => {
    if (newLang === "en" || newLang === "bn") {
      setLangState(newLang);
      localStorage.setItem("preferred_lang", newLang);
      
      // Update HTML attribute for SEO and accessibility
      document.documentElement.lang = newLang;
    }
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  }, [lang]);

  // Prevent hydration mismatch by waiting for mount
  const value = { lang, setLang, t, mounted };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
