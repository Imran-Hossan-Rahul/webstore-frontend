"use client";

import React, { useState } from 'react';
import { Mail, Send, Loader2, X, ShieldAlert } from 'lucide-react';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';

const VerificationBanner = ({ user }) => {
  const { showToast } = useToast();
  const [resending, setResending] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const resendVerification = async () => {
    setResending(true);
    try {
      const res = await api.post('/auth/resend-verification');
      if (res.success) {
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to dispatch email', 'error');
    } finally {
      setResending(false);
    }
  };

  if (!user || user.emailVerified || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-blue-600/10 border-b border-indigo-600/20 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto px-8 py-3 flex items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-600">
                 <ShieldAlert size={16} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-blue-400">
                 Action Required: Your identity requires communication authentication to enable full features.
              </p>
           </div>
           
           <div className="flex items-center gap-6">
              <button 
                onClick={resendVerification}
                disabled={resending}
                className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:opacity-70 transition-all flex items-center gap-2"
              >
                {resending ? <Loader2 size={12} className="animate-spin" /> : <><Send size={12} /> Resend Verification Link</>}
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <X size={14} />
              </button>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerificationBanner;
