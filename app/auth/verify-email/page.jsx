"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import { api } from '@/utils/api';
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import AppleSpinner from "@/components/ui/AppleSpinner";
import AuthContainer from "@/components/Auth/AuthContainer";
import { Button } from "@/components/ui/Button";

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

  const titles = {
    verifying: 'Verifying email…',
    success: 'Email verified',
    error: 'Verification failed',
  };
  const subtitles = {
    verifying: 'We are confirming your email address. This will only take a moment.',
    success: 'Your email has been successfully verified. You now have full access to your account.',
    error: message || 'The verification link is invalid or has expired.',
  };

  return (
    <AuthContainer
      title={titles[status]}
      subtitle={subtitles[status]}
    >
      <div className="flex flex-col items-center py-4">
        {/* Status Icon */}
        <div className={`w-16 h-16 rounded-[4px] border flex items-center justify-center mb-8 ${
          status === 'verifying' ? 'bg-brand-cloud dark:bg-[#161B22] border-slate-200 dark:border-white/10 text-brand-blue' :
          status === 'success'   ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' :
                                   'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-500'
        }`}>
          {status === 'verifying' && <AppleSpinner className="text-brand-blue animate-spin w-8 h-8" />}
          {status === 'success'   && <CheckCircle2 size={32} strokeWidth={1.5} />}
          {status === 'error'     && <XCircle size={32} strokeWidth={1.5} />}
        </div>

        {/* Progress bar for success */}
        {status === 'success' && (
          <div className="w-full h-[3px] bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.8, ease: 'easeInOut' }}
              className="h-full bg-brand-teal"
            />
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          onClick={() => router.push('/')}
          rightIcon={<ArrowRight size={16} />}
        >
          {status === 'success' ? 'Go to Homepage' : 'Back to Home'}
        </Button>
      </div>
    </AuthContainer>
  );
}
