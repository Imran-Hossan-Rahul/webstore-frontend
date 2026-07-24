// components/AdminComponents/Advanced/ExportPanel.jsx
"use client";

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, Calendar, Mail } from "lucide-react";
import DataExport from '@/utils/DataExport';

export default function ExportPanel({ dataSource, filters = {} }) {
  const [exporting, setExporting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await DataExport.exportWithFilters(dataSource, filters, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
          <Download size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Export Data</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Download in multiple formats</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleExport('csv')} disabled={exporting} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/5 transition-colors disabled:opacity-50">
          <FileText size={20} className="text-slate-600 dark:text-slate-400" />
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">CSV</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Comma-separated</p>
          </div>
        </button>

        <button onClick={() => handleExport('excel')} disabled={exporting} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/5 transition-colors disabled:opacity-50">
          <FileSpreadsheet size={20} className="text-emerald-600" />
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Excel</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">XLSX format</p>
          </div>
        </button>

        <button onClick={() => handleExport('json')} disabled={exporting} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/5 transition-colors disabled:opacity-50">
          <FileJson size={20} className="text-blue-600" />
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">JSON</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">API format</p>
          </div>
        </button>

        <button onClick={() => handleExport('pdf')} disabled={exporting} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] rounded-xl border border-slate-200 dark:border-white/5 transition-colors disabled:opacity-50">
          <FileText size={20} className="text-red-600" />
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">PDF</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Report format</p>
          </div>
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
        <button onClick={() => setScheduleOpen(!scheduleOpen)} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
          <Calendar size={16} />
          Schedule Automated Exports
        </button>
      </div>
    </div>
  );
}
