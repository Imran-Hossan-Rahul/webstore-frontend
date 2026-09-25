"use client";
import React from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 2780 },
  { name: "May", value: 1890 },
  { name: "Jun", value: 2390 },
  { name: "Jul", value: 3490 },
  { name: "Aug", value: 4000 },
  { name: "Sep", value: 3000 },
  { name: "Oct", value: 5000 },
  { name: "Nov", value: 6000 },
  { name: "Dec", value: 7000 },
];

export default function RegisterRevenueCard() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Revenue</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Monthly earnings</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400"></div>
      </div>

      <div className="h-[200px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={3}
              dot={false}
              strokeDasharray="4 4"
            />
             <Tooltip 
                contentStyle={{ background: '#333', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
             />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-6">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-1">Current</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">5,878</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium mb-1">Goal</p>
          <p className="text-2xl font-bold text-slate-400">7,000</p>
        </div>
        <div className="text-right">
             <p className="text-xs text-slate-400 font-medium mb-1">Growth</p>
             <p className="text-brand-teal font-bold text-sm">+18%</p>
        </div>
      </div>
      
      <div className="mt-8 text-center"> 
        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Real-time Analytics Dashboard</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Track your performance with live analytics. Monitor views, downloads, revenue, and user growth in real-time.
        </p>
      </div>
    </div>
  );
}
