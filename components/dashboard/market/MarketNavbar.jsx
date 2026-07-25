"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, Laptop, Shirt, Home, Box, ChevronDown } from "lucide-react";
import { hoverModalVariants } from '@/utils/animations';

import { api } from '@/utils/api';

export default function MarketNavbar() {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();

  React.useEffect(() => {
    api.get('/market/categories/all')
      .then(res => {
        if (res.data) setCategories(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  if (pathname === '/market') {
    return null;
  }

  return (
    <div className="w-full sticky top-[72px] z-40 hidden md:block pt-4">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2">
          <ul className="flex items-center justify-between w-full">
          {categories.filter(c => !c.isSubcategory).slice(0, 6).map((category) => (
            <li 
              key={category._id}
              className="relative"
              onMouseEnter={() => setHoveredCategory(category._id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <button 
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                  hoveredCategory === category._id 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Box size={16} />
                {category.name}
                <ChevronDown size={14} className={`transition-opacity duration-300 ${hoveredCategory === category._id ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {hoveredCategory === category._id && (
                  <motion.div
                    variants={hoverModalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden"
                  >
                    <div className="p-2">
                      {categories.filter(sub => sub.isSubcategory && String(sub.parentCategory?._id) === String(category._id)).map((sub) => (
                        <Link 
                          key={sub._id}
                          href={`/market?q=${encodeURIComponent(sub.name.toLowerCase())}`}
                          className="block px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}
