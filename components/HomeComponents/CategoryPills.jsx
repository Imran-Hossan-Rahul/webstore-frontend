"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryPills({ categories, activeCategory, onSelect }) {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        const scrollAmount = 200;
        scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    }
  };

  return (
    <div className="sticky top-14 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-sm w-full border-b border-slate-100 dark:border-slate-900 py-3 px-4 flex items-center gap-2">
      {/* Scroll Left Button (optional if valid) */}
      {/* <button onClick={() => scroll('left')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block">
          <ChevronLeft className="w-5 h-5" />
      </button> */}

      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-lg text-[14px] font-medium transition-all
              ${activeCategory === cat 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

       {/* Scroll Right Button */}
       {/* <button onClick={() => scroll('right')} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:block">
          <ChevronRight className="w-5 h-5" />
      </button> */}
    </div>
  );
}
