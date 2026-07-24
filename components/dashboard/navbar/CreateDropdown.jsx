"use client";

import React from "react";
import Link from "next/link";
import { Plus, Layers, Command, FileText } from "lucide-react";

/**
 * ➕ CREATE DROPDOWN COMPONENT
 * 
 * Modularized dropdown for creating Artifacts, Devlogs, and Codex.
 */
export default function CreateDropdown({ 
    isOpen, 
    setIsOpen, 
    onOpenCreatePost 
}) {
    if (!isOpen) return null;

    return (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <Link
                href="/upload-artifact"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Create Artifact</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Upload new work</div>
                </div>
            </Link>
            
            <Link
                href="/upload-devlog"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5"
            >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Command className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Create Devlog</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Showcase progress</div>
                </div>
            </Link>
            
            <Link
                href="/codex-editor"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5"
            >
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Create Codex</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Write a guide</div>
                </div>
            </Link>
        </div>
    );
}
