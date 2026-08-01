"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { ShieldCheck, XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import AppleSpinner from "@/components/ui/AppleSpinner";

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const hasFetched = useRef(false);
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && !hasFetched.current) {
      hasFetched.current = true;
      verify();
    } else if (!token) {
      setStatus('error');
      setMessage('Missing verification artifact. Access denied.');
    }
  }, [token]);

  const verify = async () => {
    try {
      const res = await api.get(`/auth/verify-email?token=${token}`);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification system failure.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-[40px] p-12 text-center shadow-2xl shadow-black/5"
      >
        <div className="flex justify-center mb-8">
          {status === 'verifying' && (
            <div className="w-20 h-20 bg-indigo-600/10 rounded-2xl flex items-center justify-center">
              <AppleSpinner className="text-indigo-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center">
              <XCircle className="text-rose-500" size={40} />
            </div>
          )}
        </div>

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Security Protocol 4.0</p>
        <h1 className="text-2xl font-medium text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
          {status === 'verifying' && "Authenticating Artifact"}
          {status === 'success' && "Endpoint Verified"}
          {status === 'error' && "Auth Failure"}
        </h1>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed mb-12">
          {message || "Processing security token from centralized registry..."}
        </p>

        <button 
          onClick={() => router.push('/dashboard')}
          className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 group transition-all"
        >
          {status === 'success' ? "Access Command Center" : "Return to Base"}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-opacity" />
        </button>
      </motion.div>
    </div>
  );
}
