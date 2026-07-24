// components/AdminComponents/Advanced/ABTestDashboard.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { FlaskConical, TrendingUp, Users, Zap, Loader2 } from "lucide-react";

export default function ABTestDashboard() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/analytics/ab-tests/active');
      if (response.success) setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch A/B tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinningVariant = (test) => {
    return test.variants.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-6">
      {tests.map(test => {
        const winner = getWinningVariant(test);
        const isSignificant = test.statisticalSignificance >= 95;

        return (
          <div key={test._id} className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5">
            <div className="p-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-600">
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{test.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {test.status} • {test.variants.length} variants
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence</p>
                    <p className={`text-lg font-bold ${isSignificant ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {test.statisticalSignificance}%
                    </p>
                  </div>
                  {isSignificant && (
                    <div className="px-3 py-1 bg-emerald-600/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                      Significant
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {test.variants.map(variant => (
                  <div key={variant.name} className={`relative p-4 rounded-xl border-2 ${variant.name === winner.name ? 'border-emerald-600 bg-emerald-600/5' : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]'}`}>
                    {variant.name === winner.name && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{variant.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{variant.traffic}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Users</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{variant.users.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conversions</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{variant.conversions.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rate</span>
                        <span className={`text-lg font-bold ${variant.name === winner.name ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                          {variant.conversionRate.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lift</span>
                        <span className={`text-sm font-bold ${variant.lift > 0 ? 'text-emerald-600' : variant.lift < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                          {variant.lift > 0 ? '+' : ''}{variant.lift.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Users</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{test.totalUsers?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{test.duration} days</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-700">
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
