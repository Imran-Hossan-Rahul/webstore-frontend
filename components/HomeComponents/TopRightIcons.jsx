"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function TopRightIcons() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(""); // kon icon active
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);
  const router = useRouter();

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    setSearchOpen(true);
    setActiveIcon("search"); // search active
  };

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="fixed top-5 right-5 flex items-center gap-3 z-50">
      {/* Search Box */}
      <div
        ref={searchRef}
        onClick={handleSearchClick}
        className={`flex items-center rounded-full overflow-hidden cursor-pointer transition-all duration-300 ease-in-out origin-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${
          searchOpen ? "w-64 shadow-sm" : "w-11"
        }`}
        style={{ height: "44px" }}
      >
        <div className="flex items-center justify-center w-11 h-11">
          <Search
            strokeWidth={1.5}
            className={`w-5 h-5 transition-colors duration-200 ${
              searchOpen ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
            }`}
          />
        </div>
        <input
          type="text"
          placeholder="Search..."
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`bg-transparent outline-none transition-all duration-300 ease-in-out text-sm ${
            searchOpen
              ? "opacity-100 ml-2 w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              : "opacity-0 w-0 ml-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          }`}
        />
      </div>

      {/* Other Icons */}
      <div className="flex items-center gap-3 ml-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        <button
          onClick={(e) => {
            e.preventDefault();
            handleIconClick("mail");
            window.dispatchEvent(new CustomEvent("toggle-chat"));
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
        >
          <Mail
            strokeWidth={1.5}
            className={`w-5 h-5 transition-colors duration-200 ${
              activeIcon === "mail" ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
            }`}
          />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            handleIconClick("bell");
            window.dispatchEvent(new CustomEvent("toggle-notification"));
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
        >
          <Bell
            strokeWidth={1.5}
            className={`w-5 h-5 transition-colors duration-200 ${
              activeIcon === "bell" ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300"
            }`}
          />
        </button>

        <div
          onClick={() => handleIconClick("profile")}
          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border ${
            activeIcon === "profile"
              ? "border-blue-600 dark:border-blue-400"
              : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <img
            src="/profile.jpg"
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
