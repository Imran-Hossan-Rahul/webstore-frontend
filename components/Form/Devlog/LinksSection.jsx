"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function LinksSection({
  devlogData,
  setDevlogData,
  difficultyLevels
}) {
  return (
    <div className="space-y-8">
      {/* External Links */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          7. EXTERNAL LINKS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">GitHub URL</label>
            <input
              type="text"
              value={devlogData.githubUrl}
              onChange={(e) => setDevlogData(prev => ({ ...prev, githubUrl: e.target.value }))}
              placeholder="https://github.com/..."
              className="w-full px-4 py-2 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Live Preview</label>
            <input
              type="text"
              value={devlogData.liveUrl}
              onChange={(e) => setDevlogData(prev => ({ ...prev, liveUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Documentation</label>
            <input
              type="text"
              value={devlogData.documentationUrl}
              onChange={(e) => setDevlogData(prev => ({ ...prev, documentationUrl: e.target.value }))}
              placeholder="https://docs..."
              className="w-full px-4 py-2 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Project Status */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          8. PROJECT STATUS & DIFFICULTY
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
             <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300">Project Status</label>
             <div className="flex gap-2">
               {["Planning", "In Progress", "Paused", "Completed"].map(status => (
                 <button
                   key={status}
                   onClick={() => setDevlogData(prev => ({ ...prev, status }))}
                   className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                     devlogData.status === status 
                       ? "bg-slate-900 dark:bg-brand-surface text-white dark:text-black border-slate-900 dark:border-white" 
                       : "bg-brand-surface dark:bg-[#0A0A0A] border-brand-navy/[0.08] dark:border-[#262626] text-slate-500 dark:text-slate-400"
                   }`}
                 >
                   {status}
                 </button>
               ))}
             </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300">
              Difficulty: {difficultyLevels[devlogData.difficulty]}
            </label>
            <input
              type="range"
              min="0"
              max="4"
              value={devlogData.difficulty}
              onChange={(e) => setDevlogData(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#262626] rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-white"
            />
          </div>
        </div>
      </div>

      {/* License */}
      <div>
        <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">License</label>
        <select
          value={devlogData.license}
          onChange={(e) => setDevlogData(prev => ({ ...prev, license: e.target.value }))}
          className="w-full px-4 py-2.5 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg text-sm text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none"
        >
          {["None", "MIT", "GPL-3.0", "Apache-2.0", "CC-BY-4.0", "Private"].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-brand-sky dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3">
        <AlertCircle size={16} className="text-brand-blue dark:text-blue-400 mt-0.5" />
        <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
          Your devlog will be public and shared with the community. Ensure you have the rights to share all uploaded content and media.
        </p>
      </div>
    </div>
  );
}
