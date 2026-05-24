"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DeviceStatsChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 h-[400px] flex items-center justify-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No Browser Data</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">Browser Distribution</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-2">Platform Compatibility</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="_id" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={index === 0 ? '#3B82F6' : '#94A3B8'} 
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
