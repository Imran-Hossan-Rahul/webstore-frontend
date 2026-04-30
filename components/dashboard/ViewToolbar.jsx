"use client";
import React, { useState } from 'react';
import { LayoutGrid, StretchHorizontal, ChevronDown } from 'lucide-react';

const VIEW_OPTIONS = [
    { value: 'list', label: 'List',  icon: StretchHorizontal },
    { value: 'grid', label: 'Card',  icon: LayoutGrid },
];

export default function ViewToolbar({ 
    viewMode, 
    setViewMode, 
    categories = [],
    activeCategory,
    setActiveCategory
}) {
    const [isViewOpen, setIsViewOpen]         = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const activeView = VIEW_OPTIONS.find(v => v.value === viewMode) || VIEW_OPTIONS[0];
    const ActiveViewIcon = activeView.icon;

    return (
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4 w-full">

            {/* Left: View dropdown */}
            <div className="relative">
                <button
                    onClick={() => { setIsViewOpen(o => !o); setIsCategoryOpen(false); }}
                    className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                >
                    <ActiveViewIcon size={15} />
                    <span>{activeView.label}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isViewOpen ? 'rotate-180' : ''}`} />
                </button>

                {isViewOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsViewOpen(false)} />
                        <div className="absolute left-0 mt-2 w-36 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                            {VIEW_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setViewMode(opt.value); setIsViewOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                            viewMode === opt.value
                                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                                        }`}
                                    >
                                        <Icon size={14} />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Right: Category dropdown */}
            {categories && categories.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => { setIsCategoryOpen(o => !o); setIsViewOpen(false); }}
                        className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all shadow-sm"
                    >
                        <span className="max-w-[120px] truncate">{activeCategory}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                {categories.map((cat, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setActiveCategory(cat); setIsCategoryOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                            activeCategory === cat
                                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

        </div>
    );
}

