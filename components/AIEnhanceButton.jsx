"use client";

import React, { useState } from 'react';
import { Zap, Wand2, Check } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

const AIEnhanceButton = ({ text, onUpdate, className = "", placement = "top" }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async (type) => {
    if (!text || !text.trim()) return;
    setLoading(true);
    setIsOpen(false); // Close menu
    try {
      // ... existing logic ...
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text, 
            type, 
            model: "gemini-2.5-flash" 
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        onUpdate(data.data);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const dropdownClasses = placement === "bottom" 
    ? "top-full mt-2 origin-top-left" 
    : "bottom-full mb-2 origin-bottom-left";

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || !text}
        className={`p-2 rounded-full transition-all group ${loading ? 'cursor-not-allowed bg-purple-100' : 'hover:bg-purple-50 text-purple-600'}`}
        title="AI Enhance"
      >
        {loading ? (
            <AppleSpinner className="w-5 h-5 animate-spin text-purple-600" />
        ) : (
            <Zap className={`w-5 h-5 ${text ? 'text-purple-600' : 'text-slate-300'}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className={`absolute left-0 z-50 w-48 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 ${dropdownClasses}`}>
                <div className="p-1">
                    <button
                        onClick={() => handleGenerate('enhance')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-slate dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 rounded-lg transition-colors text-left"
                    >
                        <Wand2 className="w-4 h-4" />
                        <span>Enhance Writing</span>
                    </button>
                    <button
                        onClick={() => handleGenerate('grammar')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-brand-slate dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 rounded-lg transition-colors text-left"
                    >
                        <Check className="w-4 h-4" />
                        <span>Fix Grammar</span>
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default AIEnhanceButton;
