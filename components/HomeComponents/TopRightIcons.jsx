"use client";

import { useState, useRef, useEffect } from "react";
import { FiSearch, FiBell, FiMail } from "react-icons/fi";
import ThemeToggle from "../ThemeToggle";

export default function TopRightIcons() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(""); // kon icon active
  const searchRef = useRef(null);

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

  return (
    <div className="fixed top-5 right-5 flex items-center gap-3 z-50">
      {/* Search Box */}
      <div
        ref={searchRef}
        onClick={handleSearchClick} // full box e click handler
        className={`flex items-center rounded-full overflow-hidden cursor-pointer transition-all duration-500 ease-in-out origin-left ${
          searchOpen ? "w-64 bg-black dark:bg-white" : "w-11 bg-white dark:bg-gray-800"
        }`}
        style={{ height: "44px" }}
      >
        <div className="flex items-center justify-center w-11 h-11">
          <FiSearch
            className={`transition-colors duration-200 ${
              searchOpen ? "text-white dark:text-black" : "text-black dark:text-white"
            }`}
          />
        </div>
        <input
          type="text"
          placeholder="Search..."
          autoFocus
          className={`bg-transparent outline-none transition-all duration-500 ease-in-out ${
            searchOpen
              ? "opacity-100 ml-2 w-full text-white dark:text-black placeholder-white dark:placeholder-black"
              : "opacity-0 w-0 ml-0 text-black dark:text-white placeholder-black dark:placeholder-white"
          }`}
        />
      </div>

      {/* Other Icons */}
      <div className="flex items-center gap-3 ml-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        <a
          href="/inbox"
          onClick={() => handleIconClick("mail")}
          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            activeIcon === "mail"
              ? "bg-black dark:bg-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <FiMail
            className={`text-lg transition-colors duration-200 ${
              activeIcon === "mail" ? "text-white dark:text-black" : "text-black dark:text-white"
            }`}
          />
        </a>

        <a
          href="/notifications"
          onClick={() => handleIconClick("bell")}
          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            activeIcon === "bell"
              ? "bg-black dark:bg-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <FiBell
            className={`text-lg transition-colors duration-200 ${
              activeIcon === "bell" ? "text-white dark:text-black" : "text-black dark:text-white"
            }`}
          />
        </a>

        <div
          onClick={() => handleIconClick("profile")}
          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            activeIcon === "profile"
              ? "bg-black dark:bg-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <img
            src="/profile.jpg"
            alt="Profile"
            className={`w-9 h-9 rounded-full object-cover transition-all duration-200 ${
              activeIcon === "profile" ? "brightness-0 dark:invert" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}
