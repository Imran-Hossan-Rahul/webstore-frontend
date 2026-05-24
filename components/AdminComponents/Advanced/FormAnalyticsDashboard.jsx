// components/AdminComponents/Advanced/FormAnalyticsDashboard.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { FileText, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';

export default function FormAnalyticsDashboard({ formId }) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [formId]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/analytics/forms/${formId}`);
      if (response.success) setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch form analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5">
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Form Analytics</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{analytics?.formName}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.completionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Abandonment</p>
              <p className="text-2xl font-bold text-red-600">{analytics?.abandonmentRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-slate-400" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Starts</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.totalStarts?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Completions</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{analytics?.completions?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-red-600" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Abandonments</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{analytics?.abandonments?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-slate-400" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Time</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.avgCompletionTime}s</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Field-Level Analysis</h4>
          {analytics?.fields?.map((field, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{field.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{field.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interactions</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{field.interactions?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Avg Time</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{field.avgTimeSpent}s</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Drop-off</p>
                    <p className={`text-sm font-bold ${field.dropOffRate > 20 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                      {field.dropOffRate}%
                    </p>
                  </div>
                </div>
              </div>
              
              {field.dropOffRate > 20 && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-900 dark:text-red-400">High Drop-off Rate</p>
                      <p className="text-[10px] text-red-700 dark:text-red-500 mt-1">
                        {field.dropOffReasons?.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Completion Progress</span>
                  <span className="font-bold text-slate-900 dark:text-white">{field.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2">
                  <div className={`h-2 rounded-full ${field.completionRate >= 80 ? 'bg-emerald-600' : field.completionRate >= 50 ? 'bg-amber-600' : 'bg-red-600'}`} style={{ width: `${field.completionRate}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-white/5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Top Abandonment Points</h4>
        <div className="grid grid-cols-3 gap-4">
          {analytics?.topAbandonmentPoints?.map((point, index) => (
            <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/20">
              <p className="text-xs font-bold text-red-900 dark:text-red-400">{point.fieldName}</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{point.rate}%</p>
              <p className="text-[10px] text-red-700 dark:text-red-500 mt-1">{point.count} abandonments</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
