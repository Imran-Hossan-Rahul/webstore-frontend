"use client";

import React from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";

export default function VisitorAccountPieChart({ data = [] }) {
  const COLORS = ["#3B82F6", "#94A3B8"];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 h-[400px] flex items-center justify-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No Distribution Data</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-none">Account Conversion</h2>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-2">Registered vs Guests</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="90%"
              innerRadius="75%"
              paddingAngle={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={COLORS[index % COLORS.length]} 
                  className="outline-none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0F172A', 
                border: 'none', 
                borderRadius: '12px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              content={({ payload }) => (
                <div className="flex justify-center gap-6 mt-6">
                  {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
