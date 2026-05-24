"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  Wifi, 
  Zap, 
  Activity, 
  Globe, 
  Server,
  Download,
  Upload,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const NetworkSpeedDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/advanced/network');
      if (res.success) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-400 italic">Pinging nodes...</div>;
  if (!data || !data.summary) return <div className="h-96 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Network Performance Data Unavailable</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NetworkStatCard label="Avg. Latency" value={data?.summary?.avgPing || '0ms'} icon={Clock} color="indigo" />
        <NetworkStatCard label="Packet Loss" value={data?.summary?.packetLoss || '0%'} icon={Activity} color="rose" />
        <NetworkStatCard label="Connection Type" value={data?.summary?.connectionType || 'Unknown'} icon={Globe} color="blue" />
        <NetworkStatCard label="Experience Score" value={`${data?.summary?.score || 0}/100`} icon={Zap} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Graph */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Latency & Jitter (ms)</h3>
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
              <span className="text-indigo-600">Ping</span>
              <span className="text-slate-400">Jitter</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.latency || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="ping" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="jitter" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bandwidth Graph */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Throttled Bandwidth (Mbps)</h3>
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest">
              <span className="text-emerald-500">Download</span>
              <span className="text-blue-500">Upload</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.bandwidth || []}>
                <defs>
                  <linearGradient id="gDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.05)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 600}} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Area type="step" dataKey="down" stroke="#10b981" strokeWidth={2} fill="url(#gDown)" />
                <Area type="step" dataKey="up" stroke="#3b82f6" strokeWidth={1} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-white rounded-3xl p-8 text-white dark:text-slate-900 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 dark:bg-slate-900/10 rounded-2xl flex items-center justify-center">
            <Server size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Edge Infrastructure Sync</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Connected to 142 Global Edge Nodes</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Server Response</p>
              <p className="text-lg font-bold tracking-tighter">12ms <span className="text-[10px] text-emerald-400 font-bold ml-1">Excellent</span></p>
           </div>
           <div className="w-[1px] h-10 bg-white/10 dark:bg-slate-900/10" />
           <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">CDN Efficiency</p>
              <p className="text-lg font-bold tracking-tighter">99.8% <span className="text-[10px] text-emerald-400 font-bold ml-1">HIT</span></p>
           </div>
        </div>
      </div>
    </div>
  );
};

const NetworkStatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-600/10",
    rose: "text-rose-600 bg-rose-600/10",
    blue: "text-blue-600 bg-blue-600/10",
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

export default NetworkSpeedDashboard;
