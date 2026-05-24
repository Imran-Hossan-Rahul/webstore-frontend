// components/AdminComponents/Advanced/RealTimeAnalytics.jsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Activity, Users, MousePointer, Eye, TrendingUp, Zap } from 'lucide-react';

export default function RealTimeAnalytics() {
  const [liveData, setLiveData] = useState({
    activeUsers: 0,
    pageViews: 0,
    clicks: 0,
    conversions: 0,
    recentEvents: []
  });
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to Socket.io
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    // Subscribe to real-time events
    socketRef.current.on('analytics:activeUsers', (data) => {
      setLiveData(prev => ({ ...prev, activeUsers: data.count }));
    });

    socketRef.current.on('analytics:pageView', (data) => {
      setLiveData(prev => ({
        ...prev,
        pageViews: prev.pageViews + 1,
        recentEvents: [{ type: 'pageView', data, time: new Date() }, ...prev.recentEvents.slice(0, 49)]
      }));
    });

    socketRef.current.on('analytics:click', (data) => {
      setLiveData(prev => ({
        ...prev,
        clicks: prev.clicks + 1,
        recentEvents: [{ type: 'click', data, time: new Date() }, ...prev.recentEvents.slice(0, 49)]
      }));
    });

    socketRef.current.on('analytics:conversion', (data) => {
      setLiveData(prev => ({
        ...prev,
        conversions: prev.conversions + 1,
        recentEvents: [{ type: 'conversion', data, time: new Date() }, ...prev.recentEvents.slice(0, 49)]
      }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
      case 'pageView': return <Eye size={14} className="text-blue-600" />;
      case 'click': return <MousePointer size={14} className="text-purple-600" />;
      case 'conversion': return <TrendingUp size={14} className="text-emerald-600" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/60 dark:border-white/5">
      <div className="p-6 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Real-Time Analytics</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Live Data Stream</p>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-600" />
            <p className="text-[10px] text-blue-900 dark:text-blue-400 font-bold uppercase tracking-widest">Active Users</p>
          </div>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-400">{liveData.activeUsers}</p>
          <p className="text-[10px] text-blue-700 dark:text-blue-500 mt-1">Right now</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-purple-600" />
            <p className="text-[10px] text-purple-900 dark:text-purple-400 font-bold uppercase tracking-widest">Page Views</p>
          </div>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-400">{liveData.pageViews}</p>
          <p className="text-[10px] text-purple-700 dark:text-purple-500 mt-1">Last hour</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-900/30">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer size={16} className="text-indigo-600" />
            <p className="text-[10px] text-indigo-900 dark:text-indigo-400 font-bold uppercase tracking-widest">Clicks</p>
          </div>
          <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-400">{liveData.clicks}</p>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-500 mt-1">Last hour</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <p className="text-[10px] text-emerald-900 dark:text-emerald-400 font-bold uppercase tracking-widest">Conversions</p>
          </div>
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">{liveData.conversions}</p>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-1">Last hour</p>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-white/5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Live Event Stream</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {liveData.recentEvents.map((event, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">
              <div className="flex-shrink-0">{getEventIcon(event.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {event.type === 'pageView' && `Page View: ${event.data.page}`}
                  {event.type === 'click' && `Click: ${event.data.element}`}
                  {event.type === 'conversion' && `Conversion: ${event.data.type}`}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  {event.data.userId || 'Anonymous'} • {event.data.country || 'Unknown'}
                </p>
              </div>
              <div className="flex-shrink-0 text-[10px] text-slate-400 font-bold">
                {new Date(event.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
