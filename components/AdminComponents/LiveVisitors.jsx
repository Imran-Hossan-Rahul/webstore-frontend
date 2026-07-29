"use client";

import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Activity, MapPin, Monitor, Smartphone, Globe, Clock, Shield, Zap, ZapOff, X, Navigation, Link as LinkIcon, MousePointer2, Calendar, Cpu, Info, ChevronRight, Loader2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";

let socket;

export default function LiveVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'sessions'
  const liveEventsRef = useRef([]);

  const fetchVisitors = async () => {
    try {
      const res = await api.get('/stats/visitors');
      if (Array.isArray(res)) setVisitors(res);
    } catch (err) {
      console.error("Live visitors fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/stats/sessions');
      if (res.status === 'success' && Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const fetchGlobalEvents = async () => {
    try {
      const res = await api.get('/stats/live-events');
      if (res.success) {
        liveEventsRef.current = res.data;
        setLiveEvents(res.data);
      }
    } catch (err) {
      console.error("Error fetching global events:", err);
    }
  };

  const fetchVisitorDetails = async (visitorId) => {
    try {
      const [eventsRes, deviceRes] = await Promise.all([
        api.get(`/stats/live-events?visitorId=${visitorId}`),
        api.get(`/analytics/device?visitorId=${visitorId}`)
      ]);
      
      if (eventsRes.success) {
        setLiveEvents(eventsRes.data);
        liveEventsRef.current = eventsRes.data;
      }
      if (deviceRes.success) setDeviceDetails(deviceRes.data);
    } catch (err) {
      console.error("Error fetching visitor details:", err);
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchGlobalEvents();
    fetchSessions();
    
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', { withCredentials: true, transports: ['polling', 'websocket'], autoConnect: typeof window !== 'undefined' });
    }

    socket.on("adminLiveEvent", (event) => {
      if (isFiltered && selectedVisitor && event.visitorId !== selectedVisitor.visitorId) {
        return;
      }
      liveEventsRef.current = [event, ...liveEventsRef.current].slice(0, 50);
      setLiveEvents([...liveEventsRef.current]);
      if (activeTab === 'sessions') fetchSessions(); // refresh sessions on new event
    });

    socket.on("newVisitor", () => fetchVisitors());

    return () => {
      socket.off("adminLiveEvent");
      socket.off("newVisitor");
    };
  }, [selectedVisitor, isFiltered, activeTab]);

  const handleVisitorSelect = (v) => {
    if (selectedVisitor?.visitorId === v.visitorId) {
      setSelectedVisitor(null);
      setDeviceDetails(null);
      setIsFiltered(false);
      fetchGlobalEvents();
    } else {
      setSelectedVisitor(v);
      setIsFiltered(true);
      fetchVisitorDetails(v.visitorId);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#050505] overflow-hidden animate-in fade-in duration-700">
      {/* Top Utility Bar */}
      <div className="p-6 bg-white dark:bg-[#080808] border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest leading-none">Forensic Live Monitor</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{visitors.length} Active Nodes · System Live</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Internal Tabs */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
             <button 
               onClick={() => setActiveTab('events')}
               className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
             >
               Real-time Feed
             </button>
             <button 
               onClick={() => setActiveTab('sessions')}
               className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400'}`}
             >
               Session History
             </button>
          </div>

          {isFiltered && (
            <button 
              onClick={() => handleVisitorSelect(selectedVisitor)}
              className="px-4 py-2 bg-rose-500/10 text-[10px] font-bold text-rose-500 uppercase tracking-widest rounded-lg hover:bg-rose-500/20 transition-all flex items-center gap-2 border border-rose-500/20"
            >
              <X size={12} /> Clear Filter
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Visitor Directory */}
        <div className="w-[340px] border-r border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#080808] flex flex-col">
          <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Traffic Hub</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {visitors.map((v) => (
              <button
                key={v.visitorId}
                onClick={() => handleVisitorSelect(v)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group border ${
                  selectedVisitor?.visitorId === v.visitorId 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' 
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  selectedVisitor?.visitorId === v.visitorId ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  <Globe size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold truncate tracking-tight ${selectedVisitor?.visitorId === v.visitorId ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {v.userName || v.ip || 'ANON_NODE'}
                  </p>
                  {v.isRegistered && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-bold rounded uppercase tracking-widest">
                       User
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                      {v.location?.countryCode === 'BD' ? '🇧🇩 ' : '🌍 '}{v.location?.country || 'Unknown'}
                    </span>
                    <span className="text-[8px] opacity-40">·</span>
                    <span className="text-[9px] font-bold opacity-60">
                      {v.device || 'Desktop'}
                    </span>
                  </div>
                </div>
                {selectedVisitor?.visitorId === v.visitorId && <ChevronRight size={14} className="text-white/40" />}
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Event / Session Stream */}
        <div className="flex-1 bg-white dark:bg-[#060606] flex flex-col border-r border-slate-200/60 dark:border-white/5">
          <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] flex items-center justify-between">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {activeTab === 'events' ? 'Signal Stream' : 'Persistent Sessions'}
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest">Live Flow</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'events' ? (
              <div className="p-6 space-y-4">
                {liveEvents.length === 0 ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-20">
                    <Activity size={48} strokeWidth={1} />
                    <p className="font-bold uppercase tracking-widest text-[10px]">Awaiting Signal Input</p>
                  </div>
                ) : (
                  liveEvents.map((event, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={idx} 
                      className="flex gap-4 group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          event.eventType?.includes('error') ? 'bg-rose-500/10 text-rose-500' : 
                          event.eventType === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-slate-100 dark:bg-white/5 text-slate-400'
                        }`}>
                          <Zap size={14} fill="currentColor" className="opacity-80" />
                        </div>
                        <div className="w-[1px] flex-1 bg-slate-100 dark:bg-white/5 group-last:hidden" />
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            {event.eventType?.replace(/_/g, ' ')}
                          </p>
                          <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {event.page} {event.element ? `· Target: ${event.element}` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest">
                             {event.userName || (event.visitorId ? `ID: ${event.visitorId.slice(0, 8)}` : 'ANONYMOUS')}
                           </span>
                           {event.country && (
                             <span className="text-[8px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest">
                               {event.country}
                             </span>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <th className="pb-4">Session Context</th>
                      <th className="pb-4">Activity</th>
                      <th className="pb-4">Temporal</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-4">
                    {sessions.map((s, idx) => (
                      <tr key={idx} className="group border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="py-4">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                            {s.userName || s.visitorId?.slice(0, 12) + '...'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {s.browser} · {s.device}
                          </p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-500 px-2 py-0.5 bg-indigo-500/10 rounded">
                              {s.pageViews} views
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              {Math.round(s.duration / 1000 / 60)}m active
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white">
                            {new Date(s.startTime).toLocaleTimeString()}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            {new Date(s.startTime).toLocaleDateString()}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Forensic Details */}
        <div className="w-[400px] bg-white dark:bg-[#080808] flex flex-col">
          {!selectedVisitor ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-6 opacity-30">
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center">
                <Info size={32} />
              </div>
              <p className="font-bold uppercase tracking-widest text-[10px]">Select a Node for Forensic Analysis</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
               {/* Identity Header */}
               <div className="p-8 border-b border-slate-50 dark:border-white/5 text-center">
                  <div className="w-24 h-24 bg-indigo-600/5 rounded-[40px] flex items-center justify-center text-5xl shadow-sm mx-auto mb-6">
                     {selectedVisitor.location?.countryCode === 'BD' ? '🇧🇩' : '🌍'}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedVisitor.userName || 'Anonymous Visitor'}</h3>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 
                    {selectedVisitor.isRegistered ? 'Registered Identity' : 'Guest Identity'} · {selectedVisitor.location?.city || 'Unknown'}, {selectedVisitor.location?.country || 'Earth'}
                  </p>
               </div>

               {/* Metrics Grid */}
               <div className="p-8 space-y-10">
                  <div className="space-y-6">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Network Interface</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <MetricCard icon={<Globe size={12}/>} label="IP Interface" value={selectedVisitor.ip} />
                      <MetricCard icon={<Clock size={12}/>} label="Last Seen" value={new Date(selectedVisitor.lastVisit).toLocaleTimeString()} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hardware Intelligence</h4>
                    {deviceDetails && deviceDetails.hardware.resolution !== 'Unknown' ? (
                      <div className="grid grid-cols-2 gap-6">
                        <MetricCard icon={<Cpu size={12}/>} label="Platform" value={deviceDetails.hardware.os} />
                        <MetricCard icon={<Monitor size={12}/>} label="Resolution" value={deviceDetails.hardware.resolution} />
                        <MetricCard icon={<Zap size={12}/>} label="Power" value={`${deviceDetails.battery.level}% · ${deviceDetails.battery.charging ? 'Charging' : 'Battery'}`} />
                        <MetricCard icon={<Shield size={12}/>} label="Security" value={deviceDetails.security.incognito ? 'Private' : 'Standard'} />
                      </div>
                    ) : deviceDetails ? (
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                         <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-400">
                            <Info size={14} />
                         </div>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No detailed signals found for this session</p>
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center gap-3">
                        <Loader2 size={14} className="animate-spin text-indigo-500" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Parsing Signals...</p>
                      </div>
                    )}
                  </div>

                  {/* Security Analysis */}
                  <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl shadow-slate-900/30">
                     <div className="flex items-center justify-between">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Forensic Audit</h4>
                        <div className="px-2 py-0.5 bg-indigo-500/20 rounded text-[8px] font-bold text-indigo-300 uppercase tracking-widest">Alpha Clear</div>
                     </div>
                     <p className="text-xs font-bold leading-relaxed text-slate-300">
                       {deviceDetails?.security.vpnDetected 
                         ? '⚠️ High Risk: VPN/Proxy detected. Behavioral patterns may be obfuscated.' 
                         : '✓ Integrity Confirmed: Normal browser environment. Interaction patterns match human baseline.'}
                     </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center">
                      Forensic GUID: {selectedVisitor.visitorId}
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.1); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); }
      `}</style>
    </div>
  );
}

const MetricCard = ({ icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">
      {icon} {label}
    </div>
    <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{value || 'Unknown'}</p>
  </div>
);
