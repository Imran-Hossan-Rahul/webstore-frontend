"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/utils/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50 border-b border-white/5 pb-2">
          {new Date(label).toLocaleString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <div className="space-y-2">
          {payload.sort((a, b) => b.value - a.value).map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{entry.dataKey}</span>
              </div>
              <span className="text-xs font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function UsersActivityAreaChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stats/daily-users?range=${range}`);
        if (res.success) {
          setData(res.stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading && data.length === 0) return (
    <div className="h-[520px] bg-white dark:bg-[#0A0A0A] rounded-2xl flex items-center justify-center border border-slate-200/60 dark:border-white/5">
      <Loader2 className="animate-spin text-slate-400" size={24} />
    </div>
  );

  const chartData = data.length > 0 ? data : [];
  
  const totals = chartData.reduce((acc, item) => ({
    craftsmen: acc.craftsmen + (item.craftsmen || 0),
    patrons: acc.patrons + (item.patrons || 0),
    users: acc.users + (item.users || 0),
    craftsmen: acc.craftsmen + (item.craftsmen || 0),
    visitors: acc.visitors + (item.visitors || 0),
  }), { craftsmen: 0, patrons: 0, users: 0, craftsmen: 0, visitors: 0 });

  const ranges = [
    { id: 'live', label: 'Live' },
    { id: 'hourly', label: 'Hourly' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: 'lifetime', label: 'Lifetime' },
  ];

  const formatXAxis = (dt) => {
    const date = new Date(dt);
    if (range === 'live') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (range === 'hourly') return date.toLocaleTimeString([], { hour: '2-digit' });
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm h-[520px] flex flex-col">
      
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">Growth Dynamics</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> User Acquisition Timeline
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
           {ranges.map((r) => (
             <button 
               key={r.id}
               onClick={() => setRange(r.id)}
               className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                 range === r.id 
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               }`}
             >
               {r.label}
             </button>
           ))}
        </div>
      </div>

      {/* Modern Area Chart */}
      <div className="flex-1 min-h-[250px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <Loader2 className="animate-spin text-indigo-600" size={20} />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCraftsman" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPatron" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCraftsman" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
              tickFormatter={formatXAxis}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            <Area type="monotone" dataKey="visitors" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitor)" animationDuration={1000} />
            <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorUser)" animationDuration={1200} />
            <Area type="monotone" dataKey="craftsmen" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCraftsman)" animationDuration={1400} />
            <Area type="monotone" dataKey="craftsmen" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorCraftsman)" animationDuration={1600} />
            <Area type="monotone" dataKey="patrons" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPatron)" animationDuration={1800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Legend/Summary */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex gap-6 min-w-max">
          <LegendItem color="#4F46E5" label="Craftsmen" value={totals.craftsmen} />
          <LegendItem color="#94A3B8" label="patrons" value={totals.patrons} />
          <LegendItem color="#10B981" label="Users" value={totals.users} />
          <LegendItem color="#F59E0B" label="Craftsmen" value={totals.craftsmen} />
          <LegendItem color="#F43F5E" label="Visitors" value={totals.visitors} />
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/5 text-blue-600 rounded-lg border border-indigo-600/10 ml-4">
           <TrendingUp size={12} />
           <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Consistent Growth</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
       <div className="w-1 h-5 rounded-full" style={{ backgroundColor: color }} />
       <div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-1">{value.toLocaleString()}</p>
       </div>
    </div>
  );
}

