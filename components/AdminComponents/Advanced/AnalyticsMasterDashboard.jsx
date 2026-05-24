// components/AdminComponents/Advanced/AnalyticsMasterDashboard.jsx
"use client";

import React, { useState } from 'react';
import MouseHeatmap from './MouseHeatmap';
import SessionReplayPlayer from './SessionReplayPlayer';
import UserJourneyFlow from './UserJourneyFlow';
import ABTestDashboard from './ABTestDashboard';
import PredictiveInsights from './PredictiveInsights';
import FormAnalyticsDashboard from './FormAnalyticsDashboard';
import RealTimeAnalytics from './RealTimeAnalytics';
import AlertDashboard from './AlertDashboard';
import ExportPanel from './ExportPanel';
import { BarChart3, Brain, FlaskConical, MousePointer, Play, TrendingUp, FileText, Bell, Download } from 'lucide-react';

export default function AnalyticsMasterDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Real-Time', icon: BarChart3 },
    { id: 'heatmap', label: 'Heatmaps', icon: MousePointer },
    { id: 'journey', label: 'User Journey', icon: TrendingUp },
    { id: 'replay', label: 'Session Replay', icon: Play },
    { id: 'abtest', label: 'A/B Tests', icon: FlaskConical },
    { id: 'predictive', label: 'AI Insights', icon: Brain },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'export', label: 'Export', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Advanced Analytics</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            World-class analytics platform • 500+ data points • ML-powered insights
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-2 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <RealTimeAnalytics />}
          
          {activeTab === 'heatmap' && (
            <MouseHeatmap page="/" timeRange={7} />
          )}
          
          {activeTab === 'journey' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Select User
                </h3>
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-sm"
                />
              </div>
              {selectedUser && <UserJourneyFlow userId={selectedUser} />}
            </div>
          )}
          
          {activeTab === 'replay' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Select Session
                </h3>
                <input
                  type="text"
                  placeholder="Enter Session ID"
                  value={selectedSession || ''}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-sm"
                />
              </div>
              {selectedSession && <SessionReplayPlayer sessionId={selectedSession} />}
            </div>
          )}
          
          {activeTab === 'abtest' && <ABTestDashboard />}
          
          {activeTab === 'predictive' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  Select User for AI Analysis
                </h3>
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg text-sm"
                />
              </div>
              {selectedUser && <PredictiveInsights userId={selectedUser} />}
            </div>
          )}
          
          {activeTab === 'forms' && <FormAnalyticsDashboard formId="contact-form" />}
          
          {activeTab === 'alerts' && <AlertDashboard />}
          
          {activeTab === 'export' && (
            <ExportPanel 
              dataSource="/api/v1/analytics/export" 
              filters={{ timeRange: 30 }} 
            />
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-2xl border border-indigo-200 dark:border-indigo-900/30 p-6">
            <p className="text-[10px] text-indigo-900 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2">
              Data Points Tracked
            </p>
            <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-400">500+</p>
            <p className="text-xs text-indigo-700 dark:text-indigo-500 mt-1">Per user session</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-900/30 p-6">
            <p className="text-[10px] text-emerald-900 dark:text-emerald-400 font-bold uppercase tracking-widest mb-2">
              ML Models Active
            </p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">3</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1">Churn, Conversion, LTV</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl border border-purple-200 dark:border-purple-900/30 p-6">
            <p className="text-[10px] text-purple-900 dark:text-purple-400 font-bold uppercase tracking-widest mb-2">
              Real-Time Events
            </p>
            <p className="text-3xl font-bold text-purple-900 dark:text-purple-400">Live</p>
            <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">Socket.io streaming</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30 p-6">
            <p className="text-[10px] text-amber-900 dark:text-amber-400 font-bold uppercase tracking-widest mb-2">
              GDPR Compliant
            </p>
            <p className="text-3xl font-bold text-amber-900 dark:text-amber-400">100%</p>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">Full privacy controls</p>
          </div>
        </div>
      </div>
    </div>
  );
}
