"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Lock, Globe, Server, 
  AlertTriangle, CheckCircle2, XCircle, Search, Filter 
} from 'lucide-react';
import { api } from '@/utils/api';

export default function AdminSecurityPage() {
  const [flags, setFlags] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [flagsRes, licensesRes] = await Promise.all([
        api.get('/admin/license/abuse-flags'),
        api.get('/admin/license/all?limit=500')
      ]);

      console.log("Flags API Response:", flagsRes);
      console.log("Licenses API Response:", licensesRes);

      if (Array.isArray(flagsRes)) {
        setFlags(flagsRes);
      } else if (flagsRes.success || Array.isArray(flagsRes.flags)) {
        setFlags(flagsRes.flags || []);
      }
      
      if (Array.isArray(licensesRes)) {
        setLicenses(licensesRes);
      } else if (licensesRes.success || Array.isArray(licensesRes.licenses)) {
        setLicenses(licensesRes.licenses || []);
      }
    } catch (err) {
      console.error("Failed to fetch security data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-cyan" /> Security & Licenses
          </h1>
          <p className="text-white/60 text-[14px]">Monitor IP locks, domain restrictions, and scam detection alerts.</p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Scam Detection (Abuse Flags) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Active Scam Alerts
            </h2>
            <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[12px] font-medium">
              {flags.filter(f => f.status === 'open').length} Open
            </span>
          </div>

          <div className="bg-[#080808] border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            {loading ? (
              <div className="p-12 text-center text-white/40">Loading security logs...</div>
            ) : flags.length === 0 ? (
              <div className="p-8 text-center text-green-400 flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                <span className="font-medium">No active abuse flags. Platform is secure.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                {flags.map(flag => (
                  <div key={flag._id} className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col justify-between">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        flag.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{flag.flag_type.replace(/_/g, ' ').toUpperCase()}</h3>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {flag.license_id?._id ? flag.license_id._id.slice(-8).toUpperCase() : 'UNKNOWN'}
                          </span>
                        </div>
                        <p className="text-[13px] text-white/60 mb-3">
                          Suspicious activity detected for client <strong className="text-white">{flag.license_id?.customer_id?.name || 'Unknown'}</strong>.
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-[12px]">
                          {Object.entries(flag.details).map(([key, value]) => (
                            <span key={key} className="bg-[#040608] border border-white/10 px-2.5 py-1 rounded-lg text-white/70">
                              <span className="text-white/40">{key}:</span> {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                      <button className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-[13px] font-medium hover:bg-red-500/20 transition-colors">
                        Suspend License
                      </button>
                      <button className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 border border-white/10 text-[13px] font-medium hover:bg-white/10 hover:text-white transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* License Management Widget */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-cyan" /> Domain & IP Locks <span className="text-white/40 text-[14px]">({licenses.length})</span>
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search license, product or user..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white text-[13px] focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-white/40 text-[13px] py-12 bg-[#080808] border border-white/5 rounded-2xl">Loading licenses...</div>
            ) : licenses.length === 0 ? (
              <div className="col-span-full text-center text-white/40 text-[13px] py-12 bg-[#080808] border border-white/5 rounded-2xl">No licenses found.</div>
            ) : (
              licenses
                .filter(l => 
                   l._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   (l.product_id?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (l.customer_id?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(license => (
                <div key={license._id} className="p-4 bg-[#080808] border border-white/10 rounded-2xl shadow-lg hover:border-brand-cyan/30 transition-colors group flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-medium text-brand-cyan font-mono" title={license._id}>{license._id.slice(-8).toUpperCase()}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      license.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {license.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-[14px] text-white font-medium mb-1 truncate" title={license.product_id?.title}>{license.product_id?.title || 'Unknown Product'}</p>
                    <p className="text-[12px] text-white/40 truncate">{license.customer_id?.name || 'Unknown User'}</p>
                  </div>
                  
                  <div className="space-y-2.5 mt-auto bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-[12px] text-white/70">
                      <Globe className="w-3.5 h-3.5 text-white/40 shrink-0" /> 
                      <span className="truncate">{license.authorized_domains?.length > 0 ? license.authorized_domains.join(', ') : 'No Domain Lock'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-white/70">
                      <Server className="w-3.5 h-3.5 text-white/40 shrink-0" /> 
                      <span className="truncate">{license.authorized_ips?.length > 0 ? license.authorized_ips.join(', ') : 'No IP Lock'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="text-[12px] text-brand-cyan/70 hover:text-brand-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Edit Restrictions
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
