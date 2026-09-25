"use client";

import React from "react";
import { Plus, X, CheckCircle, Calendar } from "lucide-react";

export default function MilestonesSection({
  milestones,
  showMilestoneForm,
  setShowMilestoneForm,
  newMilestone,
  setNewMilestone,
  addMilestone,
  deleteMilestone
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          3. KEY MILESTONES
        </h3>
        <button 
          onClick={() => setShowMilestoneForm(true)}
          className="p-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-all border border-transparent dark:border-[#262626]"
        >
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>

      {showMilestoneForm && (
        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-4 animate-in slide-in-from-top-2">
          <input
            type="text"
            placeholder="Milestone title..."
            value={newMilestone.title}
            onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
             <input
               type="date"
               value={newMilestone.date}
               onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
               className="px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-xs focus:border-black dark:focus:border-white focus:outline-none"
             />
             <select
               value={newMilestone.status}
               onChange={(e) => setNewMilestone(prev => ({ ...prev, status: e.target.value }))}
               className="px-3 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-xs focus:border-black dark:focus:border-white focus:outline-none"
             >
               <option value="planned">Planned</option>
               <option value="in-progress">In Progress</option>
               <option value="completed">Completed</option>
             </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowMilestoneForm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">Cancel</button>
            <button onClick={addMilestone} className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold">Add Milestone</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {milestones.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-[#262626] rounded-xl">
             <div className="text-xs text-slate-400">No milestones added yet</div>
          </div>
        ) : (
          milestones.map((m) => (
            <div key={m.id} className="group relative p-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl hover:border-black dark:hover:border-white transition-all">
              <button 
                onClick={() => deleteMilestone(m.id)}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
              <div className="flex items-start gap-3">
                <div className={`mt-1 p-1.5 rounded-lg ${
                  m.status === 'completed' ? 'bg-green-100 text-green-600' : 
                  m.status === 'in-progress' ? 'bg-blue-100 text-brand-blue' : 'bg-slate-100 text-slate-500'
                }`}>
                  <CheckCircle size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar size={14} strokeWidth={1.5} />
                      {m.date || "No date"}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      m.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      m.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-brand-slate'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
