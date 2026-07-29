"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, ShieldCheck, BarChart3, Activity, Globe, Settings, ChevronRight, TrendingUp, UserCheck, Search, Loader2, Bell, Command, Trophy, AlertTriangle, Zap, Server, Cpu, MousePointer2, Clock, Eye, ArrowUp, ArrowDown, Radio, Wifi, RefreshCw, Filter, MoreVertical, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Admin Components
import UsersActivityAreaChart from './UsersActivityGraph';
import VerificationRequests from './VerificationRequests';
import TopCountriesBarChart from './TopCountriesBarChart';
import DeviceStatsChart from './DeviceStatsChart';
import VisitorAccountPieChart from './VisitorAccountPieChart';
import LiveVisitors from './LiveVisitors';
import UserDirectory from './UserDirectory';
import ChallengePayouts from './ChallengePayouts';
import DevlogDisputes from './ProjectDisputes';
import AdminAnalytics from './AdminAnalytics';
import AdvancedAnalyticsDashboard from './Advanced/AdvancedAnalyticsDashboard';
import { api } from '@/utils/api';
import { io } from 'socket.io-client';

let socket;

const UnifiedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0, pendingVerifications: 0,
    activeSessions: 0, growth: 0, totalVisitors: 0
  });
  const [overviewData, setOverviewData] = useState(null);
  const [platformHealth, setPlatformHealth] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const liveEventsRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    fetchPlatformHealth();
    fetchLiveEvents();

    // Socket.IO for real-time events
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { withCredentials: true, transports: ['polling', 'websocket'], autoConnect: typeof window !== 'undefined' });
    }

    socket.on('adminLiveEvent', (event) => {
      liveEventsRef.current = [event, ...liveEventsRef.current].slice(0, 50);
      setLiveEvents([...liveEventsRef.current]);
    });

    socket.on('onlineCount', (count) => setOnlineCount(count));
    socket.on('newVisitor', (v) => {
      const event = {
        eventType: 'page_visit',
        page: v.page || '/',
        visitorId: v.visitorId,
        userName: v.userName,
        timestamp: v.timestamp || new Date().toISOString(),
        device: v.device,
        country: v.location?.country,
      };
      liveEventsRef.current = [event, ...liveEventsRef.current].slice(0, 50);
      setLiveEvents([...liveEventsRef.current]);
    });

    // Auto-refresh platform health every 30s
    const healthInterval = setInterval(fetchPlatformHealth, 30000);

    return () => {
      socket?.off('adminLiveEvent');
      socket?.off('onlineCount');
      socket?.off('newVisitor');
      clearInterval(healthInterval);
    };
  }, []);

  const fetchLiveEvents = async () => {
    try {
      const res = await api.get('/stats/live-events');
      if (res.success) {
        liveEventsRef.current = res.data;
        setLiveEvents(res.data);
      }
    } catch (err) {
      console.error("Error fetching live events:", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, funnelRes] = await Promise.all([
        api.get('/stats/overview'),
        api.get('/stats/funnel').catch(() => ({ success: false })),
      ]);
      if (overviewRes.success) {
        setStats(overviewRes.data.stats);
        setOverviewData(overviewRes.data);
      }
      if (funnelRes.success) setFunnel(funnelRes.data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformHealth = async () => {
    try {
      const res = await api.get('/stats/platform-health');
      if (res.success) setPlatformHealth(res.data);
    } catch {}
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'advanced', label: 'Advanced Analytics', icon: Zap },
    { id: 'verification', label: 'Verifications', icon: ShieldCheck, badge: stats.pendingVerifications },
    { id: 'payouts', label: 'Challenge Payouts', icon: Trophy },
    { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
    { id: 'live', label: 'Live Monitor', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'market', label: 'Marketplace', icon: ShoppingBag, isLink: true, href: '/admin/market' },
  ];

  const renderContent = () => {
    if (loading && activeTab === 'overview') {
      return (
        <div className="h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Loading Intelligence Hub</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <DashboardOverview stats={stats} overviewData={overviewData} funnel={funnel} liveEvents={liveEvents} platformHealth={platformHealth} onlineCount={onlineCount} />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'advanced':
        return <AdvancedAnalyticsDashboard />;
      case 'verification':
        return <VerificationRequests />;
      case 'payouts':
        return <ChallengePayouts />;
      case 'disputes':
        return <DevlogDisputes />;
      case 'live':
        return <LiveVisitors />;
      case 'users':
        return <UserDirectory />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFDFD] dark:bg-[#050505] lg:-mt-8 font-sans selection:bg-indigo-600/10">
      {/* Elite Sidebar */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#080808] border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-white/5 flex flex-col lg:sticky top-0 lg:h-screen transition-all duration-500 z-40">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-950 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
            <Command size={18} />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white uppercase">Intel Hub</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{onlineCount || stats.activeSessions || 0} Live</span>
            </div>
          </div>
        </div>

        <nav className="px-4 py-2 lg:py-0 lg:flex-1 lg:mt-4 flex gap-2 lg:gap-0 lg:flex-col overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLink) {
                  router.push(item.href);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-auto shrink-0 lg:w-full flex items-center justify-center lg:justify-between px-4 py-2.5 lg:py-3 rounded-xl transition-all group ${
                activeTab === item.id || (item.isLink && false)
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className={`text-[13px] font-bold tracking-tight ${activeTab === item.id ? 'opacity-100' : 'opacity-80'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white text-[9px] font-bold rounded-full ring-4 ring-indigo-600/10">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Platform Health Mini Widget */}
        {platformHealth && (
          <div className="px-4 pb-4 hidden lg:block">
            <div className="bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Platform Health</p>
              <div className="space-y-2">
                <HealthBar label="Memory" value={platformHealth.server.memory.usagePercent} />
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">DB</span>
                  <span className={platformHealth.database.status === 'connected' ? 'text-emerald-500' : 'text-red-500'}>
                    {platformHealth.database.status === 'connected' ? '✓ Connected' : '✗ Down'}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400 uppercase tracking-widest">Uptime</span>
                  <span className="text-slate-600 dark:text-slate-300">{platformHealth.server.uptimeFormatted}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-slate-100 dark:border-white/5 hidden lg:block">
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-white dark:border-white/10" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate uppercase tracking-tighter">System Root</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Live
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-x-hidden overflow-y-auto max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-12 gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-[2px] bg-indigo-600 rounded-full hidden md:block" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Intelligence Hub • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Quick Search (⌘K)"
                className="pl-11 pr-6 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/50 transition-all text-xs font-medium w-64"
              />
            </div>
            <button onClick={fetchDashboardData} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all">
              <RefreshCw size={18} />
            </button>
            <button className="relative p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <Bell size={20} />
              {stats.pendingVerifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-black" />
              )}
            </button>
            <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// ===== Dashboard Overview (extracted component) =====
const DashboardOverview = ({ stats, overviewData, funnel, liveEvents, platformHealth, onlineCount }) => {
  const kpis = [
    {
      label: "Total Users",
      value: stats.totalUsers?.toLocaleString() || "0",
      trend: `+${stats.growth || 0}%`,
      trendUp: parseFloat(stats.growth) >= 0,
      icon: Users,
      color: "indigo",
    },
    {
      label: "Pending Verifications",
      value: stats.pendingVerifications || 0,
      trend: "Needs Review",
      trendUp: stats.pendingVerifications === 0,
      icon: UserCheck,
      color: "amber",
    },
    {
      label: "Active Now",
      value: onlineCount || stats.activeSessions || 0,
      trend: "Live",
      trendUp: true,
      icon: Activity,
      color: "emerald",
      live: true,
    },
    {
      label: "Total Visitors",
      value: stats.totalVisitors?.toLocaleString() || "0",
      trend: "All-time",
      trendUp: true,
      icon: Globe,
      color: "blue",
    },
  ];

  return (
    <div className="space-y-10">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Activity Chart + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">User Activity</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">30-day session trend</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-indigo-600" />
              Sessions
            </div>
          </div>
          <UsersActivityAreaChart />
        </div>

        {/* Live Event Feed */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Live Event Stream</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50 dark:divide-white/5 custom-scrollbar">
            {liveEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-40">
                <Radio size={28} strokeWidth={1} />
                <p className="text-[9px] font-bold uppercase tracking-widest mt-3">Awaiting Signal</p>
              </div>
            ) : (
              liveEvents.map((ev, i) => (
                <LiveEventRow key={i} event={ev} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Funnel + Country + Account Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversion Funnel */}
        {funnel.length > 0 && (
          <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Conversion Funnel</h3>
            <div className="space-y-3">
              {funnel.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{step.label}</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{step.count?.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.percent}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 tracking-widest uppercase">{step.percent}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <VisitorAccountPieChart data={overviewData?.accountDistribution} />
        <TopCountriesBarChart data={overviewData?.countries} />
      </div>

      {/* Platform Health Row */}
      {platformHealth && (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Server size={14} className="text-indigo-600" /> Platform Status
            </h3>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              All Systems Nominal
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <HealthMetric label="Memory Usage" value={`${platformHealth.server.memory.heapUsedMB}MB / ${platformHealth.server.memory.heapTotalMB}MB`} sub={`${platformHealth.server.memory.usagePercent}% used`} icon={Cpu} warning={platformHealth.server.memory.usagePercent > 80} />
            <HealthMetric label="Uptime" value={platformHealth.server.uptimeFormatted} sub={`Node ${platformHealth.server.nodeVersion}`} icon={Clock} />
            <HealthMetric label="Database" value={platformHealth.database.status} sub={`${platformHealth.database.stats.totalUsers} users tracked`} icon={Server} ok={platformHealth.database.status === 'connected'} />
            <HealthMetric label="Live Connections" value={platformHealth.realtime.onlineUsers} sub={`${platformHealth.realtime.activeSessions} active sessions`} icon={Wifi} />
          </div>
        </div>
      )}
    </div>
  );
};

// ===== Sub-components =====

const KPICard = ({ label, value, trend, trendUp, icon: Icon, color, live }) => {
  const colorMap = {
    indigo: "bg-indigo-600/10 text-indigo-600",
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
  };
  return (
    <div className="bg-white dark:bg-[#0A0A0A] p-7 rounded-2xl border border-slate-200/60 dark:border-white/5 transition-all hover:border-slate-300 dark:hover:border-white/20 group hover:shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={18} />
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
          live
            ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
            : trendUp
            ? 'text-emerald-500 bg-emerald-500/5'
            : 'text-amber-500 bg-amber-500/5'
        }`}>
          {live && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
          {!live && (trendUp ? <ArrowUp size={8} /> : <ArrowDown size={8} />)}
          {trend}
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{value}</h4>
    </div>
  );
};

const LiveEventRow = ({ event }) => {
  const typeConfig = {
    page_visit: { color: "text-blue-500", bg: "bg-blue-500/10", emoji: "🔵" },
    click: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-white/5", emoji: "👆" },
    rage_click: { color: "text-red-500", bg: "bg-red-500/10", emoji: "😤" },
    purchase: { color: "text-emerald-500", bg: "bg-emerald-500/10", emoji: "💰" },
    exit_intent: { color: "text-amber-500", bg: "bg-amber-500/10", emoji: "🚪" },
    js_error: { color: "text-red-500", bg: "bg-red-500/10", emoji: "🔴" },
    form_submit: { color: "text-indigo-500", bg: "bg-indigo-500/10", emoji: "✅" },
    feature_use: { color: "text-purple-500", bg: "bg-purple-500/10", emoji: "⚡" },
    download_start: { color: "text-teal-500", bg: "bg-teal-500/10", emoji: "⬇️" },
    search: { color: "text-amber-500", bg: "bg-amber-500/10", emoji: "🔍" },
    keystroke: { color: "text-indigo-500", bg: "bg-indigo-500/10", emoji: "⌨️" },
    clipboard: { color: "text-orange-500", bg: "bg-orange-500/10", emoji: "📋" },
    tab_activity: { color: "text-cyan-500", bg: "bg-cyan-500/10", emoji: "📑" },
    device_metrics: { color: "text-slate-500", bg: "bg-slate-500/10", emoji: "📱" },
  };
  const cfg = typeConfig[event.eventType] || { color: "text-slate-400", bg: "bg-slate-50 dark:bg-white/[0.02]", emoji: "•" };

  return (
    <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
      <span className="text-base">{cfg.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wide truncate">
          {event.eventType?.replace(/_/g, ' ')} {event.page ? `· ${event.page}` : ''}
        </p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
          {event.userName || (event.visitorId ? `Visitor_${event.visitorId.slice(0, 5)}` : 'Anonymous')} {event.country ? `· ${event.country}` : ''}
        </p>
      </div>
      <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest whitespace-nowrap">
        {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now'}
      </span>
    </div>
  );
};

const HealthBar = ({ label, value }) => (
  <div>
    <div className="flex justify-between text-[9px] font-bold mb-1">
      <span className="text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={value > 80 ? 'text-red-500' : value > 60 ? 'text-amber-500' : 'text-emerald-500'}>{value}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${value > 80 ? 'bg-red-500' : value > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const HealthMetric = ({ label, value, sub, icon: Icon, warning, ok }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
      <Icon size={12} className={ok ? 'text-emerald-500' : warning ? 'text-amber-500' : ''} />
      {label}
    </div>
    <p className={`text-sm font-bold tracking-tight ${warning ? 'text-amber-500' : ok ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
      {value}
    </p>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
  </div>
);

export default UnifiedAdminDashboard;

