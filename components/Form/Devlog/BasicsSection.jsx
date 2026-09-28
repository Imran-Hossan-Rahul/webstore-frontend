"use client";

import React from "react";
import { X, Search, Grid } from "lucide-react";
import { EditorContent } from "@tiptap/react";
import CustomSelect from "@/components/ui/CustomSelect";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function BasicsSection({
  devlogData,
  setDevlogData,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  handleTagKeyPress,
  userSearchTerm,
  setUserSearchTerm,
  isSearchingUsers,
  userSearchResults,
  handleSelectCollaborator,
  removeCollaborator,
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        1. DEVLOG BASICS
      </h3>

      {/* Devlog Title */}
      <div>
        <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">
          Devlog Title
        </label>
        <input
          type="text"
          value={devlogData.title}
          onChange={(e) => setDevlogData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter your devlog name..."
          className="w-full px-4 py-3 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition"
        />
      </div>

      {/* Description Area */}
      <div>
        <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={devlogData.description || ""}
          onChange={(e) => setDevlogData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Write your devlog story..."
          rows={6}
          className="w-full px-4 py-3 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-gray-500 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none transition resize-none text-sm leading-relaxed"
        />
      </div>

      {/* Category & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <CustomSelect
            label="Category"
            options={["Design", "Development", "AI/ML", "Mobile", "Web", "Game Dev", "Other"]}
            value={devlogData.category}
            onChange={(val) => setDevlogData(prev => ({ ...prev, category: val }))}
            icon={Grid}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
              className="flex-1 px-4 py-2 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none text-sm"
            />
            <button onClick={addTag} className="btn-primary px-4 py-2 rounded-lg text-xs font-bold">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {devlogData.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-[#171717] border border-brand-navy/[0.08] dark:border-[#262626] rounded-full text-[10px] font-medium flex items-center gap-1">
                {tag}
                <button onClick={() => removeTag(tag)}><X size={14} strokeWidth={1.5} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Collaborators */}
      <div className="relative">
        <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Collaborators</label>
        <div className="relative">
          <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={userSearchTerm}
            onChange={(e) => setUserSearchTerm(e.target.value)}
            placeholder="Search @username..."
            className="w-full pl-9 pr-10 py-2 bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:outline-none text-sm"
          />
          {isSearchingUsers && <AppleSpinner size={16} strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
        </div>
        
        {userSearchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-brand-surface dark:bg-[#0A0A0A] border border-brand-navy/[0.08] dark:border-[#262626] rounded-lg shadow-sm z-50 max-h-48 overflow-y-auto">
            {userSearchResults.map(u => (
              <button key={u._id} onClick={() => handleSelectCollaborator(u)} className="w-full text-left px-4 py-2 hover:bg-brand-cloud dark:hover:bg-slate-900 text-sm flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span>{u.name} (@{u.username})</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {devlogData.collaborators.map(c => (
            <span key={c} className="px-2 py-1 bg-brand-sky dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-400 rounded-lg text-[10px] font-medium flex items-center gap-1">
              {c}
              <button onClick={() => removeCollaborator(c)}><X size={14} strokeWidth={1.5} /></button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
