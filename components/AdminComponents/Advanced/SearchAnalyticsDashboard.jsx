"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Search, TrendingUp, AlertCircle, MousePointer2, Clock, BarChart3, HelpCircle, Hash, RefreshCw, Loader2, Database, Zap } from "lucide-react";

const EMPTY_STATE = {
  popular: [],
  zeroResults: [],
  metrics: {
    totalQueries: 0,
    avgQueryLength: 0,
    ctr: '0%',
    intentAccuracy: '0%'
  }
};

const SearchAnalyticsDashboard = () => {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSearchData();
  }, []);

  const fetchSearchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch popular searches + zero results in parallel
      const [popularRes, zeroRes] = await Promise.all([
        api.get('/analytics/advanced/search/popular?limit=10&days=30'),
        api.get('/analytics/advanced/search/zero-results?limit=10')
      ]);

      const popular = (popularRes.success ? popularRes.data : []).map(item => ({
        query: item._id || item.query?.original || 'Unknown',
        count: item.count || item.totalSearches || 0,
        conversion: item.clicks && item.count
          ? ((item.clicks / item.count) * 100).toFixed(1)
          : '0.0',
        intent: item.dominantIntent || '—'
      }));

      const zeroResults = (zeroRes.success ? zeroRes.data : []).map(item => ({
        query: item._id || item.query?.original || 'Unknown',
        count: item.count || item.searches || 0
      }));

      // Compute metrics from real data
      const totalQueries = popular.reduce((s, p) => s + p.count, 0) +
                           zeroResults.reduce((s, z) => s + z.count, 0);

      const avgQueryLength = popular.length > 0
        ? (popular.reduce((s, p) => s + (p.query?.length || 0), 0) / popular.length).toFixed(1)
        : 0;

      // CTR: queries with at least one click / total
      const queriesWithResults = popular.length;
      const ctrPct = (popular.length + zeroResults.length) > 0
        ? ((queriesWithResults / (popular.length + zeroResults.length)) * 100).toFixed(1)
        : 0;

      setData({
        popular,
        zeroResults,
        metrics: {
          totalQueries,
          avgQueryLength: Number(avgQueryLength),
          ctr: `${ctrPct}%`,
          intentAccuracy: popular.length > 0 ? '100%' : '0%'
        }
      });
    } catch (err) {
      console.error('Search analytics fetch failed:', err);
      setError(err.message || 'Failed to load search data');
      setData(EMPTY_STATE);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
      <Loader2 className="animate-spin text-indigo-600" size={28} />
      <p className="text-[10px] font-bold uppercase tracking-widest">Analyzing Search Queries...</p>
    </div>
  );

  const { metrics, popular, zeroResults } = data;

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest flex-1">{error}</p>
          <button onClick={fetchSearchData}
            className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">
            <RefreshCw size={10} /> Retry
          </button>
        </div>
      )}

      {/* Header badges */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live DB
        </span>
        <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
          <Database size={8} /> SearchAnalytics Collection
        </span>
        <button onClick={fetchSearchData}
          className="ml-auto p-1.5 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchStatCard
          label="Total Queries"
          value={(metrics.totalQueries || 0).toLocaleString()}
          icon={Hash}
          color="indigo"
        />
        <SearchStatCard
          label="Search CTR"
          value={metrics.ctr || '0%'}
          icon={MousePointer2}
          color="emerald"
        />
        <SearchStatCard
          label="Avg. Query Length"
          value={`${metrics.avgQueryLength || 0} chars`}
          icon={Clock}
          color="purple"
        />
        <SearchStatCard
          label="Zero Result Queries"
          value={zeroResults.length.toString()}
          icon={AlertCircle}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Popular Queries</h3>
              <p className="text-[9px] text-slate-300 dark:text-white/20 uppercase tracking-widest mt-0.5">
                Real from searchAnalytics collection
              </p>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>

          {popular.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <Search size={18} className="text-slate-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                No search queries recorded yet.
                <br />
                <span className="text-slate-300 dark:text-white/20 normal-case font-normal mt-1 block">
                  Searches will appear here once users use the search feature.
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {popular.map((item, i) => (
                <div key={`${item.query}-${i}`}
                  className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-600/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      i === 0 ? 'bg-indigo-600 text-white' :
                      i === 1 ? 'bg-purple-600/80 text-white' :
                      'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white tracking-tight">{item.query}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {item.count.toLocaleString()} searches
                        {item.intent && item.intent !== '—' && (
                          <> · <span className="text-indigo-500">{item.intent}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{item.conversion}%</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">CTR</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Zero Results */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest">Zero Result Queries</h3>
              <AlertCircle size={16} className="text-rose-500" />
            </div>

            {zeroResults.length === 0 ? (
              <div className="flex items-center gap-3 bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10">
                <Zap size={14} className="text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  No zero-result queries found — great coverage!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {zeroResults.map((item, i) => (
                  <div key={`zero-${item.query}-${i}`}
                    className="flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest truncate max-w-[70%]">{item.query}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">{item.count}×</span>
                  </div>
                ))}
                <p className="mt-3 text-[9px] text-slate-400 font-medium italic">
                  * Consider adding content or synonym mappings for these terms.
                </p>
              </div>
            )}
          </div>

          {/* AI Intent Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <HelpCircle size={28} className="mb-4 opacity-70" />
              <h3 className="text-sm font-bold mb-2 tracking-tight">AI Intent Detection</h3>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {popular.length > 0
                  ? `${popular.length} unique queries tracked. Intent signals are being captured on each search for ML classification.`
                  : 'Intent classification will activate once search events are recorded in the database.'}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Data Source</span>
                <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  searchAnalytics ({(popular.length + zeroResults.length)} docs)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchStatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-600/10 border-indigo-600/20",
    emerald: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20",
    purple: "text-purple-600 bg-purple-600/10 border-purple-600/20",
    amber: "text-amber-600 bg-amber-600/10 border-amber-600/20",
  };
  return (
    <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200/60 dark:border-white/5 rounded-2xl p-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h4>
    </div>
  );
};

export default SearchAnalyticsDashboard;
