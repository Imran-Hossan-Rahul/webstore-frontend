"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React from "react";
import { Upload, X, Plus, Download, FileText, AlertCircle } from "lucide-react";

export default function MetadataSection({
  devlogData,
  toggleTech,
  customToolInput,
  handleToolInputChange,
  addCustomTool,
  showSuggestions,
  filteredSuggestions,
  imagePreviews,
  handleImageUpload,
  removeImage,
  resource,
  handleResourceClick,
  resourceInputRef,
  handleResourceUpload
}) {
  return (
    <div className="space-y-8">
      {/* Tech Stack */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          4. TOOLS & TECHNOLOGIES
        </h3>
        


        <div className="relative">
          <label className="block text-xs font-semibold text-brand-slate dark:text-slate-300 mb-2">Add Custom Tool</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customToolInput}
              onChange={(e) => handleToolInputChange(e.target.value)}
              placeholder="e.g. Docker, GraphQL..."
              className="flex-1 px-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg text-sm focus:border-black dark:focus:border-white focus:outline-none"
            />
            <button onClick={() => addCustomTool()} className="btn-primary px-4 py-2 rounded-lg text-xs font-bold">Add</button>
          </div>
          
          {showSuggestions && (
            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-lg shadow-sm z-50">
              {filteredSuggestions.map(s => (
                <button key={s} onClick={() => addCustomTool(s)} className="w-full text-left px-4 py-2 hover:bg-brand-cloud dark:hover:bg-[#171717] text-sm">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {devlogData.tools.map(tool => (
            <span key={tool} className="px-2 py-1 bg-slate-100 dark:bg-[#171717] border border-slate-200 dark:border-[#262626] rounded-full text-[10px] font-medium flex items-center gap-1">
              {tool}
              <button onClick={() => toggleTech(tool)}><X size={14} strokeWidth={1.5} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Visual Showcase */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          5. VISUAL SHOWCASE
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:bg-brand-cloud dark:hover:bg-slate-900/50 cursor-pointer transition">
            <Upload size={20} strokeWidth={1.5} className="text-slate-400 mb-2" />
            <span className="text-[10px] font-bold text-slate-500">Upload Media</span>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group">
              <img src={getOptimizedUrl(src)} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Assets */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          6. PROJECT ASSETS
        </h3>
        
        <div 
          onClick={handleResourceClick}
          className={`p-6 border-2 border-dashed rounded-2xl transition cursor-pointer flex flex-col items-center gap-3 ${
            resource ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-[#262626] hover:bg-brand-cloud dark:hover:bg-[#171717]'
          }`}
        >
          <div className={`p-3 rounded-xl ${resource ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <Download size={24} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {resource ? resource.originalName : "Attach Project Files"}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
              {resource ? `File ready • ${(resource.size / 1024 / 1024).toFixed(2)}MB` : "ZIP, PDF, RAR up to 50MB"}
            </div>
          </div>
          <input type="file" ref={resourceInputRef} onChange={handleResourceUpload} className="hidden" />
        </div>
      </div>
    </div>
  );
}
