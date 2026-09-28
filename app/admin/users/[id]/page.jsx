"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { ChevronLeft, Ban, UserCheck, Shield } from "lucide-react";
import { useToast } from '@/components/ui/ToastProvider';
import UserIntelligenceHub from '@/components/AdminComponents/UserIntelligenceHub';

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { showToast } = useToast();

  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stats/user/${id}/intelligence`);
      if (res.success) {
        setDossier(res.data);
      } else {
        showToast('User dossier not found', 'error');
        router.push('/admin');
      }
    } catch (err) {
      showToast('Failed to load user intelligence', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen ] flex items-center justify-center bg-brand-main">
        <div className="flex flex-col items-center gap-4">
           <AppleSpinner />
           <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Syncing Intelligence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ] text-slate-900 dark:text-white pb-32 bg-brand-main">
      {/* Ultra Minimal Header */}
      <div className="sticky top-0 z-50 bg-brand-surface/80 dark:bg-brand-surface/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/10">
        <div className="max-w-[1200px] mx-auto px-8 h-24 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <button 
                onClick={() => router.back()}
                className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition-all"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-opacity" />
                Registry
              </button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-brand-surface/10" />
              <h1 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">User Dossier _<span className="text-slate-900 dark:text-brand-navy dark:text-white">Audit Mode</span></h1>
           </div>

           <div className="flex gap-6">
              <button className="text-[10px] font-medium uppercase tracking-widest text-rose-500 hover:opacity-70 transition-all flex items-center gap-2">
                 Suspend Entity
              </button>
              <button className="px-6 py-2 border border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-full text-[10px] font-medium uppercase tracking-widest hover:bg-brand-surface dark:bg-brand-surface hover:text-white dark:hover:bg-brand-surface dark:hover:text-slate-900 dark:text-white transition-all">
                 Full Authorization
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 mt-20">
         <UserIntelligenceHub dossier={dossier} />
      </div>
    </div>
  );
}
