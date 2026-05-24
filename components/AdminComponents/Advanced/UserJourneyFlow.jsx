// components/AdminComponents/Advanced/UserJourneyFlow.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import {
  TrendingUp, ArrowRight, Loader2, BarChart2, Clock,
  MousePointer2, Users, RefreshCw, AlertCircle, ChevronRight,
  Activity, Eye, Layers
} from 'lucide-react';

const TIME_RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
];

// Mini sparkline bar chart for daily trend
const Sparkline = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.sessions), 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d._id}: ${d.sessions} sessions`}
          className="flex-1 bg-indigo-500/60 rounded-sm hover:bg-indigo-500 transition-colors cursor-pointer"
          style={{ height: `${Math.max(10, (d.sessions / max) * 100)}%` }}
        />
      ))}
    </div>
  );
};

// Circular engagement arc indicator
const EngagementArc = ({ score }) => {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  const label = pct >= 70 ? 'High' : pct >= 40 ? 'Medium' : 'Low';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-white/5" />
          <circle
            cx="18" cy="18" r="14" fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${(pct / 100) * 87.96} 87.96`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-slate-700 dark:text-white rotate-0">
          {pct}
        </span>
      </div>
      <span style={{ color }} className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function UserJourneyFlow() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [journey, setJourney] = useState(null);
  const [activeDays, setActiveDays] = useState(7);

  useEffect(() => {
    fetchJourney();
  }, [activeDays]);

  const fetchJourney = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/analytics/advanced/journey/overview?days=${activeDays}`);
      if (response.success) {
        setJourney(response.data);
      } else {
        setError('Failed to load journey data.');
      }
    } catch (err) {
      console.error('Failed to fetch journey:', err);
      setError(err.message || 'Server error. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8 flex flex-col items-center justify-center min-h-[420px] gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={24} />
        </div>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-700 dark:text-white">Aggregating Journey Data</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Reading from live session database…
        </p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-red-200/60 dark:border-red-500/20 p-8 flex flex-col items-center justify-center min-h-[420px] gap-4">
      <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
        <AlertCircle className="text-red-500" size={24} />
      </div>
      <p className="text-sm font-bold text-red-500">Failed to load journey data</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{error}</p>
      <button onClick={fetchJourney}
        className="mt-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  );

  // ── Empty State ───────────────────────────────────────────────────────────
  if (!journey || !journey.path || journey.path.length === 0) return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8 flex flex-col items-center justify-center min-h-[420px] gap-4">
      <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
        <TrendingUp className="text-indigo-600" size={24} />
      </div>
      <p className="text-sm font-bold text-slate-700 dark:text-white">No Journey Data Yet</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center max-w-xs">
        User journeys will appear here once visitors start navigating the platform.
      </p>
    </div>
  );

  const kpis = [
    {
      label: 'Engaged Sessions',
      value: `${journey.conversionRate}%`,
      sub: `${(journey.multiPageSessions || 0).toLocaleString()} multi-page`,
      color: 'emerald',
      icon: TrendingUp,
      good: parseFloat(journey.conversionRate) > 40
    },
    {
      label: 'Bounce Rate',
      value: `${journey.bounceRate}%`,
      sub: 'Single-page exits',
      color: parseFloat(journey.bounceRate) < 50 ? 'emerald' : 'red',
      icon: Users,
      good: parseFloat(journey.bounceRate) < 50
    },
    {
      label: 'Avg Session Time',
      value: journey.avgDurationFormatted || '—',
      sub: `${journey.avgPageViews} pages avg`,
      color: 'indigo',
      icon: Clock,
      good: true
    },
    {
      label: 'Total Sessions',
      value: (journey.totalSessions || 0).toLocaleString(),
      sub: `Last ${activeDays}d`,
      color: 'violet',
      icon: Activity,
      good: true
    },
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20' },
    red:     { bg: 'bg-red-500/10',     text: 'text-red-500',     border: 'border-red-500/20' },
    indigo:  { bg: 'bg-indigo-600/10',  text: 'text-indigo-600',  border: 'border-indigo-600/20' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20' },
    violet:  { bg: 'bg-violet-600/10',  text: 'text-violet-600',  border: 'border-violet-600/20' },
  };

  const getEngagementColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-500/10';
    if (score >= 40) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">

      {/* ── Header ── */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">User Journey</h3>
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live DB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              {journey.totalSteps} pages • {journey.totalSessions?.toLocaleString()} sessions • Last {activeDays}d
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/5">
            {TIME_RANGES.map(r => (
              <button key={r.days} onClick={() => setActiveDays(r.days)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                  activeDays === r.days
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={fetchJourney}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-600/10">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 dark:divide-white/5">
        {kpis.map(k => {
          const c = colorMap[k.color];
          return (
            <div key={k.label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.text} flex items-center justify-center border ${c.border}`}>
                  <k.icon size={14} />
                </div>
                {k.good !== undefined && (
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${k.good ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                    {k.good ? '▲ Good' : '▼ Watch'}
                  </span>
                )}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${c.text}`}>{k.value}</p>
              <p className="text-[9px] text-slate-400 mt-1">{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Daily Trend Sparkline ── */}
      {journey.dailyTrend && journey.dailyTrend.length > 1 && (
        <div className="px-6 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={9} /> Daily Session Volume
            </p>
            <p className="text-[9px] text-slate-400">
              {journey.dailyTrend.at(-1)?._id} — {journey.dailyTrend.at(-1)?.sessions} sessions
            </p>
          </div>
          <Sparkline data={journey.dailyTrend} />
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-slate-300 dark:text-slate-600">{journey.dailyTrend.at(0)?._id}</span>
            <span className="text-[8px] text-slate-300 dark:text-slate-600">{journey.dailyTrend.at(-1)?._id}</span>
          </div>
        </div>
      )}

      {/* ── Top Pages ── */}
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart2 size={10} /> Top Pages by Traffic Volume
          <span className="ml-auto text-slate-300 dark:text-slate-600">Real from Sessions collection</span>
        </p>

        <div className="space-y-3">
          {journey.path.map((step, index) => {
            const maxVisits = journey.path[0]?.interactions || 1;
            const barWidth = Math.round((step.interactions / maxVisits) * 100);

            return (
              <div key={index} className="group">
                <div className="flex items-center gap-3">
                  {/* Step badge */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Labels row */}
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={step.page}>
                        {step.page}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                          {step.interactions.toLocaleString()} visits
                        </span>
                        {step.durationFormatted && step.durationFormatted !== '—' && (
                          <>
                            <span className="text-slate-200 dark:text-white/10">·</span>
                            <span className="text-[9px] font-bold text-slate-400">
                              <Clock size={8} className="inline mr-0.5" />{step.durationFormatted}
                            </span>
                          </>
                        )}
                        {step.engagementScore > 0 && (
                          <>
                            <span className="text-slate-200 dark:text-white/10">·</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${getEngagementColor(step.engagementScore)}`}>
                              {step.engagementScore}% eng
                            </span>
                          </>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                          {step.exitRate}% exit
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          index === 0
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                            : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-white/20 dark:to-white/10'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Page Transitions ── */}
      {journey.transitions && journey.transitions.length > 0 && (
        <div className="p-6">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ArrowRight size={10} /> Top Page Transitions
            <span className="ml-auto text-slate-300 dark:text-slate-600">Landing → Exit</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {journey.transitions.slice(0, 8).map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-white/5 group hover:border-indigo-200 dark:hover:border-indigo-600/20 transition-colors">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[38%]" title={t.from}>
                    {t.from || '/'}
                  </span>
                  <ArrowRight size={10} className="text-slate-300 dark:text-slate-600 flex-shrink-0 group-hover:text-indigo-400 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[38%]" title={t.to}>
                    {t.to || '/'}
                  </span>
                </div>
                <span className="ml-auto text-[9px] font-bold text-indigo-600 bg-indigo-600/10 px-2 py-0.5 rounded-md flex-shrink-0">
                  {t.count}×
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p className="text-[9px] text-slate-300 dark:text-slate-600 text-center mt-4 font-bold uppercase tracking-widest">
            ✦ All data sourced live from MongoDB Sessions collection ✦
          </p>
        </div>
      )}
    </div>
  );
}
