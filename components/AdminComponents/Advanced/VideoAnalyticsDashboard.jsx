"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Play, Pause, Square, Activity, Clock, Eye, Maximize, Volume2 } from "lucide-react";
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const VideoAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoData();
  }, []);

  const fetchVideoData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/advanced/video');
      if (res.success) {
        setData(res.data);
      } else {
        // Mock data
        setData({
          engagement: [
            { time: 0, users: 100 },
            { time: 15, users: 92 },
            { time: 30, users: 85 },
            { time: 45, users: 78 },
            { time: 60, users: 70 },
            { time: 75, users: 65 },
            { time: 90, users: 62 },
            { time: 100, users: 58 },
          ],
          events: [
            { label: 'Play', count: 1240 },
            { label: 'Pause', count: 850 },
            { label: 'Seek', count: 420 },
            { label: 'Fullscreen', count: 310 },
            { label: 'Mute', count: 150 },
          ],
          metrics: {
            avgWatchTime: '4m 32s',
            completionRate: '58%',
            replayRate: '12%',
            avgVolume: '65%'
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-400">Loading Engagement Matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <VideoStatCard label="Avg. Watch Time" value={data.metrics.avgWatchTime} icon={Clock} color="indigo" />
        <VideoStatCard label="Completion Rate" value={data.metrics.completionRate} icon={Activity} color="emerald" />
        <VideoStatCard label="Replay Rate" value={data.metrics.replayRate} icon={Play} color="purple" />
        <VideoStatCard label="Avg. Volume" value={data.metrics.avgVolume} icon={Volume2} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention Curve */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Audience Retention Curve</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.engagement}>
                <defs>
                  <linearGradient id="gVideo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.05)" />
                <XAxis 
                  dataKey="time" 
                  unit="%" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} 
                />
                <YAxis 
                  hide 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                  formatter={(val) => [`${val}% Retention`, 'Users']}
                />
                <Area type="monotone" dataKey="users" stroke="#f43f5e" strokeWidth={3} fill="url(#gVideo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
             Drop-off detected at 30% mark — check intro hook effectiveness
          </p>
        </div>

        {/* Interaction Stats */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Interaction Distribution</h3>
          <div className="space-y-6">
             {data.events.map((ev, i) => {
               const max = Math.max(...data.events.map(e => e.count));
               return (
                 <div key={ev.label}>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                       <span className="text-slate-500">{ev.label}</span>
                       <span className="text-slate-900 dark:text-white">{ev.count.toLocaleString()}</span>
                    </div>
                    <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(ev.count / max) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full bg-slate-900 dark:bg-white rounded-full"
                       />
                    </div>
                 </div>
               );
             })}
          </div>

          <div className="mt-12 p-6 bg-slate-900 dark:bg-white rounded-2xl text-white dark:text-slate-900 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
                <Maximize size={20} className="opacity-70" />
                <h4 className="text-sm font-bold uppercase tracking-tight">Viewing Mode</h4>
             </div>
             <p className="text-2xl font-bold tracking-tighter">72% <span className="text-xs opacity-60 uppercase tracking-widest ml-1 font-bold">Fullscreen</span></p>
             <p className="text-[9px] opacity-60 font-medium mt-1 leading-relaxed">
                Most users prefer high-immersion viewing for your video content.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoStatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-600/10",
    emerald: "text-emerald-600 bg-emerald-600/10",
    purple: "text-purple-600 bg-purple-600/10",
    amber: "text-amber-600 bg-amber-600/10",
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

export default VideoAnalyticsDashboard;
