"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, API_BASE_URL } from '@/utils/api';
import { ChevronLeft, CheckCircle2, XCircle, X, Maximize2, ArrowUpRight } from "lucide-react";
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import UserIntelligenceHub from '@/components/AdminComponents/UserIntelligenceHub';

export default function VerificationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { showToast } = useToast();

  const [dossier, setDossier] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/verification/admin/requests`);
      const found = res.data.find(r => r._id === id);
      
      if (found) {
        setRequest(found);
        const dossierRes = await api.get(`/stats/user/${found.user?._id}/dossier`);
        setDossier(dossierRes.data);
      } else {
        showToast('Request not found', 'error');
        router.push('/admin');
      }
    } catch (err) {
      showToast('System failure: Data unreadable', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    const reason = status === 'rejected' ? prompt("Rejection Reason:") : prompt("Admin Review Notes:");
    if (status === 'rejected' && !reason) return;

    try {
      await api.put(`/verification/admin/review/${id}`, { 
        status, 
        adminNotes: reason,
        rejectionReason: status === 'rejected' ? reason : undefined 
      });
      showToast(`Audit Finalized: ${status.toUpperCase()}`, 'success');
      router.push('/admin');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-white/5 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white pb-32">
      {/* Ultra Minimal Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
        <div className="max-w-[1200px] mx-auto px-8 h-24 flex items-center justify-between">
           <div className="flex items-center gap-8">
              <button 
                onClick={() => router.back()}
                className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
                Requests
              </button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
              <h1 className="text-[11px] font-medium uppercase tracking-widest text-slate-400">Forensic Audit _<span className="text-slate-900 dark:text-white">Review</span></h1>
           </div>

           <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
             Status: <span className="text-slate-900 dark:text-white">{request?.status}</span>
           </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 mt-20 space-y-24">
        
        {/* Verification Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
           <AssetCard 
             label="Primary Identity" 
             type={request.idType.replace('_', ' ')}
             url={getFullUrl(request.idDocumentFront)} 
             onClick={() => { setPreviewImage(getFullUrl(request.idDocumentFront)); setIsPreviewOpen(true); }}
           />
           <AssetCard 
             label="Biometric Signal" 
             type="Live Selfie"
             url={getFullUrl(request.selfieWithId)} 
             onClick={() => { setPreviewImage(getFullUrl(request.selfieWithId)); setIsPreviewOpen(true); }}
           />
        </div>

        {/* Action Controls */}
        {request.status === 'pending' && (
           <div className="flex items-center justify-center gap-12 py-16 border-y border-slate-100 dark:border-white/5">
              <button 
                onClick={() => handleReview('rejected')}
                className="text-[10px] font-medium uppercase tracking-widest text-rose-500 hover:opacity-70 transition-all"
              >
                 Decline Entry
              </button>
              <button 
                onClick={() => handleReview('approved')}
                className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-medium uppercase tracking-widest hover:opacity-90 transition-all"
              >
                 Authorize User
              </button>
           </div>
        )}

        {/* Intelligence Context */}
        <div className="space-y-16">
           <div className="flex items-center gap-4">
              <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest whitespace-nowrap">Full Behavioral Context</h4>
              <div className="h-[1px] w-full bg-slate-100 dark:bg-white/5" />
           </div>
           <UserIntelligenceHub dossier={dossier} />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/98 dark:bg-black/98 z-[200] flex items-center justify-center p-12"
            onClick={() => setIsPreviewOpen(false)}
          >
             <button className="absolute top-12 right-12 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
               <X size={32} strokeWidth={1} />
             </button>
             <img src={getOptimizedUrl(previewImage)} className="max-w-full max-h-full object-contain shadow-2xl rounded-sm" alt="Artifact" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const AssetCard = ({ label, type, url, onClick }) => (
  <div className="space-y-6 group">
    <div className="flex items-center justify-between">
       <div>
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{label}</span>
          <p className="text-[11px] font-medium text-slate-900 dark:text-white uppercase tracking-tight mt-1">{type}</p>
       </div>
       <button onClick={onClick} className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowUpRight size={18} />
       </button>
    </div>
    <div 
      onClick={onClick}
      className="aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 cursor-zoom-in"
    >
      <img src={getOptimizedUrl(url)} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="" />
    </div>
  </div>
);
