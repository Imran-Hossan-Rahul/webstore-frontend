"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  Activity, 
  Monitor,
  MousePointer2,
  Timer,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';

const TabActivityDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTabData();
  }, []);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/advanced/tabs');
      if (res.success) {
        setData(res.data);
      } else {
        // Fallback or empty state
        setData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-400">Syncing Tab Intelligence...</div>;
  if (!data || !data.metrics) return <div className="h-96 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Tab Activity Data Unavailable</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TabStatCard label="Avg. Focus Time" value={data?.metrics?.avgSessionDuration || '0m'} icon={Clock} color="indigo" />
        <TabStatCard label="Tab Switches" value={data?.metrics?.totalTabSwitches || 0} icon={Activity} color="rose" />
        <TabStatCard label="Distraction Index" value={data?.metrics?.distractionIndex || 'None'} icon={EyeOff} color="amber" />
        <TabStatCard label="Retention Score" value={`${data?.metrics?.retentionScore || 0}%`} icon={Monitor} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus Distribution */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Attention Distribution</h3>
          <div className="flex items-center gap-12">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={data?.attention || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.attention || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 flex-1">
              {(data?.attention || []).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Focus Pattern */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Focus vs. Distraction Timeline</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourly || []} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.05)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                />
                <Bar dataKey="focus" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="blur" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-indigo-600" /> High Attention
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-rose-500" /> Distracted/Hidden
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabStatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-600/10",
    rose: "text-rose-600 bg-rose-600/10",
    amber: "text-amber-600 bg-amber-600/10",
    emerald: "text-emerald-600 bg-emerald-600/10",
  };
  return (
    <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
    </div>
  );
};

export default TabActivityDashboard;
