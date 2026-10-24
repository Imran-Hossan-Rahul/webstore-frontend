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
        const val = (typeof opt === 'object' ? opt.label : opt) || "";
        return val.toString().toLowerCase().includes((search || "").toLowerCase());
      })
    : options;

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && <label className="text-[11px] font-mono font-medium tracking-widest text-slate-500  uppercase px-1">{label}</label>}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={`w-full flex items-center justify-between px-4 py-2.5 bg-brand-cloud border rounded-[4px] transition-all text-[14px] font-sans ${
            isOpen ? "border-[rgba(17,20,24,0.50)] bg-brand-surface ring-1 ring-[rgba(17,20,24,0.50)]/30" : "border-[rgba(17,20,24,0.18)] hover:border-[rgba(17,20,24,0.30)]"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {ActiveIcon && <ActiveIcon size={16} strokeWidth={1.5} className="text-[#6A727C]" />}
            {Icon && !ActiveIcon && <Icon size={16} strokeWidth={1.5} className="text-slate-400" />}
            <span className="text-[#111418] truncate">{displayLabel || placeholder}</span>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className={`absolute z-50 ${dropdownWidth} mt-2 py-1.5 bg-brand-surface border border-[rgba(17,20,24,0.18)] rounded-[4px] shadow-sm overflow-hidden`}
            >
              {searchable && (
                <div className="px-2 pb-1.5 border-b border-slate-100">
                  <input 
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 bg-brand-cloud rounded-[4px] text-[13px] font-sans outline-none focus:ring-1 focus:ring-[rgba(17,20,24,0.50)] text-[#111418] placeholder:text-[#6A727C]"
                  />
                </div>
              )}
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-4 text-[11px] font-mono text-slate-400 text-center tracking-widest uppercase">No results found</div>
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
                        className={`w-full px-4 py-2.5 text-left text-[14px] font-sans transition-colors flex items-center justify-between ${
                          isSelected 
                            ? "bg-[#E6E9ED] text-[#111418] font-medium" 
                            : "text-slate-600 hover:bg-[#E6E9ED] hover:text-[#111418]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {OptIcon && <OptIcon size={16} strokeWidth={1.5} className={isSelected ? "text-[#111418]" : "text-slate-400"} />}
                          {lbl}
                        </div>
                        {isSelected && <Check size={16} strokeWidth={2} className="text-[#111418]" />}
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

