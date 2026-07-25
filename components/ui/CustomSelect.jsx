import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = "Select...",
  searchable = false,
  className = "",
  icon: Icon,
  dropdownWidth = "w-full"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(opt => {
    if (typeof opt === 'object') return opt.value === value;
    return opt === value;
  });

  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
  const ActiveIcon = typeof selectedOption === 'object' ? selectedOption.icon : null;

  const filteredOptions = searchable 
    ? options.filter(opt => {
        const val = typeof opt === 'object' ? opt.label : opt;
        return val.toLowerCase().includes(search.toLowerCase());
      })
    : options;

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={`w-full flex items-center justify-between px-4 py-2 bg-slate-200/50 dark:bg-white/10 border border-transparent rounded-md transition-all text-[11px] font-extrabold uppercase tracking-wider ${
            isOpen ? "bg-white dark:bg-white/10 ring-2 ring-slate-900/5 dark:ring-white/5 shadow-sm" : "hover:bg-slate-200/80 dark:hover:bg-white/20"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {ActiveIcon && <ActiveIcon size={16} strokeWidth={1.5} className="text-slate-400" />}
            {Icon && !ActiveIcon && <Icon size={16} strokeWidth={1.5} className="text-slate-400" />}
            <span className="text-slate-900 dark:text-white truncate">{displayLabel || placeholder}</span>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} className={`text-slate-400 transition-opacity duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className={`absolute z-50 ${dropdownWidth} mt-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden`}
            >
              {searchable && (
                <div className="px-2 pb-1.5 border-b border-slate-100 dark:border-white/5">
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] rounded text-xs outline-none focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-white/10 text-slate-700 dark:text-slate-200"
                  />
                </div>
              )}
              <div className="max-h-[240px] overflow-y-auto scrollbar-hide">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">No results found</div>
                ) : (
                  filteredOptions.map((opt, idx) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lbl = typeof opt === 'object' ? opt.label : opt;
                    const OptIcon = typeof opt === 'object' ? opt.icon : null;
                    const isSelected = val === value;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onChange(val);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className={`w-full px-4 py-2 text-left text-[11px] font-extrabold uppercase tracking-wider transition-colors flex items-center justify-between ${
                          isSelected 
                            ? "bg-slate-900 dark:bg-white text-white dark:text-black" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {OptIcon && <OptIcon size={16} strokeWidth={1.5} className={isSelected ? "text-white dark:text-black" : "text-slate-400"} />}
                          {lbl}
                        </div>
                        {isSelected && <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white dark:bg-black" : "bg-slate-400"}`} />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
