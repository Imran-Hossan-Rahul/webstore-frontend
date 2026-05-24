"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { 
  Battery, 
  Smartphone, 
  Monitor, 
  Cpu, 
  ShieldCheck,
  Camera,
  Mic,
  MapPin,
  Wifi,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const DeviceIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/advanced/device');
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

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-400">Scanning Hardware...</div>;
  if (!data || !data.hardware) return <div className="h-96 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Device Intelligence Data Unavailable</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Fleet Overview */}
      {data?.fleet && (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Fleet Intelligence</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Analyzing {data.fleet.total} connected devices</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live Fleet Feed</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">OS Distribution</p>
                 <div className="space-y-3">
                    {data.fleet.os.map(os => (
                      <div key={os.name} className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-600 dark:text-slate-300 uppercase tracking-tight">{os.name}</span>
                            <span className="text-slate-900 dark:text-white">{os.count}</span>
                         </div>
                         <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(os.count / data.fleet.total) * 100}%` }}
                              className="h-full bg-indigo-500"
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Browser Distribution</p>
                 <div className="space-y-3">
                    {data.fleet.browser.map(b => (
                      <div key={b.name} className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-600 dark:text-slate-300 uppercase tracking-tight">{b.name}</span>
                            <span className="text-slate-900 dark:text-white">{b.count}</span>
                         </div>
                         <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(b.count / data.fleet.total) * 100}%` }}
                              className="h-full bg-emerald-500"
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Snapshot */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                <Cpu size={24} />
             </div>
             <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Hardware Snapshot</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device Fingerprint</p>
             </div>
          </div>

          <div className="space-y-6">
            <HardwareItem label="CPU Logic Cores" value={data?.hardware?.cores || '0'} />
            <HardwareItem label="Display Resolution" value={data?.hardware?.resolution || 'Unknown'} />
            <HardwareItem label="Operating System" value={data?.hardware?.os || 'Unknown'} />
            <HardwareItem label="Graphics Processor" value={data?.hardware?.gpu || 'Unknown'} />
          </div>
        </div>

        {/* Battery & Health */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Energy & Battery Health</h3>
          <div className="flex flex-col items-center justify-center py-4">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-white/5" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="58" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * (data?.battery?.level || 0)) / 100}
                    className="text-emerald-500" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-bold text-slate-900 dark:text-white">{data?.battery?.level || 0}%</span>
                   <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{data?.battery?.charging ? 'Charging' : 'Discharging'}</span>
                </div>
             </div>
             <div className="mt-8 grid grid-cols-2 gap-8 w-full text-center">
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">State</p>
                   <p className="text-xs font-bold text-slate-900 dark:text-white">{data?.battery?.health || 'Normal'}</p>
                </div>
                <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Temp</p>
                   <p className="text-xs font-bold text-slate-900 dark:text-white">Optimal</p>
                </div>
             </div>
          </div>
        </div>

        {/* Permissions & Security */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Privacy & Permissions</h3>
          <div className="space-y-4">
             {(data?.permissions || []).map((p) => {
               const Icon = p.icon || Smartphone;
               return (
                 <div key={p.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                       <Icon size={14} className="text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{p.name}</span>
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                      p.status === 'granted' ? 'bg-emerald-500/10 text-emerald-500' : p.status === 'denied' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {p.status}
                    </span>
                 </div>
               );
             })}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AdBlock Active</span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{data?.security?.adBlocker ? 'True' : 'False'}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">VPN Tunneling</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{data?.security?.vpnDetected ? 'Detected' : 'Not Detected'}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HardwareItem = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-bold text-slate-900 dark:text-white">{value}</span>
  </div>
);

export default DeviceIntelligence;
