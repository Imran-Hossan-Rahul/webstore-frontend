"use client"

import { useState } from "react";

export default function CheckBox() {
      const [checked, setChecked] = useState(false);

    return (
      <label className="flex items-center ml-1 gap-3 cursor-pointer text-[#6c7293] font-medium text-sm">
        <input type="checkbox" className="hidden" id="remember" />
        <div
          onClick={() => setChecked(!checked)}
          className="w-5 h-5 rounded-md flex items-center justify-center bg-[#e0e5ec] shadow-[3px_3px_8px_#bec3cf,-3px_-3px_8px_#ffffff] relative overflow-hidden cursor-pointer transition-all active:shadow-[inset_2px_2px_5px_#bec3cf,inset_-2px_-2px_5px_#ffffff]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={`w-3.5 h-3.5 text-[#00c896] transition-all duration-300 ${
              checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        Remember me
      </label>
    );
}