"use client";

import React from "react";
import { X, ExternalLink } from "lucide-react";

// --- Generic Modal Wrapper ---
export function DashboardModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-brand-surface rounded-2xl shadow-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        style={{ width: "70vw", height: "70vh" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-xl font-medium text-slate-900 dark:text-white font-sans">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:bg-brand-surface/[0.05] text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Specific Content Tables ---

export function ViewsTable({ artifacts }) {
    // Sort by views descending
    const sorted = [...artifacts].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-brand-cloud sticky top-0 z-10">
          <tr>
            <th className="p-4 rounded-tl-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Artifact Name</th>
            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Views</th>
            <th className="p-4 rounded-tr-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Preview</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {sorted.map((t, i) => (
                <tr key={t._id} className="hover:bg-brand-cloud transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-slate-400 text-xs font-mono w-6">#{i+1}</span>
                        {t.title}
                    </td>
                    <td className="p-4 font-mono text-brand-slate dark:text-slate-300">{t.viewsCount || 0}</td>
                    <td className="p-4 text-right">
                         <a href={`/artifacts/${t._id}`} target="_blank" className="text-brand-blue hover:text-blue-700 inline-flex items-center gap-1 text-sm">
                            View <ExternalLink size={12}/>
                         </a>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function DownloadsTable({ artifacts }) {
    // Sort by downloads descending
    const sorted = [...artifacts].sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0));

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-brand-cloud sticky top-0 z-10">
          <tr>
            <th className="p-4 rounded-tl-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Artifact Name</th>
            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Downloads</th>
            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Price Type</th>
            <th className="p-4 rounded-tr-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Revenue (Est)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {sorted.map((t, i) => (
                <tr key={t._id} className="hover:bg-brand-cloud transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-slate-400 text-xs font-mono w-6">#{i+1}</span>
                        {t.title}
                    </td>
                    <td className="p-4 text-brand-slate dark:text-slate-300 font-mono">{(t.downloadsCount || 0).toLocaleString()}</td>
                     <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium uppercase tracking-widest ${t.priceType === 'paid' ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-brand-surface/[0.05] text-brand-slate dark:text-slate-300'}`}>
                            {t.priceType === 'paid' ? 'Paid' : 'Free'}
                        </span>
                    </td>
                    <td className="p-4 text-right text-slate-900 dark:text-white font-mono font-medium">
                         {t.priceType === 'paid' ? `${((t.downloadsCount || 0) * (t.price || 0)).toFixed(2)} TKNS` : '-'}
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function DetailedCountryTable({ data }) {
    // Data: { country: 'USA', visitors: 100 }
    // Sort by visitors descending
    const sorted = [...data].sort((a,b) => b.visitors - a.visitors);

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead className="bg-brand-cloud sticky top-0 z-10">
          <tr>
            <th className="p-4 rounded-tl-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Country</th>
            <th className="p-4 rounded-tr-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Visitor Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {sorted.map((c, i) => (
                <tr key={i} className="hover:bg-brand-cloud transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white font-sans">{c.country}</td>
                    <td className="p-4 text-right text-brand-slate dark:text-slate-300 font-mono">{c.visitors.toLocaleString()}</td>
                </tr>
            ))}
            {sorted.length === 0 && (
                <tr>
                    <td colSpan={2} className="p-8 text-center text-slate-500 dark:text-slate-400">No country data available</td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}

export function detailedEarningsTable({ earnings }) {
    // This receives the Payout response object ideally, or a list of transactions if available.
    // For now we might only have summary, so we'll show a summary table.
    // If we have 'earningsData' history mock, we can show that too.
    
    // Simulating transaction rows if no specific list is passed
    const rows = [
        { id: '1', date: '2024-08-01', description: 'Payout for July', amount: 5900, status: 'Completed' },
        { id: '2', date: '2024-07-01', description: 'Payout for June', amount: 4800, status: 'Completed' },
        { id: '3', date: '2024-06-01', description: 'Payout for May', amount: 3200, status: 'Completed' },
    ];

  return (
    <div className="w-full">
        <div className="mb-6 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 flex justify-between items-center">
             <div>
                 <p className="text-yellow-800 font-medium font-sans text-sm">Total Lifetime Earnings</p>
                 <h3 className="text-3xl font-medium text-yellow-900 font-mono tracking-tight">{earnings} <span className="text-sm font-sans opacity-60">TKNS</span></h3>
             </div>
             <div className="text-sm text-yellow-700 bg-brand-surface/50 px-4 py-2 rounded-lg">
                 Next Payout: End of Month
             </div>
        </div>

      <h3 className="text-base font-medium mb-4 font-sans text-slate-900 dark:text-white">Payout History</h3>
      <table className="w-full text-left border-collapse">
        <thead className="bg-brand-cloud sticky top-0 z-10">
          <tr>
            <th className="p-4 rounded-tl-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
            <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Description</th>
             <th className="p-4 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
            <th className="p-4 rounded-tr-xl font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-cloud transition-colors">
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-sm">{row.date}</td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white font-sans">{row.description}</td>
                    <td className="p-4">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium uppercase tracking-widest">{row.status}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white font-mono">{row.amount.toLocaleString()} TKNS</td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// Ensure correct export name for the last one
export const EarningsTable = detailedEarningsTable;

