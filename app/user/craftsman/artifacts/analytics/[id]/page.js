"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Globe, User, TrendingUp, ArrowLeft, Download, Eye, ThumbsUp, Share2, BarChart2, MapPin, Clock, LayoutGrid } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from "recharts";
import { api } from "@/utils/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

export default function ArtifactAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const artifactId = params.id;
  
  const [data, setData] = useState(null);
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    if (artifactId) {
      fetchData();
      // Poll analytics every 10s as in the modal
      const interval = setInterval(fetchAnalytics, 10000);
      return () => clearInterval(interval);
    }
  }, [artifactId, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for artifact details and analytics
      const [artifactRes, analyticsRes] = await Promise.all([
        api.get(`/artifact/${artifactId}`),
        api.get(`/artifact/${artifactId}/analytics?range=${timeRange}`)
      ]);
      
      if (artifactRes.success) setArtifact(artifactRes.data);
      if (analyticsRes && analyticsRes.totalViews !== undefined) {
        setData(analyticsRes);
      } else {
        throw new Error("Invalid analytics data");
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/artifact/${artifactId}/analytics?range=${timeRange}`);
      if (res && res.totalViews !== undefined) {
        setData(res);
      }
    } catch (err) {
      console.error("Polling failed:", err);
    }
  };

  const getAxisFormat = (tick) => {
    const date = new Date(tick);
    if (timeRange === '1h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (timeRange === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-t-[#3ea6ff] border-white/10 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center text-slate-400 gap-6 p-4 text-center">
        <p className="text-xl font-medium text-white/80">{error}</p>
        <button 
          onClick={fetchData} 
          className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-all font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#3ea6ff]/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-full transition-all text-slate-400 hover:text-white"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none mb-1">
              {artifact?.title || "Artifact Analytics"}
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Performance Insights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
            {['1h', '24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-slate-500 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-12">
        
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard title="Impressions" value={data.totalImpressions} icon={<Eye size={18} />} color="text-slate-400" />
          <MetricCard title="Total Views" value={data.totalViews} icon={<Eye size={18} />} color="text-[#3ea6ff]" />
          <MetricCard title="Engagement" value={data.totalLikes} icon={<ThumbsUp size={18} />} color="text-[#00C49F]" label="Stars" />
          <MetricCard title="Conversions" value={data.totalDownloads} icon={<Download size={18} />} color="text-[#FFBB28]" label="Downloads" />
          <MetricCard title="Virality" value={data.totalShares} icon={<Share2 size={18} />} color="text-[#FF8042]" label="Shares" />
        </div>

        {/* Main Engagement Chart */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3ea6ff]/10 flex items-center justify-center text-[#3ea6ff]">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Growth & Engagement</h3>
                <p className="text-xs text-slate-500">Visualization of your artifact's reach over time</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3ea6ff]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8884d8]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impressions</span>
               </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.viewsTrend}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3ea6ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3ea6ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.2)" 
                  tickFormatter={getAxisFormat}
                  tick={{fontSize: 10, fontWeight: 700}}
                  minTickGap={30}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  tick={{fontSize: 10, fontWeight: 700}} 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20,20,20,0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    backdropBlur: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '10px', color: '#666', marginBottom: '8px', fontWeight: 'black', textTransform: 'uppercase' }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area 
                  type="monotone" 
                  name="Impressions" 
                  dataKey="impressions" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorImp)" 
                  animationDuration={1000} 
                />
                <Area 
                  type="monotone" 
                  name="Views" 
                  dataKey="views" 
                  stroke="#3ea6ff" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  animationDuration={1000} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Geographical Reach */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00C49F]/10 flex items-center justify-center text-[#00C49F]">
                <Globe size={18} />
              </div>
              Global Distribution
            </h3>
            <div className="h-72 w-full">
              {data.countryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.countryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {data.countryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                  Not enough data for geographical insights
                </div>
              )}
            </div>
          </section>

          {/* User Demographics */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFBB28]/10 flex items-center justify-center text-[#FFBB28]">
                <User size={18} />
              </div>
              Audience Age
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{fontSize: 10, fontWeight: 700}}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    tick={{fontSize: 10, fontWeight: 700}} 
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#FFBB28" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

        </div>

      </main>

      <footer className="py-20 text-center border-t border-white/5 mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
          Advanced Artifact Analytics &copy; 2026
        </p>
      </footer>
    </div>
  );
}

function MetricCard({ title, value, icon, color, label }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[24px] hover:bg-white/[0.04] transition-all group">
      <div className={`flex items-center justify-between mb-4 ${color}`}>
        <div className="text-slate-500 group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {title}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black tracking-tight text-white group-hover:scale-105 transition-transform origin-left">
          {value?.toLocaleString() || 0}
        </span>
        {label && (
          <span className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-tight">
            Total {label}
          </span>
        )}
      </div>
    </div>
  );
}
