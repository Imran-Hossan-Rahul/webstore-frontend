// components/AdminComponents/Advanced/SessionReplayList.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Play, Clock, User, Monitor, AlertCircle, CheckCircle2, Info, Search, Filter, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionReplayList({ onSelectSession }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, [pagination.page, filter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/advanced/replay?page=${pagination.page}&filter=${filter}`);
      if (response.success) {
        setSessions(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Neural Session Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A] p-6 rounded-2xl border border-slate-200/60 dark:border-white/5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Session Intelligence</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Forensic user behavior replay</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'converted', 'errors', 'frustrated'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPagination({ ...pagination, page: 1 }); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Session List */}
      <div className="grid grid-cols-1 gap-4">
        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-12 text-center">
            <Info className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Sessions Found</h3>
            <p className="text-sm text-slate-400 mt-2">Try adjusting your filters or wait for new user activity.</p>
          </div>
        ) : (
          sessions.map((session, index) => (
            <motion.div
              key={session.sessionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectSession(session.sessionId)}
              className="bg-white dark:bg-[#0A0A0A] p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-500/10 transition-all" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Play size={20} className={session.recording.status === 'recording' ? 'animate-pulse text-red-500' : ''} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {session.sessionId.substring(0, 8)}...
                      </span>
                      {session.analysis.converted && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-tighter rounded-full border border-emerald-500/20">
                          Converted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.recording.startTime).toLocaleString()}</span>
                      <span className="flex items-center gap-1">
                        <User size={12} /> 
                        {session.userId ? (session.userId.name || session.userId.email || 'Identified User') : 'Guest'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">{(session.recording.duration / 1000).toFixed(1)}s</p>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl border text-center ${getEngagementColor(session.analysis.engagementScore)}`}>
                    <p className="text-[8px] font-bold uppercase tracking-widest leading-none mb-1 opacity-70">Engagement</p>
                    <p className="text-xs font-bold tabular-nums">{session.analysis.engagementScore}%</p>
                  </div>

                  <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-indigo-500/20 ml-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Replay</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>

              {/* Progress Bar (Visual only for now) */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 w-0 group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="px-6 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="px-6 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
