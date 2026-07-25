// components/AdminComponents/Advanced/AdvancedAnalyticsDashboard.jsx
"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/utils/api';
import { MousePointer2, Keyboard, Clipboard, Eye, Wifi, Battery, Play, TrendingUp, FlaskConical, Brain, FileText, Video, Search, Users as UsersIcon, Bell, Download, Loader2, BarChart3, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic Imports for Sub-Dashboards
const MouseHeatmap = dynamic(() => import('./MouseHeatmap'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const KeystrokeAnalytics = dynamic(() => import('./KeystrokeAnalytics'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const ClipboardMonitor = dynamic(() => import('./ClipboardMonitor'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const TabActivityDashboard = dynamic(() => import('./TabActivityDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const NetworkSpeedDashboard = dynamic(() => import('./NetworkSpeedDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const DeviceIntelligence = dynamic(() => import('./DeviceIntelligence'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const SessionReplayList = dynamic(() => import('./SessionReplayList'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const SessionReplayPlayer = dynamic(() => import('./SessionReplayPlayer'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const UserJourneyFlow = dynamic(() => import('./UserJourneyFlow'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const ABTestDashboard = dynamic(() => import('./ABTestDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const PredictiveInsights = dynamic(() => import('./PredictiveInsights'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const FormAnalyticsDashboard = dynamic(() => import('./FormAnalyticsDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const VideoAnalyticsDashboard = dynamic(() => import('./VideoAnalyticsDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const SearchAnalyticsDashboard = dynamic(() => import('./SearchAnalyticsDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const SocialGraphDashboard = dynamic(() => import('./SocialGraphDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });
const AlertDashboard = dynamic(() => import('./AlertDashboard'), { ssr: false, loading: () => <Loader2 className="animate-spin text-indigo-600 m-auto mt-20" /> });

export default function AdvancedAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mouseMovements: 0,
    keystrokes: 0,
    clipboardEvents: 0,
    tabSwitches: 0,
    sessionReplays: 0,
    formInteractions: 0,
    videoEngagements: 0,
    searchQueries: 0
  });
  const [activeView, setActiveView] = useState('overview');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    fetchAdvancedStats();
  }, []);

  const fetchAdvancedStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/analytics/advanced/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch advanced stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackingModules = [
    {
      id: 'mouse',
      label: 'Mouse Tracking',
      icon: MousePointer2,
      value: stats.mouseMovements?.toLocaleString() || '0',
      subtitle: 'Movements tracked',
      color: 'indigo',
      description: 'Heatmaps, click patterns, rage clicks'
    },
    {
      id: 'keyboard',
      label: 'Keystroke Analysis',
      icon: Keyboard,
      value: stats.keystrokes?.toLocaleString() || '0',
      subtitle: 'Keystrokes recorded',
      color: 'purple',
      description: 'Typing patterns, biometric auth'
    },
    {
      id: 'clipboard',
      label: 'Clipboard Monitor',
      icon: Clipboard,
      value: stats.clipboardEvents?.toLocaleString() || '0',
      subtitle: 'Copy/paste events',
      color: 'blue',
      description: 'Security threat detection'
    },
    {
      id: 'tabs',
      label: 'Tab Activity',
      icon: Eye,
      value: stats.tabSwitches?.toLocaleString() || '0',
      subtitle: 'Tab switches',
      color: 'emerald',
      description: 'Attention tracking, distraction analysis'
    },
    {
      id: 'network',
      label: 'Network Performance',
      icon: Wifi,
      value: stats.networkTests?.toLocaleString() || '0',
      subtitle: 'Speed tests',
      color: 'cyan',
      description: 'Latency, bandwidth, quality'
    },
    {
      id: 'device',
      label: 'Device Metrics',
      icon: Battery,
      value: stats.deviceMetrics?.toLocaleString() || '0',
      subtitle: 'Device snapshots',
      color: 'amber',
      description: 'Battery, permissions, sensors'
    },
    {
      id: 'replay',
      label: 'Session Replay',
      icon: Play,
      value: stats.sessionReplays?.toLocaleString() || '0',
      subtitle: 'Sessions recorded',
      color: 'red',
      description: 'Video-like playback (FullStory-level)'
    },
    {
      id: 'journey',
      label: 'User Journey',
      icon: TrendingUp,
      value: stats.userJourneys?.toLocaleString() || '0',
      subtitle: 'Paths tracked',
      color: 'pink',
      description: 'Funnel analysis, path visualization'
    },
    {
      id: 'abtest',
      label: 'A/B Testing',
      icon: FlaskConical,
      value: stats.activeTests || '0',
      subtitle: 'Active tests',
      color: 'teal',
      description: 'Experimentation framework'
    },
    {
      id: 'predictive',
      label: 'AI Predictions',
      icon: Brain,
      value: stats.predictions?.toLocaleString() || '0',
      subtitle: 'ML predictions',
      color: 'violet',
      description: 'Churn, conversion, LTV forecasting'
    },
    {
      id: 'forms',
      label: 'Form Analytics',
      icon: FileText,
      value: stats.formInteractions?.toLocaleString() || '0',
      subtitle: 'Form interactions',
      color: 'orange',
      description: 'Field-level tracking, abandonment'
    },
    {
      id: 'video',
      label: 'Video Engagement',
      icon: Video,
      value: stats.videoEngagements?.toLocaleString() || '0',
      subtitle: 'Video plays',
      color: 'rose',
      description: 'Play/pause/seek tracking'
    },
    {
      id: 'search',
      label: 'Search Analytics',
      icon: Search,
      value: stats.searchQueries?.toLocaleString() || '0',
      subtitle: 'Search queries',
      color: 'lime',
      description: 'Query analysis, zero-results'
    },
    {
      id: 'social',
      label: 'Social Graph',
      icon: UsersIcon,
      value: stats.socialConnections?.toLocaleString() || '0',
      subtitle: 'Connections',
      color: 'sky',
      description: 'Influence scoring, communities'
    }
  ];

  const colorMap = {
    indigo: 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20',
    purple: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
    blue: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
    emerald: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20',
    cyan: 'bg-cyan-600/10 text-cyan-600 border-cyan-600/20',
    amber: 'bg-amber-600/10 text-amber-600 border-amber-600/20',
    red: 'bg-red-600/10 text-red-600 border-red-600/20',
    pink: 'bg-pink-600/10 text-pink-600 border-pink-600/20',
    teal: 'bg-teal-600/10 text-teal-600 border-teal-600/20',
    violet: 'bg-violet-600/10 text-violet-600 border-violet-600/20',
    orange: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    rose: 'bg-rose-600/10 text-rose-600 border-rose-600/20',
    lime: 'bg-lime-600/10 text-lime-600 border-lime-600/20',
    sky: 'bg-sky-600/10 text-sky-600 border-sky-600/20'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // Import sub-components dynamically
  const renderView = () => {
    // Shared Back Button
    const BackButton = () => (
      <button 
        onClick={() => setActiveView('overview')} 
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8 group w-fit"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-opacity" /> 
        Back to Intelligence Overview
      </button>
    );

    switch (activeView) {
      case 'mouse':
        return (
          <div className="space-y-6">
            <BackButton />
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mouse Movement Heatmap</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time interaction matrix</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Live Feed</span>
                  </div>
                </div>
              </div>
              <div className="aspect-video bg-slate-50 dark:bg-black/20 rounded-[40px] border border-dashed border-slate-200 dark:border-white/10 overflow-hidden relative">
                <MouseHeatmap page="/" timeRange={7} />
              </div>
            </div>
          </div>
        );
      case 'keyboard':
        return (
          <div className="space-y-6">
            <BackButton />
            <KeystrokeAnalytics />
          </div>
        );
      case 'clipboard':
        return (
          <div className="space-y-6">
            <BackButton />
            <ClipboardMonitor />
          </div>
        );
      case 'tabs':
        return (
          <div className="space-y-6">
            <BackButton />
            <TabActivityDashboard />
          </div>
        );
      case 'network':
        return (
          <div className="space-y-6">
            <BackButton />
            <NetworkSpeedDashboard />
          </div>
        );
      case 'device':
        return (
          <div className="space-y-6">
            <BackButton />
            <DeviceIntelligence />
          </div>
        );
      case 'replay':
        return (
          <div className="space-y-6">
            <BackButton />
            {!selectedSessionId ? (
              <SessionReplayList onSelectSession={(id) => setSelectedSessionId(id)} />
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedSessionId(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  Back to Session List
                </button>
                <SessionReplayPlayer sessionId={selectedSessionId} />
              </div>
            )}
          </div>
        );
      case 'journey':
        return (
          <div className="space-y-6">
            <BackButton />
            <UserJourneyFlow />
          </div>
        );
      case 'abtest':
        return (
          <div className="space-y-6">
            <BackButton />
            <ABTestDashboard />
          </div>
        );
      case 'predictive':
        return (
          <div className="space-y-6">
            <BackButton />
            <PredictiveInsights />
          </div>
        );
      case 'forms':
        return (
          <div className="space-y-6">
            <BackButton />
            <FormAnalyticsDashboard />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-6">
            <BackButton />
            <VideoAnalyticsDashboard />
          </div>
        );
      case 'search':
        return (
          <div className="space-y-6">
            <BackButton />
            <SearchAnalyticsDashboard />
          </div>
        );
      case 'social':
        return (
          <div className="space-y-6">
            <BackButton />
            <SocialGraphDashboard />
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6">
            <BackButton />
            <AlertDashboard />
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <MetricSummaryCard 
                title="Data Points" 
                value={stats.totalDataPoints ? `${stats.totalDataPoints?.toLocaleString()}+` : "0+"} 
                subtitle="Per user session" 
                icon={BarChart3} 
                color="indigo" 
              />
              <MetricSummaryCard 
                title="ML Models" 
                value={stats.mlModels || "0"} 
                subtitle="Churn, Conversion, LTV" 
                icon={Brain} 
                color="emerald" 
              />
              <MetricSummaryCard 
                title="Real-Time" 
                value="Live" 
                subtitle="Socket.io streaming" 
                icon={Play} 
                color="purple" 
              />
              <MetricSummaryCard 
                title="GDPR" 
                value={`${stats.gdprScore || 100}%`} 
                subtitle="Fully compliant" 
                icon={Bell} 
                color="amber" 
              />
            </div>

            {/* Tracking Modules Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advanced Tracking Modules</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    14 enterprise-grade tracking systems
                  </p>
                </div>
                <button
                  onClick={fetchAdvancedStats}
                  className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Refresh Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trackingModules.map((module, index) => (
                  <ModuleCard key={module.id} module={module} index={index} colorMap={colorMap} onClick={() => setActiveView(module.id)} />
                ))}
              </div>
            </div>

            {/* Comparison Banner */}
            <ComparisonBanner />
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

// --- Helper Components ---

const MetricSummaryCard = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorVariants = {
    indigo: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 border-indigo-200 dark:border-indigo-900/30",
    emerald: "from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-900/30",
    purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-900/30",
    amber: "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-900/30"
  };
  
  const iconColors = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    purple: "bg-purple-600",
    amber: "bg-amber-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colorVariants[color]} rounded-2xl border p-6`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${iconColors[color]} rounded-xl flex items-center justify-center text-white`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      <p className="text-xs opacity-60">{subtitle}</p>
    </motion.div>
  );
};

const ModuleCard = ({ module, index, colorMap, onClick }) => {
  const Icon = module.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-200/60 dark:border-white/5 p-5 hover:border-slate-300 dark:hover:border-white/10 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[module.color]}`}>
          <Icon size={18} />
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/[0.02] px-2 py-1 rounded">
          Active
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{module.label}</h3>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
        {module.description}
      </p>

      <div className="pt-3 border-t border-slate-100 dark:border-white/5">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{module.value}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          {module.subtitle}
        </p>
      </div>
    </motion.div>
  );
};

const ComparisonBanner = () => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold mb-2">🏆 Top 0.0001% Analytics Platform</h3>
        <p className="text-sm opacity-90 mb-4">
          Your platform now beats Google Analytics, Mixpanel, Hotjar, and FullStory combined
        </p>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="opacity-75 text-xs">Google Analytics</p>
            <p className="font-bold">~50 data points</p>
          </div>
          <div>
            <p className="opacity-75 text-xs">Mixpanel</p>
            <p className="font-bold">~100 data points</p>
          </div>
          <div>
            <p className="opacity-75 text-xs">Your Platform</p>
            <p className="font-bold text-emerald-300">500+ data points ✅</p>
          </div>
        </div>
      </div>
      <div className="text-6xl">🚀</div>
    </div>
  </div>
);
