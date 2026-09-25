"use client";

import React from "react";
import { Calendar, Plus } from "lucide-react";

export default function TimelineSection({
  devlogData,
  handleDateChange,
  setShowExtensionModal,
  isEdit
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          2. TIMELINE & DURATION
        </h3>
        {isEdit && (
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md border border-orange-100 dark:border-orange-800/30">
            Timeline Locked
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Start Date</label>
          <div className="relative">
            <Calendar size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              disabled={isEdit}
              value={devlogData.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className={`w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none text-sm transition-opacity ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Target End Date</label>
          <div className="relative">
            <Calendar size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              disabled={isEdit}
              value={devlogData.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className={`w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none text-sm transition-opacity ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-brand-cloud dark:bg-[#171717] rounded-xl border border-slate-200 dark:border-[#262626] flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Estimated Duration</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {devlogData.duration || "—"}
          </div>
        </div>
        {devlogData.endDate && (
           <button 
             onClick={() => setShowExtensionModal(true)}
             className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-[10px] font-bold hover:bg-brand-cloud dark:hover:bg-[#171717] transition-all"
           >
             <Plus size={14} strokeWidth={1.5} />
             Extend Timeline
           </button>
        )}
      </div>

      {devlogData.extensions?.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300">Extensions</label>
          {devlogData.extensions.map((ext, idx) => (
            <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-[10px]">
              <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
                <span>Extension {idx + 1}</span>
                <span>+{ext.duration}</span>
              </div>
              <p className="text-red-600 dark:text-red-300 mt-1">{ext.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
