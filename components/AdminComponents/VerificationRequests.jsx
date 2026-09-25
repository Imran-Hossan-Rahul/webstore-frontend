"use client";

import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, Check, X, ChevronRight, Globe, CheckCircle2, XCircle, ArrowUpRight, Zap } from "lucide-react";
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

const VerificationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filter, page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/verification/admin/requests?status=${filter}&page=${page}`);
      if (res.success) {
        setRequests(res.data);
        setPagination(res.pagination || { total: res.data.length, pages: 1 });
      }
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    router.push(`/admin/verification/${id}`);
  };

  return (
    <div className="relative min-h-[600px] space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#161B22] p-5 rounded-[4px] border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-blue rounded-[4px] flex items-center justify-center">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest leading-none">Identity Hub</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-teal rounded-full animate-pulse" /> System Compliance Engine
            </p>
          </div>
        </div>
        
        <div className="flex bg-brand-cloud dark:bg-white/5 p-1.5 rounded-[4px] border border-slate-200/50 dark:border-white/10">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-8 py-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                filter === s 
                  ? 'bg-white dark:bg-[#111] text-brand-blue border border-slate-200/50 dark:border-white/10' 
                  : 'text-slate-400 hover:text-brand-slate dark:hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="bg-white dark:bg-[#161B22] rounded-[4px] border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10 bg-brand-cloud/10 dark:bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applicant Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type / Level</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-12" />
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                     <div className="flex flex-col items-center gap-6 opacity-20">
                        <ShieldCheck size={60} strokeWidth={1} />
                        <p className="text-[11px] font-bold uppercase tracking-widest">No matching audits found</p>
                     </div>
                  </td>
                </tr>
              ) : requests.map((request) => (
                <tr 
                  key={request._id}
                  onClick={() => handleRowClick(request._id)}
                  className="group cursor-pointer hover:bg-brand-cloud dark:hover:bg-white/[0.02] transition-all duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-[4px] overflow-hidden border border-slate-100 dark:border-white/10 transition-opacity duration-300">
                          <img 
                            src={request.user?.profilePicture || 'https://ui-avatars.com/api/?name=User&background=random'} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${request.user?.isVerified ? 'bg-brand-teal' : 'bg-slate-300 dark:bg-white/10'} rounded-[4px] flex items-center justify-center border-2 border-white dark:border-[#0A0A0A]`}>
                          {request.user?.isVerified ? <Check size={10} className="text-white" /> : <Clock size={10} className="text-white" />}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-blue transition-colors tracking-tight">
                          {request.legalName || request.user?.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-[0.1em] mt-1 opacity-70">
                          {request.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-[9px] font-bold uppercase tracking-widest ${
                        request.category === 'company' 
                          ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                          : 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                      }`}>
                        {request.category}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">{request.idType.replace('_', ' ')}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      request.status === 'approved' ? 'bg-brand-teal/10 text-brand-teal' :
                      request.status === 'rejected' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-brand-amber/10 text-amber-600'
                    }`}>
                      {request.status === 'approved' && <CheckCircle2 size={12} />}
                      {request.status === 'rejected' && <XCircle size={12} />}
                      {request.status === 'pending' && <Clock size={12} />}
                      {request.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-brand-slate dark:text-slate-400 uppercase tracking-tight">
                        <Globe size={12} className="opacity-40" />
                        {request.user?.location?.country || 'Unknown'}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-5">{request.user?.location?.city || 'No City'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end">
                      <div className="w-12 h-12 rounded-[4px] bg-brand-cloud dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue group-hover:text-white group-hover: group-hover: transition-all duration-500">
                        <ArrowUpRight size={22} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-6 px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Audits Page {page} <span className="opacity-30">/</span> {pagination.pages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 flex items-center justify-center rounded-[4px] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-brand-slate dark:text-slate-400 disabled:opacity-20 hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button 
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-8 h-12 rounded-[4px] bg-white dark:bg-[#161B22] dark:bg-white text-[10px] font-bold uppercase tracking-widest text-white dark:text-slate-900 disabled:opacity-20 hover:opacity-90 transition-all"
            >
              Next Audit
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default VerificationRequests;
