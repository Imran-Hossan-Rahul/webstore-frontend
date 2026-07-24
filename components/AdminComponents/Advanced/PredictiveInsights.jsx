// components/AdminComponents/Advanced/PredictiveInsights.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { Brain, TrendingDown, DollarSign, Target, Loader2 } from "lucide-react";

export default function PredictiveInsights({ userId }) {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    fetchPredictions();
  }, [userId]);

  const fetchPredictions = async () => {
    try {
      const response = await api.get(`/analytics/predictive/${userId}`);
      if (response.success) setPredictions(response.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={32} /></div>;

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-600/10';
    if (score >= 40) return 'text-amber-600 bg-amber-600/10';
    return 'text-emerald-600 bg-emerald-600/10';
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5">
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600/10 rounded-xl flex items-center justify-center text-violet-600">
            <Brain size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AI Predictions</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              ML-Powered Insights • {predictions?.confidence}% confidence
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Churn Risk */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getRiskColor(predictions?.churnRisk)}`}>
              <TrendingDown size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Churn Risk</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Next 30 days</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{predictions?.churnRisk}%</span>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getRiskColor(predictions?.churnRisk)}`}>
                {predictions?.churnRisk >= 70 ? 'High Risk' : predictions?.churnRisk >= 40 ? 'Medium' : 'Low Risk'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2">
              <div className={`h-2 rounded-full ${predictions?.churnRisk >= 70 ? 'bg-red-600' : predictions?.churnRisk >= 40 ? 'bg-amber-600' : 'bg-emerald-600'}`} style={{ width: `${predictions?.churnRisk}%` }} />
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Key Factors</p>
              {predictions?.churnFactors?.map((factor, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{factor.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{factor.impact}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Likelihood */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
              <Target size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Conversion Likelihood</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Next 7 days</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{predictions?.conversionLikelihood}%</span>
              <span className="px-3 py-1 bg-emerald-600/10 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {predictions?.conversionLikelihood >= 70 ? 'High' : predictions?.conversionLikelihood >= 40 ? 'Medium' : 'Low'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${predictions?.conversionLikelihood}%` }} />
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recommended Actions</p>
              {predictions?.recommendations?.map((rec, i) => (
                <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-emerald-600">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lifetime Value */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
              <DollarSign size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Predicted LTV</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">12 month forecast</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">${predictions?.predictedLTV?.toLocaleString()}</span>
              <span className="text-sm font-bold text-emerald-600">+{predictions?.ltvGrowth}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-white dark:bg-white/[0.02] rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">${predictions?.currentLTV}</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-white/[0.02] rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">6 Month</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">${predictions?.ltv6Month}</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-white/[0.02] rounded-lg">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">12 Month</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">${predictions?.ltv12Month}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-600">
              <Brain size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Engagement Score</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">AI-calculated</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{predictions?.engagementScore}/100</span>
              <span className="px-3 py-1 bg-purple-600/10 text-purple-600 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                {predictions?.engagementTrend === 'up' ? '↑ Rising' : predictions?.engagementTrend === 'down' ? '↓ Falling' : '→ Stable'}
              </span>
            </div>
            <div className="space-y-2 mt-4">
              {predictions?.engagementMetrics?.map((metric, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">{metric.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{metric.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${metric.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
