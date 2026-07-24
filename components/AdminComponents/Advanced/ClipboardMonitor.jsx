"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/utils/api';
import { Clipboard, ShieldAlert, FileText, Copy, Trash2, Lock, Search, CheckCircle2 } from "lucide-react";
import { motion } from 'framer-motion';

const ClipboardMonitor = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClipboardEvents();
  }, []);

  const fetchClipboardEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/advanced/clipboard');
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic stats from events
  const stats = useMemo(() => {
    const total = events.length;
    const copies = events.filter(e => e.type === 'copy').length;
    const pastes = events.filter(e => e.type === 'paste').length;
    const highThreats = events.filter(e => e.category === 'High Threat' || e.category === 'PII Detected').length;
    
    // Calculate frequency (simulated based on latest events)
    const frequency = total > 0 ? (total / 24).toFixed(1) : 0;
    
    return { copies, pastes, highThreats, total, frequency };
  }, [events]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Clipboard Forensics</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cross-session interaction monitor</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">GDPR Masking Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-[32px] border border-slate-200/60 dark:border-white/5 overflow-hidden min-h-[400px]">
            {events.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/[0.01] border-b border-slate-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operation</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Snippet</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/[0.02]">
                  {events.map((ev) => (
                    <tr key={ev._id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {ev.type === 'copy' ? <Copy size={12} className="text-blue-500" /> : ev.type === 'paste' ? <Clipboard size={12} className="text-emerald-500" /> : <Trash2 size={12} className="text-rose-500" />}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">{ev.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-600 dark:text-slate-400 truncate max-w-[150px] inline-block">
                          {ev.content}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          ev.category.includes('Threat') || ev.category.includes('PII') 
                            ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
                            : 'text-slate-400 bg-slate-400/5 border-slate-400/10'
                        }`}>
                          {ev.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-tight">{ev.page}</td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-400 text-right uppercase tracking-tighter">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Clipboard size={32} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No Interaction Logged</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Waiting for neural signals...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`bg-gradient-to-br transition-colors duration-500 ${stats.highThreats > 0 ? 'from-rose-500 to-rose-600 shadow-rose-500/20' : 'from-indigo-500 to-indigo-600 shadow-indigo-500/20'} rounded-3xl p-6 text-white shadow-xl`}>
            <ShieldAlert size={32} className="mb-4 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Threat Intelligence</h3>
            <p className="text-xs opacity-90 leading-relaxed mb-4 font-medium">
              {stats.highThreats > 0 
                ? `Clipboard monitoring detected ${stats.highThreats} high-risk exposures in the recent activity logs.`
                : "No critical threats or sensitive data leaks detected in current interaction patterns."
              }
            </p>
            <button className={`w-full py-2.5 bg-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors ${stats.highThreats > 0 ? 'text-rose-600 hover:bg-rose-50' : 'text-indigo-600 hover:bg-indigo-50'}`}>
              Review Security Status
            </button>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Activity Volume</h3>
            <div className="space-y-6">
              <StatItem label="Active Copies" value={stats.copies} icon={Copy} color="blue" />
              <StatItem label="Active Pastes" value={stats.pastes} icon={Clipboard} color="emerald" />
              <StatItem label="Pulse Frequency" value={`${stats.frequency} / hr`} icon={Search} color="purple" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={14} />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
};

export default ClipboardMonitor;
