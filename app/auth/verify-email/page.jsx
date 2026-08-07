"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import { api } from '@/utils/api';
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import AppleSpinner from "@/components/ui/AppleSpinner";

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  notFound();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const hasFetched = useRef(false);
  
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token && !hasFetched.current) {
      hasFetched.current = true;
      verify();
    } else if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
    }
  }, [token]);

  const verify = async () => {
    try {
      const res = await api.get(`/auth/verify-email?token=${token}`);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'Your email has been verified successfully.');
      } else {
        setStatus('error');
        setMessage(res.message || 'Verification failed.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#050505] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-[40px] p-12 text-center shadow-xl shadow-black/5"
      >
        <div className="flex justify-center mb-8">
          {status === 'verifying' && (
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center">
              <AppleSpinner className="text-blue-500 animate-spin w-10 h-10" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500" size={48} strokeWidth={1.5} />
            </div>
          )}
          {status === 'error' && (
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center">
              <XCircle className="text-rose-500" size={48} strokeWidth={1.5} />
            </div>
          )}
        </div>

        <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-3">
          {status === 'verifying' && 'Verifying…'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        
        <p className="text-[15px] text-[#86868b] leading-relaxed mb-10">
          {status === 'verifying' && 'We are verifying your email address. This will only take a moment.'}
          {status === 'success' && 'Your email has been successfully verified. You now have full access to your account.'}
          {status === 'error' && (message || 'The verification link is invalid or has expired. Please request a new one from your profile page.')}
        </p>

        <button 
          onClick={() => router.push('/')}
          className="w-full py-4 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] rounded-full text-[15px] font-medium flex items-center justify-center gap-2 group hover:opacity-80 transition-all"
        >
          {status === 'success' ? 'Go to Homepage' : 'Back to Home'}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
