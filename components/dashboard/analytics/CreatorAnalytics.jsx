"use client";
import React, { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/utils/api';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, Eye, Download, Share2, Globe, Clock, Calendar, BarChart2, Star } from "lucide-react";

const fetcher = async (url) => {
    const res = await api.get(url);
    if (!res.success) throw new Error("Failed to fetch");
    return res.data;
};

// Colors for charts
const COLORS = ['#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function CraftsmanAnalytics() {
    const [timeRange, setTimeRange] = useState('6m'); // '7d', '30d', '6m'

    // Fetch Engineer History (Monthly/Daily views)
    const { data: historyData, isLoading: historyLoading } = useSWR('/analytics/engineer-history', fetcher);
    // Fetch Basic User Analytics (Demographics, etc.)
    const { data: publicStats, isLoading: publicLoading } = useSWR('/analytics/users', fetcher);

    // Prepare data
    const chartData = historyData || [];
    const devices = publicStats?.devices || [];
    const countries = publicStats?.countries || [];

    const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
        <div className="bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden transition-all hover:border-slate-200 dark:hover:border-white/10">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-5 text-')}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                        <TrendingUp size={10} /> {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {value}
                </p>
            </div>
        </div>
    );

    if (historyLoading || publicLoading) {
        return (
            <div className="w-full max-w-6xl animate-pulse p-6">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
                </div>
                <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl mb-8" />
            </div>
        );
    }

    // Calculate totals from history
    const totalViews = chartData.reduce((acc, curr) => acc + (curr.views || 0), 0);

    return (
        <div className="w-full max-w-6xl pt-8 px-4 sm:px-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BarChart2 className="w-8 h-8 text-pink-500" />
                        Craftsman Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Track your performance and understand your audience
                    </p>
                </div>
                
                {/* Time Range Selector */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {['7d', '30d', '6m'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                timeRange === range 
                                    ? 'bg-white dark:bg-black text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 6 Months'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Views" 
                    value={totalViews.toLocaleString()} 
                    icon={Eye} 
                    colorClass="bg-indigo-600" 
                    trend="+12%"
                />
                <StatCard 
                    title="Total Visitors" 
                    value={(publicStats?.totalVisitors || 0).toLocaleString()} 
                    icon={Users} 
                    colorClass="bg-pink-500" 
                    trend="+8%"
                />
                <StatCard 
                    title="New Visitors" 
                    value={(publicStats?.newVisitors || 0).toLocaleString()} 
                    icon={TrendingUp} 
                    colorClass="bg-emerald-500" 
                />
                <StatCard 
                    title="Returning" 
                    value={(publicStats?.returningVisitors || 0).toLocaleString()} 
                    icon={Clock} 
                    colorClass="bg-purple-500" 
                />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Views Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Engagement Trend</h2>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#6B7280' }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', background: '#111827', color: '#fff' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#EC4899" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                No view data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Device Breakdown</h2>
                    <div className="flex-1 min-h-[250px]">
                        {devices.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={devices}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {devices.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', background: '#111827', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                No device data
                            </div>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {devices.map((device, index) => (
                            <div key={device._id} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-sm text-slate-600 dark:text-gray-300 truncate">{device._id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Audience Demographics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Top Countries */}
                 <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-600" />
                        Top Countries
                    </h2>
                    <div className="space-y-4">
                        {countries.length > 0 ? countries.slice(0, 5).map((country, idx) => {
                            const maxCount = Math.max(...countries.map(c => c.count));
                            const percent = (country.count / maxCount) * 100;
                            return (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700 dark:text-gray-300">{country._id}</span>
                                        <span className="text-slate-500">{country.count} visitors</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-slate-400 text-sm">No country data available.</div>
                        )}
                    </div>
                 </div>
            </div>

        </div>
    );
}

