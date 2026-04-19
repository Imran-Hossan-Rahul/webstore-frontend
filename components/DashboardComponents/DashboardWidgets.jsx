"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Move, ZoomIn, ZoomOut, Maximize2, MoreVertical, Calendar } from "lucide-react";

// --- Colors ---
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// --- Widget 1: Total Views (Area Chart) ---
export function ViewsWidget({ title, totalViews, data, onClick }) {
  const [timeRange, setTimeRange] = React.useState('7days');
  
  const getDisplayData = (data, range) => {
    if (!data || data.length === 0) {
      return [];
    }
    const now = new Date();
    
    if (range === '24hours') {
      // Show last 24 hours
      return data.filter(item => {
        const itemDate = new Date(item.date);
        return (now - itemDate) <= 24 * 60 * 60 * 1000;
      }).slice(-24);
    } else if (range === '7days') {
      // Show last 7 days
      return data.slice(-7);
    } else {
      // Show all data (last 30 days)
      return data;
    }
  };

  const displayData = getDisplayData(data || [], timeRange);
  

  return (
    <div 
        className="bg-white rounded-[26px] p-6 shadow-sm border border-gray-100 h-full relative font-sans flex flex-col cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md group"
    >
      <div className="flex justify-between items-start mb-4">
        <div onClick={onClick}>
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-3xl font-bold text-black mt-1">{totalViews}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Total Views</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => {
              e.stopPropagation();
              setTimeRange(e.target.value);
            }}
            className="text-xs px-2 py-1 rounded border border-gray-200 bg-white text-gray-600 cursor-pointer hover:border-blue-400 focus:outline-none focus:border-blue-500"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[200px]" onClick={onClick}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fontSize: 12, fill: '#9CA3AF'}} 
              tickFormatter={(value) => {
                if (!value) return '';
                const date = new Date(value);
                if (isNaN(date.getTime())) return '';
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis hide />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }}
            />
            <Area type="monotone" dataKey="views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Widget 2: Downloads History (Bar Chart) ---
export function DownloadsWidget({ title, totalDownloads, data, onClick }) {
  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-[26px] p-6 shadow-sm border border-gray-100 h-full relative font-sans flex flex-col cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md group"
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                 <h3 className="font-semibold text-lg text-gray-800 group-hover:text-green-600 transition-colors">{title}</h3>
                 <p className="text-3xl font-bold text-black mt-1">{totalDownloads}</p>
                 <p className="text-xs text-gray-400 uppercase tracking-wide">Total Downloads</p>
            </div>
             <button className="p-2 rounded-full hover:bg-gray-50 border border-gray-200 text-gray-600">
                <MoreVertical size={16} />
            </button>
        </div>
        
        <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                    <Tooltip 
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="downloads" fill="#4ade80" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}

// --- Widget 3: Country Analytics (Horizontal Bar or List) ---
export function CountryWidget({ title, data, onClick }) {
  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-[26px] p-6 shadow-sm border border-gray-100 h-full relative font-sans flex flex-col cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md group"
    >
       <div className="flex justify-between items-start mb-2">
           <h3 className="font-semibold text-lg text-gray-800 group-hover:text-yellow-600 transition-colors">{title}</h3>
            <button className="p-2 rounded-full hover:bg-gray-50 border border-gray-200 text-gray-600">
                <MoreVertical size={16} />
            </button>
      </div>
      
      <div className="flex-1 w-full min-h-[200px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="country" width={80} tick={{ fontSize: 12, fill: '#4B5563', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="visitors" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={20}>
                </Bar>
            </BarChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Widget 4: Earnings (Trend/Line Chart) ---
export function EarningsWidget({ title, totalEarnings, data, onClick }) {
  return (
    <div 
        onClick={onClick}
        className="bg-white rounded-[26px] p-6 shadow-sm border border-gray-100 h-full relative font-sans flex flex-col cursor-pointer transition-transform hover:scale-[1.01] hover:shadow-md group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
            <h3 className="font-semibold text-lg text-gray-800 group-hover:text-red-600 transition-colors">{title}</h3>
            <p className="text-3xl font-bold text-black mt-1">{totalEarnings}</p>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-50 border border-gray-200 text-gray-600">
            <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex-1 h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
             <defs>
                 <linearGradient id="earningsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
             </defs>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="amount" stroke="url(#earningsGradient)" fill="url(#earningsGradient)" fillOpacity={0.1} strokeWidth={4} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
