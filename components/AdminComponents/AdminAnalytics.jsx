"use client";

// AdminAnalytics.jsx — World-class Analytics Intelligence Dashboard
// 13+ charts covering every dimension of platform behavior

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, Filler, Legend
} from 'recharts';
import {
  TrendingUp, Users, Globe, Monitor, Smartphone, Clock,
  MousePointer2, ArrowRight, Loader2, ChevronUp, ChevronDown,
  AlertCircle, Zap, Activity, BarChart3, Map, Filter, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

const PALETTE = {
  indigo: '#6366f1',
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#a855f7',
  teal: '#14b8a6',
  slate: '#64748b',
};

const CHART_COLORS = Object.values(PALETTE);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs font-bold text-slate-900 dark:text-white">{p.value?.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 uppercase tracking-widest">{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [data, setData] = useState({
    dailyStats: null,
    userAnalysis: null,
    hourlyTraffic: null,
    featureUsage: null,
    funnel: null,
    countries: null,
    devices: null,
    pageviews: null,
    eventStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('traffic');
  const [timeRange, setTimeRange] = useState('30d'); // 'live', '7d', '30d'

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get(`/stats/daily-users?range=${timeRange}`),
        api.get('/stats/user-analysis'),
        api.get('/stats/hourly-traffic'),
        api.get('/stats/feature-usage'),
        api.get('/stats/funnel'),
        api.get('/stats/countries/all'),
        api.get('/stats/visitor-devices'),
        api.get('/stats/pageviews'),
        api.get('/stats/event-stats'),
      ]);

      const [dailyStats, userAnalysis, hourlyTraffic, featureUsage, funnel, countries, devices, pageviews, eventStats] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      setData({ dailyStats, userAnalysis, hourlyTraffic, featureUsage, funnel, countries, devices, pageviews, eventStats });
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading Analytics Intelligence</p>
      </div>
    );
  }

  const sections = [
    { id: 'traffic', label: 'Traffic' },
    { id: 'audience', label: 'Audience' },
    { id: 'behavior', label: 'Behavior' },
    { id: 'platform', label: 'Platform' },
  ];

  // Build daily sessions chart data
  const dailyChartData = data.dailyStats
    ? data.dailyStats.dates?.map((date, i) => {
        const d = new Date(date);
        const label = timeRange === 'live' 
          ? d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
          : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
        return {
          date: label,
          sessions: data.dailyStats.totalSessions?.[i] || 0,
          pageviews: data.dailyStats.totalPageViews?.[i] || 0,
        };
      })
    : [];

  // Hourly traffic
  const hourlyData = data.hourlyTraffic?.data || [];

  // Device data
  const deviceData = data.devices?.data?.map(d => ({
    name: d.device || 'Unknown',
    value: d.count,
    percent: parseFloat(d.percent),
  })) || [];

  // Country data
  const countryData = (data.countries?.data || []).slice(0, 10).map(c => ({
    name: c.country || 'Unknown',
    value: c.count,
    percent: parseFloat(c.percent),
  }));

  // Feature usage
  const featureData = data.featureUsage?.data || [];

  // Event stats
  const eventData = (data.eventStats?.eventStats || []).slice(0, 8).map(e => ({
    name: e._id?.replace(/_/g, ' ') || 'Other',
    value: e.total,
  }));

  // Funnel
  const funnelData = data.funnel?.data || [];

  // Browser stats from userAnalysis
  const browserData = (data.userAnalysis?.browsers || []).map(b => ({
    name: b._id || 'Unknown',
    value: b.count,
  }));

  // OS stats
  const osData = (data.userAnalysis?.osStats || []).map(o => ({
    name: o._id || 'Unknown',
    value: o.count,
  }));

  // Top pages
  const pageData = (data.pageviews?.data || []).slice(0, 10).map(p => ({
    name: p._id || '/',
    views: p.views,
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-white/5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em]">Platform Intelligence</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Behavioral Analytics & Forensic Insights</p>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/[0.02] p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/5 w-fit shadow-inner">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeSection === s.id
                ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/5'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ===== TRAFFIC SECTION ===== */}
      {activeSection === 'traffic' && (
        <div className="space-y-8">
          {/* Sessions vs Pageviews — Area Chart */}
          <ChartCard 
            title="Sessions vs Pageviews" 
            subtitle={`Visualizing traffic patterns for range: ${timeRange === 'live' ? 'Real-time' : timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Lifetime'}`}
            action={
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-sm">
                {[
                  { id: 'live', label: 'Live' },
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: 'all', label: 'All' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setTimeRange(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all duration-300 ${
                      timeRange === r.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
                <div className="w-[1px] h-3 bg-slate-200 dark:bg-white/10 mx-1" />
                <button onClick={fetchAllAnalytics} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            }
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.indigo} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PALETTE.indigo} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.emerald} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={PALETTE.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke={PALETTE.indigo} strokeWidth={2} fill="url(#gSessions)" dot={false} />
                <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke={PALETTE.emerald} strokeWidth={2} fill="url(#gPageviews)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Hourly Traffic */}
          <ChartCard title="Hourly Traffic Pattern" subtitle="Last 7 days — busiest hours highlighted">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourlyData} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 8, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                  {hourlyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count === Math.max(...hourlyData.map(h => h.count))
                        ? PALETTE.indigo
                        : entry.count > (Math.max(...hourlyData.map(h => h.count)) * 0.6)
                        ? PALETTE.blue
                        : 'rgba(148,163,184,0.2)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Pages */}
          <ChartCard title="Top Pages" subtitle="Most visited paths">
            <div className="space-y-3">
              {pageData.map((p, i) => {
                const max = Math.max(...pageData.map(x => x.views));
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[9px] font-bold text-slate-400 w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.name}</span>
                        <span className="text-[10px] font-bold text-slate-500">{p.views?.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(p.views / max) * 100}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="h-full bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ===== AUDIENCE SECTION ===== */}
      {activeSection === 'audience' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Device Donut */}
            <ChartCard title="Device Breakdown" subtitle="Desktop · Mobile · Tablet">
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {deviceData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{d.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white">{d.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Browser Pie */}
            <ChartCard title="Browser Distribution" subtitle="Chrome · Firefox · Safari · Others">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={browserData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {browserData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top Countries Bar */}
          <ChartCard title="Geographic Distribution" subtitle="Top countries by visitor count">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={countryData} layout="vertical" barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Visitors" radius={[0, 6, 6, 0]}>
                  {countryData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? PALETTE.indigo : i === 1 ? PALETTE.blue : 'rgba(148,163,184,0.3)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* OS Stats */}
          <ChartCard title="Operating System Breakdown" subtitle="Win · Mac · iOS · Android · Linux">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={osData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Users" fill={PALETTE.purple} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ===== BEHAVIOR SECTION ===== */}
      {activeSection === 'behavior' && (
        <div className="space-y-8">
          {/* Conversion Funnel */}
          <ChartCard title="Conversion Funnel" subtitle="Visitor → Registered → Active → Transacting">
            <div className="space-y-4 py-4">
              {funnelData.map((step, i) => {
                const width = Math.max(20, ((funnelData.length - i) / funnelData.length) * 100);
                return (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-28 text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{step.label}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-full h-8 overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(step.percent, 100)}%` }}
                          transition={{ delay: i * 0.1, duration: 0.6 }}
                          className="absolute inset-y-0 left-0 rounded-full flex items-center pl-4"
                          style={{
                            background: `linear-gradient(90deg, ${PALETTE.indigo}, ${PALETTE.purple})`
                          }}
                        >
                          <span className="text-[9px] font-bold text-white">{step.percent}%</span>
                        </motion.div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white w-16 text-right">
                        {step.count?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Event Types */}
          <ChartCard title="Event Type Distribution" subtitle="What users are doing">
            <div className="grid grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={eventData} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={2}>
                    {eventData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 pt-4">
                {eventData.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest capitalize">{ev.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{ev.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ===== PLATFORM SECTION ===== */}
      {activeSection === 'platform' && (
        <div className="space-y-8">
          {/* Feature Usage Radar */}
          {featureData.length > 0 && (
            <ChartCard title="Feature Usage (MAU)" subtitle="Monthly active users per feature">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={featureData}>
                    <PolarGrid stroke="rgba(148,163,184,0.15)" />
                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                    <Radar name="MAU" dataKey="mau" stroke={PALETTE.indigo} fill={PALETTE.indigo} fillOpacity={0.15} strokeWidth={2} dot={{ fill: PALETTE.indigo, r: 3 }} />
                    <Radar name="DAU" dataKey="dau" stroke={PALETTE.emerald} fill={PALETTE.emerald} fillOpacity={0.1} strokeWidth={2} dot={{ fill: PALETTE.emerald, r: 3 }} />
                    <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {featureData.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}20` }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">{f.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            DAU: {f.dau ?? '–'} · MAU: {f.mau ?? '–'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          )}

          {/* New vs Returning */}
          <ChartCard title="New vs Returning Visitors" subtitle="Visitor loyalty breakdown">
            <div className="flex items-center justify-center gap-16 py-8">
              {data.userAnalysis && (
                <>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-indigo-600">
                        {data.userAnalysis.newVisitors?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Visitors</p>
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">Last 30 days</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-emerald-500">
                        {data.userAnalysis.returningVisitors?.toLocaleString() || 0}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Returning</p>
                    <p className="text-[9px] text-slate-300 uppercase tracking-widest mt-1">All-time</p>
                  </div>
                </>
              )}
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

// ===== Chart Card Wrapper =====
const ChartCard = ({ title, subtitle, children, action }) => (
  <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
        {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);
