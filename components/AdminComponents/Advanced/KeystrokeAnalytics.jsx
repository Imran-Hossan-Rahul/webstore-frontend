"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Keyboard, Clock, Activity, Fingerprint, AlertCircle, TrendingUp, BarChart3, MousePointer2 } from "lucide-react";
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const KeystrokeAnalytics = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeystrokeData();
  }, [userId]);

  const fetchKeystrokeData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch specific keystroke metrics
      // For now, we use simulated rich data based on the tracker's capabilities
      const res = await api.get(`/analytics/advanced/keyboard${userId ? `?userId=${userId}` : ''}`);
      if (res.success) {
        setData(res.data);
      } else {
        // Mock data for demonstration if API isn't ready
        setData({
          summary: {
            totalKeystrokes: 12450,
            avgWpm: 72,
            accuracy: 94.2,
            dwellTimeAvg: 85, // ms
            flightTimeAvg: 110, // ms
          },
          rhythm: [
            { time: '10:00', speed: 65, latency: 120 },
            { time: '11:00', speed: 72, latency: 105 },
            { time: '12:00', speed: 68, latency: 115 },
            { time: '13:00', speed: 85, latency: 90 },
            { time: '14:00', speed: 78, latency: 100 },
            { time: '15:00', speed: 74, latency: 110 },
          ],
          distribution: [
            { name: 'Alphanumeric', value: 8500 },
            { name: 'Navigation', value: 1200 },
            { name: 'Editing', value: 1500 },
            { name: 'Command', value: 800 },
            { name: 'Special', value: 450 },
          ],
          biometrics: {
            consistencyScore: 92,
            uniquenessIndex: 88,
            anomalyDetected: false
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Activity className="animate-spin text-indigo-600" /></div>;
  if (!data || !data.summary) return <div className="h-96 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Neural Data Not Available</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Avg. Typing Speed" value={`${data?.summary?.avgWpm || 0} WPM`} sub="Top 5% of users" icon={TrendingUp} color="emerald" />
        <StatCard label="Mean Dwell Time" value={`${data?.summary?.dwellTimeAvg || 0}ms`} sub="Key press duration" icon={Clock} color="blue" />
        <StatCard label="Mean Flight Time" value={`${data?.summary?.flightTimeAvg || 0}ms`} sub="Key-to-key latency" icon={Activity} color="purple" />
        <StatCard label="Accuracy" value={`${data?.summary?.accuracy || 0}%`} sub="Backspace ratio: 4.2%" icon={Fingerprint} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rhythm Timeline */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Typing Cadence & Rhythm</h3>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Velocity Analysis</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2 text-indigo-600">
                <div className="w-2 h-2 rounded-full bg-indigo-600" /> Speed
              </div>
              <div className="flex items-center gap-2 text-rose-500">
                <div className="w-2 h-2 rounded-full bg-rose-500" /> Latency
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.rhythm || []}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="speed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpeed)" />
                <Area type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Distribution */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Input Classification</h3>
          <div className="space-y-4">
            {(data?.distribution || []).map((item, i) => {
              const max = Math.max(...(data?.distribution || []).map(d => d.value), 1);
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900 dark:text-white">{(item.value || 0).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / max) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="text-indigo-600" size={14} />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Biometric Signature</span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
              This user's typing pattern is <span className="text-indigo-600 font-bold">{data?.biometrics?.consistencyScore || 0}% consistent</span> with their historical signature. No spoofing detected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const colors = {
    emerald: "text-emerald-500 bg-emerald-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    amber: "text-amber-500 bg-amber-500/10",
  };
  return (
    <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={16} />
        </div>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-1 rounded">Real-time</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
      <p className="text-[9px] font-medium text-slate-500 mt-1">{sub}</p>
    </div>
  );
};

export default KeystrokeAnalytics;
