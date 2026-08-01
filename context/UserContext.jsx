"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/utils/api";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";

const UserContext = createContext();

/**
 * 👤 USER PROVIDER
 * 
 * Centralized source of truth for user authentication, profile data,
 * and preference synchronization.
 */
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const { applyTheme } = useTheme();
  const { setLang } = useLanguage();
  
  const lastSyncedTheme = useRef(null);
  const lastSyncedLang = useRef(null);

  const checkAuth = useCallback(async () => {
    try {
      // 🔒 Million-dollar security: We don't check localStorage for tokens. 
      // The browser automatically sends httpOnly cookies.
      const res = await api.get("/user/profile");
      
      if (res.success) {
        if (res.data) {
          setUser(res.data);
          setIsGuest(false);
          
          // Sync Preferences
          const dbTheme = res.data.appearancePreferences?.theme;
        if (dbTheme && dbTheme !== lastSyncedTheme.current) {
          applyTheme(dbTheme);
          lastSyncedTheme.current = dbTheme;
        }

        const dbLang = res.data.appearancePreferences?.language;
        if (dbLang && dbLang !== lastSyncedLang.current) {
          setLang(dbLang);
          lastSyncedLang.current = dbLang;
        }
        } else {
          setIsGuest(true);
          setUser(null);
        }
      } else {
        setIsGuest(true);
        setUser(null);
      }
    } catch (err) {
      // If it's a server error (500/503), don't log the user out. The backend is likely just restarting.
      if (err.status && err.status >= 500) {
        console.warn("Backend unavailable, preserving current user state:", err);
      } else {
        // Only silence auth errors (401/403) and treat them as guest
        setIsGuest(true);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [applyTheme, setLang]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      // 🔒 SECURITY: Must clear cookies on backend
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token"); // Legacy cleanup
      localStorage.removeItem("user"); // Clear the user object (and accessToken)
      localStorage.removeItem("userId");
      localStorage.removeItem("hasCraftsmanAccount");
      setIsGuest(true);
      setUser(null);
      window.location.href = "/";
    }
  };


  const value = {
    user,
    loading,
    isGuest,
    refreshUser: checkAuth,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
