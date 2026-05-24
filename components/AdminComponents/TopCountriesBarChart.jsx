"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function TopCountriesBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 h-[400px] flex items-center justify-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No Traffic Data</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">Global Traffic</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-2">Top Origin Countries</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={index === 0 ? '#3B82F6' : '#94A3B8'} 
                  fillOpacity={1 - index * 0.15} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
