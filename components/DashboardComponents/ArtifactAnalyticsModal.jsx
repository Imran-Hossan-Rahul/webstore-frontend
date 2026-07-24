"use client";
import React, { useEffect, useState } from "react";
import { X, Calendar, Globe, User, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { api } from "@/utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export default function ArtifactAnalyticsModal({ isOpen, onClose, artifactId, title }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (isOpen && artifactId) {
      fetchAnalytics();
    }
  }, [isOpen, artifactId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/artifact/${artifactId}/analytics?range=${timeRange}`);
      if (res && res.totalViews !== undefined) {
        setData(res);
      } else {
        throw new Error("Invalid analytics data");
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const getAxisFormat = (tick) => {
      const date = new Date(tick);
      if (timeRange === '1h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (timeRange === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#1f1f1f] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl border border-[#3e3e3e] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#3e3e3e]">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-[#3ea6ff]" size={24} />
              Analytics: {title || "Artifact Stats"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Real-time performance insights</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#303030] rounded-full text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          
          {/* Controls */}
          <div className="flex justify-end mb-6">
              <div className="bg-[#282828] p-1 rounded-lg border border-[#3e3e3e] flex gap-1">
                  {['1h', '24h', '7d', '30d'].map((range) => (
                      <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium uppercase transition-all ${
                              timeRange === range 
                              ? 'bg-[#3ea6ff] text-[#0f0f0f] shadow-md' 
                              : 'text-slate-400 hover:text-gray-200 hover:bg-[#333]'
                          }`}
                      >
                          {range}
                      </button>
                  ))}
              </div>
          </div>

          {loading ? (
             <div className="h-96 flex items-center justify-center">
               <div className="animate-spin w-10 h-10 border-4 border-t-[#3ea6ff] border-slate-600 rounded-full"></div>
             </div>
          ) : error ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
               <p className="text-red-400">{error.message || error}</p>
               <button onClick={fetchAnalytics} className="px-4 py-2 bg-[#303030] rounded hover:bg-[#3e3e3e] text-white">Retry</button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e]">
                    <div className="text-slate-400 text-xs mb-1">Impressions</div>
                    <div className="text-xl font-bold text-white">{data.totalImpressions?.toLocaleString() || 0}</div>
                 </div>
                 <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e]">
                    <div className="text-slate-400 text-xs mb-1">Views</div>
                    <div className="text-xl font-bold text-[#3ea6ff]">{data.totalViews.toLocaleString()}</div>
                 </div>
                 <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e]">
                    <div className="text-slate-400 text-xs mb-1">Stars</div>
                    <div className="text-xl font-bold text-[#00C49F]">{data.totalLikes?.toLocaleString() || 0}</div>
                 </div>
                 <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e]">
                    <div className="text-slate-400 text-xs mb-1">Downloads</div>
                    <div className="text-xl font-bold text-[#FFBB28]">{data.totalDownloads?.toLocaleString() || 0}</div>
                 </div>
                 <div className="bg-[#282828] p-4 rounded-lg border border-[#3e3e3e]">
                    <div className="text-slate-400 text-xs mb-1">Shares</div>
                    <div className="text-xl font-bold text-[#FF8042]">{data.totalShares?.toLocaleString() || 0}</div>
                 </div>
              </div>

              {/* Multi-Line Trend Chart */}
              <div className="bg-[#282828] p-6 rounded-lg border border-[#3e3e3e]">
                 <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Calendar size={18} className="text-[#3ea6ff]" /> 
                    Engagement Trend
                 </h3>
                 <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.viewsTrend}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3ea6ff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3ea6ff" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FFBB28" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            tickFormatter={getAxisFormat}
                            tick={{fontSize: 12}}
                            minTickGap={timeRange === '1h' ? 5 : timeRange === '24h' ? 20 : 30}
                            interval="preserveStartEnd"
                        />
                        <YAxis stroke="#666" tick={{fontSize: 12}} allowDecimals={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e', color: '#fff' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                        
                        <Area type="monotone" name="Impressions" dataKey="impressions" stroke="#8884d8" fillOpacity={1} fill="url(#colorImp)" animationDuration={500} />
                        <Area type="monotone" name="Views" dataKey="views" stroke="#3ea6ff" fillOpacity={1} fill="url(#colorViews)" animationDuration={500} />
                        <Area type="monotone" name="Stars" dataKey="likes" stroke="#00C49F" fillOpacity={1} fill="url(#colorLikes)" animationDuration={500} />
                        <Area type="monotone" name="Downloads" dataKey="downloads" stroke="#FFBB28" fillOpacity={1} fill="url(#colorDownloads)" animationDuration={500} />
                        <Area type="monotone" name="Shares" dataKey="shares" stroke="#FF8042" fill="none" strokeWidth={2} animationDuration={500} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Country Distribution */}
                 <div className="bg-[#282828] p-6 rounded-lg border border-[#3e3e3e]">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Globe size={18} className="text-[#00C49F]" />
                        Top Countries
                    </h3>
                    <div className="h-64 w-full flex items-center justify-center">
                        {data.countryDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.countryDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.countryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                         contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e', color: '#fff' }}
                                    />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{color: '#ccc'}} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500">No country data yet</p>
                        )}
                    </div>
                 </div>

                 {/* Age Distribution */}
                 <div className="bg-[#282828] p-6 rounded-lg border border-[#3e3e3e]">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <User size={18} className="text-[#FFBB28]" />
                        Age Demographics
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.ageDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                                <YAxis stroke="#666" tick={{fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#3e3e3e', color: '#fff' }}
                                    cursor={{fill: '#333'}}
                                />
                                <Bar dataKey="value" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

