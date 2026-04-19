"use client";

import { useState } from "react";

export default function PasswordInput({ value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);
  const isFilled = value && value.length > 0;

  return (
    <div className="relative min-h-[70px]">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer email-password-input-box w-full bg-[#e0e5ec] rounded-[15px] p-5 pl-[55px] text-[#3d4468] font-medium text-base outline-none transition-all duration-300"
      />
      <label
        htmlFor="password"
        className={`absolute left-[55px] top-1/2 transform -translate-y-1/2 text-[#9499b7] font-normal text-base pointer-events-none transition-all duration-300
          ${
            !isFilled
              ? "peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#9499b7]"
              : "top-3 text-sm text-[#6c7293]"
          }
          peer-focus:top-3 peer-focus:text-sm peer-focus:text-[#6c7293]`}
      >
        Password
      </label>

      <div className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9499b7] flex items-center justify-center">
        <img
          src="/lock-svgrepo-com.svg"
          alt="lock icon"
          className="w-full h-full"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 bg-[#e0e5ec] rounded-lg flex items-center justify-center text-[#9499b7] transition-all duration-300
             active:scale-90 active:opacity-70"
        aria-label="Toggle password visibility"
      >
        {/* Eye Icons */}
        <svg
          className={`w-4 h-4 absolute transition-opacity duration-300 ${
            showPassword ? "opacity-100" : "opacity-0"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>

        <svg
          className={`w-4 h-4 absolute transition-opacity duration-300 ${
            showPassword ? "opacity-0" : "opacity-100"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>

      {error && (
        <span className="text-red-500 text-xs absolute left-5 bottom-[-18px] w-full">
          {error}
        </span>
      )}
    </div>
  );
}
