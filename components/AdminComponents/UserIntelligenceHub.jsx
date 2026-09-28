"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState } from 'react';
import { api, API_BASE_URL } from '@/utils/api';
import { ShieldCheck, Clock, Check, X, MapPin, Mail, Calendar, Activity, CreditCard, Globe, Monitor, History, CheckCircle2, XCircle, FileSignature, Zap, ArrowUpRight, ArrowDownLeft, Maximize2, Lock, Unlock, AlertTriangle, Search, ChevronRight, TrendingUp, User, ExternalLink, ShieldAlert, Fingerprint, MessageSquare, FileText, Image, PenTool, MessageCircle, Palette, Trophy } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const UserIntelligenceHub = ({ dossier }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!dossier) return null;

  const { profile, stats, financials, work, security, verifications, timeline, deviceFingerprint, activityHeatmap, featureUsage, behaviorSummary } = dossier;

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'financials', label: 'Financials' },
    { id: 'behavior', label: 'Behavior' },
    { id: 'security', label: 'Security' },
    { id: 'device', label: 'Device & Tech' },
    { id: 'heatmap', label: 'Activity Map' },
    { id: 'features', label: 'Feature Usage' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      FileSignature: <FileSignature size={14} />,
      CreditCard: <CreditCard size={14} />,
      ShieldCheck: <ShieldCheck size={14} />,
      Activity: <Activity size={14} />
    };
    return icons[iconName] || <Zap size={14} />;
  };

  // Calculate Eligibility on the fly for Admin
  const auditResults = {
    profileComplete: !!(profile.profilePicture && profile.name),
    bioQuality: profile.bio ? profile.bio.length : 0,
    accountAge: profile.createdAt ? Math.floor((Date.now() - new Date(profile.createdAt)) / (24 * 60 * 60 * 1000)) : 0,
    contactVerified: profile.isEmailVerified === true, // Explicit check
  };

  return (
    <div className="flex flex-col xl:flex-row gap-16">
      
      {/* Sidebar: Focused Profile */}
      <div className="xl:w-80 flex-shrink-0 space-y-12">
         <div className="space-y-8">
            <div className="relative inline-block group">
               <div className="w-32 h-32 rounded-[4px] overflow-hidden bg-slate-100 dark:bg-brand-surface/5 border border-brand-navy/[0.08] dark:border-white/10">
                  <img src={getOptimizedUrl(getFullUrl(profile.profilePicture) || 'https://ui-avatars.com/api/?name=User&background=random')} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
               </div>
               {profile.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-brand-surface dark:bg-brand-surface dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white p-1.5 rounded-[4px]">
                     <ShieldCheck size={16} />
                  </div>
               )}
            </div>

            <div>
               <h2 className="text-xl font-medium tracking-tight text-slate-900 dark:text-brand-navy dark:text-white">{profile.name}</h2>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{profile.role} • ID_{profile._id.slice(-6).toUpperCase()}</p>
            </div>

            <div className="space-y-4">
               <SidebarLink icon={<Mail size={14}/>} label="Email" value={profile.email} />
               <SidebarLink icon={<MapPin size={14}/>} label="Location" value={profile.location?.country || 'Not Set'} />
               <SidebarLink icon={<Calendar size={14}/>} label="Joined" value={new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
            </div>
         </div>

         <div className="pt-8 border-t border-slate-100 dark:border-white/10">
            <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-6">Status Integrity</h4>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Account Status</span>
                  <span className={`text-[10px] font-medium uppercase tracking-widest ${profile.isActive !== false ? 'text-brand-blue' : 'text-rose-500'}`}>
                     {profile.isActive !== false ? 'Active' : 'Suspended'}
                  </span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Verification</span>
                  <span className={`text-[10px] font-medium uppercase tracking-widest ${profile.isVerified ? 'text-brand-teal' : 'text-brand-amber'}`}>
                     {profile.isVerified ? 'Verified' : 'Pending'}
                  </span>
               </div>
            </div>
         </div>
      </div>

      {/* Main Command Center */}
      <div className="flex-1 space-y-12">
         
         {/* Minimal Navigation */}
         <div className="flex items-center gap-8 border-b border-slate-100 dark:border-white/10">
            {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`pb-4 text-[11px] font-medium uppercase tracking-widest transition-all relative ${
                   activeTab === tab.id 
                     ? 'text-slate-900 dark:text-white' 
                     : 'text-slate-400 hover:text-brand-slate dark:text-slate-300 dark:hover:text-slate-200'
                 }`}
               >
                 {tab.label}
                 {activeTab === tab.id && (
                   <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-surface dark:bg-brand-surface dark:bg-brand-surface" />
                 )}
               </button>
            ))}
         </div>

         <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
               
               {/* OVERVIEW */}
               {activeTab === 'overview' && (
                 <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                    {/* Simplified Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                       <MetricBox label="Capital Flow" value={`${(stats.totalSpent + stats.totalEarned).toLocaleString()} TKNS`} />
                       <MetricBox label="Open Contracts" value={stats.contractCount} />
                       <MetricBox label="Deployments" value={stats.jobCount} />
                       <MetricBox label="Audit Score" value="98.2" />
                    </div>

                    {/* Bio Integrity Check */}
                    <div className="p-10 bg-brand-cloud dark:bg-brand-surface/[0.01] rounded-[4px] border border-slate-100 dark:border-white/10 space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Identity Bio Dossier</h4>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${auditResults.bioQuality >= 50 ? 'bg-brand-teal/10 text-brand-teal' : 'bg-rose-500/10 text-rose-500'}`}>
                             {auditResults.bioQuality} Chars • {auditResults.bioQuality >= 50 ? 'Optimal' : 'Low Quality'}
                          </span>
                       </div>
                       <p className="text-sm font-medium text-brand-slate dark:text-slate-300 leading-relaxed max-w-3xl italic">
                          &quot;{profile.bio || 'No bio provided.'}&quot;
                       </p>
                    </div>

                    {/* Timeline Sneak Peek */}
                    <div className="space-y-8">
                       <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Recent Activity Logs</h4>
                       <div className="space-y-2">
                          {timeline.slice(0, 5).map((act, i) => (
                             <div key={i} className="flex items-center justify-between py-4 group hover:px-4 hover:bg-brand-cloud dark:hover:bg-brand-surface/[0.02] rounded-[4px] transition-all duration-300 border-b border-slate-100 dark:border-white/10 last:border-0">
                                <div className="flex items-center gap-6">
                                   <div className="text-slate-400">{getIcon(act.icon)}</div>
                                   <div>
                                      <p className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-tight">{act.title}</p>
                                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{act.description}</p>
                                   </div>
                                </div>
                                <span className="text-[9px] text-slate-300 uppercase font-medium">{new Date(act.timestamp).toLocaleDateString()}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
               )}

               {/* FINANCIALS */}
               {activeTab === 'financials' && (
                 <motion.div key="financials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Aggregate Outflow</p>
                          <h3 className="text-4xl font-light tracking-tighter text-slate-900 dark:text-brand-navy dark:text-white">{stats.totalSpent.toLocaleString()} TKNS</h3>
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Aggregate Inflow</p>
                          <h3 className="text-4xl font-light tracking-tighter text-slate-900 dark:text-brand-navy dark:text-white">{stats.totalEarned.toLocaleString()} TKNS</h3>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-8">Transaction Ledger</h4>
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {financials.map((tx, i) => (
                                  <tr key={i} className="group transition-all">
                                     <td className="py-6 text-[10px] text-slate-400 uppercase font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                     <td className="py-6">
                                        <p className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-tight">
                                           {tx.sender?._id === profile._id ? tx.receiver?.name : tx.sender?.name}
                                        </p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{tx.paymentMethod}</p>
                                     </td>
                                     <td className={`py-6 text-right text-[11px] font-medium tracking-tight ${tx.sender?._id === profile._id ? 'text-rose-500' : 'text-brand-teal'}`}>
                                        {tx.sender?._id === profile._id ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency}
                                     </td>
                                     <td className="py-6 text-right">
                                        <span className={`text-[8px] font-medium uppercase tracking-widest px-3 py-1 rounded-full border ${tx.status === 'completed' ? 'border-brand-teal/10 text-brand-teal' : 'border-amber-500/10 text-brand-amber'}`}>
                                           {tx.status}
                                        </span>
                                     </td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </motion.div>
               )}

               {/* BEHAVIOR */}
               {activeTab === 'behavior' && (
                 <motion.div key="behavior" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                    <div className="relative pl-8 border-l border-slate-100 dark:border-white/10 space-y-12">
                       {timeline.map((act, i) => (
                          <div key={i} className="relative group">
                             <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-[#050505] bg-slate-200 dark:bg-brand-surface/10 group-hover:bg-brand-blue transition-all duration-500" />
                             <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                   <span className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">{new Date(act.timestamp).toLocaleDateString()}</span>
                                   <span className={`text-[8px] font-medium uppercase tracking-widest px-2 py-0.5 rounded ${act.severity === 'major' ? 'bg-brand-surface dark:bg-brand-surface dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-brand-surface/5 text-slate-400'}`}>
                                      {act.type}
                                   </span>
                                </div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-tight">{act.title}</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed max-w-xl">{act.description}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
               )}

               {/* SECURITY */}
               {activeTab === 'security' && (
                 <motion.div key="security" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                    {/* Mandatory Eligibility Audit Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <SecuritySection 
                          title="Forensic Eligibility Audit" 
                          items={[
                             { label: 'Profile Completion', value: auditResults.profileComplete ? 'OPTIMAL' : 'INCOMPLETE', color: auditResults.profileComplete ? 'text-brand-teal' : 'text-rose-500' },
                             { label: 'Bio Integrity', value: `${auditResults.bioQuality} CHARS`, color: auditResults.bioQuality >= 50 ? 'text-brand-teal' : 'text-rose-500' },
                             { label: 'Account Maturity', value: `${auditResults.accountAge} DAYS`, color: auditResults.accountAge >= 3 ? 'text-brand-teal' : 'text-rose-500' },
                             { label: 'Communication Auth', value: auditResults.contactVerified ? 'VERIFIED' : 'PENDING', color: auditResults.contactVerified ? 'text-brand-teal' : 'text-rose-500' }
                          ]}
                       />
                       <SecuritySection 
                          title="Access Architecture" 
                          items={[
                             { label: 'Entry IP Node', value: security.lastLoginIp || 'N/A' },
                             { label: 'System Agent', value: security.deviceHistory?.[0] || 'Unknown' },
                             { label: 'Login Attempts', value: security.loginAttempts || 0, color: security.loginAttempts >= 3 ? 'text-rose-500' : 'text-brand-teal' },
                             { label: 'Account Status', value: security.isLocked ? '🔴 LOCKED' : '✓ OPEN', color: security.isLocked ? 'text-rose-500' : 'text-brand-teal' },
                             { label: 'Risk Score', value: `${security.riskScore || 0}/100`, color: (security.riskScore || 0) > 50 ? 'text-rose-500' : 'text-brand-teal' },
                          ]}
                       />
                    </div>

                    {/* Risk Breakdown */}
                    {security.riskBreakdown && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Risk Breakdown</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           {Object.entries(security.riskBreakdown).map(([key, val]) => (
                             <div key={key} className="flex flex-col border-b border-slate-100 dark:border-white/10 pb-3">
                               <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                               <span className="text-[10px] font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-1">{val}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {/* Audit Logs */}
                    {security.auditLogs?.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Recent Audit Log</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                          {security.auditLogs.slice(0, 10).map((log, i) => (
                            <div key={i} className="flex items-center justify-between bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-[4px] p-4 border border-slate-100 dark:border-white/10">
                              <span className="text-[10px] font-bold text-brand-slate dark:text-slate-400 uppercase tracking-wide">{log.action || 'System Event'}</span>
                              <span className="text-[9px] text-slate-400 uppercase tracking-widest">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Identity Compliance */}
                    <div className="p-10 bg-brand-surface dark:bg-brand-surface dark:bg-brand-surface rounded-[40px] text-white dark:text-slate-900 dark:text-white flex items-center justify-between">
                       <div className="space-y-2">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Identity Compliance</h4>
                          <h3 className="text-xl font-medium tracking-tight">PLATFORM RULES AGREEMENT: <span className="text-emerald-400 dark:text-brand-teal">SIGNED</span></h3>
                       </div>
                       <ShieldAlert size={40} strokeWidth={1} className="opacity-20" />
                    </div>
                 </motion.div>
               )}

               {/* DEVICE & TECH */}
               {activeTab === 'device' && (
                 <motion.div key="device" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Browser Agent', value: deviceFingerprint?.browser || profile.browser || 'Unknown' },
                        { label: 'Operating System', value: deviceFingerprint?.os || 'Unknown' },
                        { label: 'Platform Architecture', value: deviceFingerprint?.platform || 'Unknown' },
                        { label: 'Screen Resolution', value: deviceFingerprint?.screenResolution || 'Unknown' },
                        { label: 'Color Depth', value: deviceFingerprint?.screenColorDepth ? `${deviceFingerprint.screenColorDepth}-bit` : 'Unknown' },
                        { label: 'Primary Language', value: deviceFingerprint?.language || 'Unknown' },
                        { label: 'Regional Timezone', value: deviceFingerprint?.timezone || 'Unknown' },
                        { label: 'Connection Protocol', value: deviceFingerprint?.connectionType || 'Unknown' },
                        { label: 'Hardware Concurrency', value: deviceFingerprint?.hardwareConcurrency ? `${deviceFingerprint.hardwareConcurrency} Cores` : 'Unknown' },
                        { label: 'Touch Capability', value: deviceFingerprint?.touchSupport ? 'Yes' : 'No' },
                        { label: 'Timezone Offset', value: deviceFingerprint?.timezoneOffset != null ? `${deviceFingerprint.timezoneOffset} min` : 'Unknown' },
                        { label: 'Last Signal IP', value: deviceFingerprint?.ip || security?.lastLoginIp || 'N/A' },
                      ].map((item, i) => (
                        <div key={i} className="bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-[4px] p-6 border border-slate-100 dark:border-white/10 hover:border-brand-blue/30 transition-all group">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-brand-blue">{item.label}</p>
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate tracking-tight">{item.value}</p>
                        </div>
                      ))}
                    </div>
                 </motion.div>
               )}

               {/* ACTIVITY MAP */}
               {activeTab === 'heatmap' && (
                 <motion.div key="heatmap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                    {/* Behavioral Engagement Matrix */}
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                       {[
                         { label: 'Total Sessions', value: behaviorSummary?.totalSessions || 0 },
                         { label: 'Avg Duration', value: behaviorSummary?.avgSessionDurationMs ? `${Math.round(behaviorSummary.avgSessionDurationMs / 1000)}s` : '0s' },
                         { label: 'Bounce Rate', value: `${behaviorSummary?.bounceRate || 0}%` },
                         { label: 'Max Depth', value: `${behaviorSummary?.maxScrollDepth || 0}%` },
                         { label: 'Rage Clicks', value: behaviorSummary?.rageClickCount || 0 },
                         { label: 'Exit Intents', value: behaviorSummary?.exitIntentCount || 0 },
                         { label: 'Total Engagement', value: `${stats?.avgEngagementScore || 0}/100` },
                         { label: 'Page Views', value: behaviorSummary?.totalPageViews || 0 },
                       ].map((m, i) => (
                         <div key={i} className="bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-[4px] p-6 border border-slate-100 dark:border-white/10 text-center">
                           <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">{m.value}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{m.label}</p>
                         </div>
                       ))}
                    </div>

                    {/* Hourly Distribution */}
                    {activityHeatmap?.byHour && (
                      <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-3xl p-8">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Intensity by Hour (24h Cycle)</h4>
                        <div className="flex items-end gap-1.5 h-32">
                          {activityHeatmap.byHour.map((count, hour) => {
                            const max = Math.max(...activityHeatmap.byHour, 1);
                            const h = (count / max) * 100;
                            return (
                              <div key={hour} className="flex-1 flex flex-col items-center gap-2 group" title={`${hour}:00 — ${count} signals`}>
                                <div 
                                  className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-125" 
                                  style={{ 
                                    height: `${Math.max(8, h)}%`, 
                                    background: count === max ? '#6366f1' : count > max * 0.5 ? 'rgba(99,102,241,0.6)' : 'rgba(148,163,184,0.1)' 
                                  }} 
                                />
                                {hour % 4 === 0 && <span className="text-[7px] font-bold text-slate-400 uppercase">{hour}h</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Day of Week Heatmap */}
                    {activityHeatmap?.byDay && (
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Days Pattern</h4>
                        <div className="grid grid-cols-7 gap-4">
                          {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((day, i) => {
                            const count = activityHeatmap.byDay[i] || 0;
                            const max = Math.max(...activityHeatmap.byDay, 1);
                            const opacity = 0.05 + (count / max) * 0.95;
                            return (
                              <div key={day} className="text-center space-y-3">
                                <div 
                                  className="w-full aspect-square rounded-[4px] flex items-center justify-center text-[10px] font-bold text-brand-blue border border-brand-blue/10 transition-all duration-700" 
                                  style={{ background: `rgba(99,102,241,${opacity})` }}
                                >
                                  {count}
                                </div>
                                <p className="text-[9px] font-bold text-slate-400 tracking-widest">{day}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                 </motion.div>
               )}

               {/* FEATURE USAGE */}
               {activeTab === 'features' && (
                 <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {featureUsage && Object.entries(featureUsage).map(([feature, count], i) => {
                        const icons = { 
                          chat: <MessageSquare size={14} />, 
                          jobs: <Zap size={14} />, 
                          contracts: <FileText size={14} />, 
                          posts: <Image size={14} />, 
                          codex: <PenTool size={14} />, 
                          discussions: <MessageCircle size={14} />, 
                          artifacts: <Palette size={14} />, 
                          challenges: <Trophy size={14} /> 
                        };
                        const maxCount = Math.max(...Object.values(featureUsage), 1);
                        return (
                          <div key={feature} className="bg-brand-surface dark:bg-brand-surface rounded-[32px] p-8 border border-brand-navy/[0.08] dark:border-white/10 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="text-3xl filter grayscale group-hover:grayscale-0 transition-all">{icons[feature] || '⚡'}</div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight capitalize">{feature}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{count} recorded interactions</p>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${count > 0 ? 'bg-brand-teal/10 text-brand-teal' : 'bg-slate-100 dark:bg-brand-surface/5 text-slate-400'}`}>
                                {count > 0 ? 'Active Engine' : 'Dormant'}
                              </div>
                            </div>
                            <div className="space-y-2">
                               <div className="h-2 bg-slate-100 dark:bg-brand-surface/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }} 
                                   animate={{ width: `${(count / maxCount) * 100}%` }} 
                                   transition={{ delay: i * 0.1, duration: 1 }} 
                                   className="h-full bg-brand-surface dark:bg-brand-surface dark:bg-brand-surface rounded-full" 
                                 />
                               </div>
                               <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                  <span>Usage Intensity</span>
                                  <span>{Math.round((count / maxCount) * 100)}%</span>
                               </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                 </motion.div>
               )}

            </AnimatePresence>
         </div>

      </div>
    </div>
  );
};

// --- Atomic Minimal Components ---

const SidebarLink = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 group">
     <div className="text-slate-300 group-hover:text-slate-900 dark:text-white dark:group-hover:text-white transition-colors">{icon}</div>
     <div>
        <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-medium text-slate-900 dark:text-white uppercase truncate max-w-[160px] tracking-tight">{value}</p>
     </div>
  </div>
);

const MetricBox = ({ label, value }) => (
  <div className="space-y-1">
     <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{label}</p>
     <p className="text-2xl font-light tracking-tighter text-slate-900 dark:text-brand-navy dark:text-white">{value}</p>
  </div>
);

const SecuritySection = ({ title, items }) => (
  <div className="space-y-8">
     <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{title}</h4>
     <div className="space-y-6">
        {items.map((item, i) => (
           <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className={`text-[10px] font-medium uppercase tracking-tight ${item.color || 'text-slate-900 dark:text-white'}`}>{item.value}</span>
           </div>
        ))}
     </div>
  </div>
);

export default UserIntelligenceHub;


