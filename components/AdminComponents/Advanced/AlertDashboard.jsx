// components/AdminComponents/Advanced/AlertDashboard.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Bell, AlertTriangle, CheckCircle, Clock, Plus, Loader2 } from 'lucide-react';

export default function AlertDashboard() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const response = await api.get(`/alerts?status=${filter === 'all' ? '' : filter}`);
      if (response.success) setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600/10 text-red-600 border-red-600/20';
      case 'high': return 'bg-orange-600/10 text-orange-600 border-orange-600/20';
      case 'medium': return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      case 'low': return 'bg-blue-600/10 text-blue-600 border-blue-600/20';
      default: return 'bg-slate-600/10 text-slate-600 border-slate-600/20';
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Alert Management</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{alerts.length} alerts configured</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={16} />
            Create Alert
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['all', 'active', 'paused', 'disabled'].map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors ${filter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.04]'}`}>
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert._id} className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alert.name}</h4>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${alert.status === 'active' ? 'bg-emerald-600/10 text-emerald-600' : 'bg-slate-600/10 text-slate-600'}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    {alert.type} • {alert.config.metric} {alert.config.condition} {alert.config.threshold}
                  </p>
                  <div className="flex items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      Last triggered: {alert.lastTriggered ? new Date(alert.lastTriggered).toLocaleString() : 'Never'}
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Triggered {alert.triggerCount} times
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600/10 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>

              {alert.history?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Recent Triggers</p>
                  <div className="space-y-2">
                    {alert.history.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{item.message}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{new Date(item.triggeredAt).toLocaleString()}</span>
                          {item.acknowledged ? (
                            <CheckCircle size={14} className="text-emerald-600" />
                          ) : (
                            <button className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 hover:underline">
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
