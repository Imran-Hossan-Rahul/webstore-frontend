"use client";
import React, { useState } from 'react';
import { BadgeCheck, Mail, Send, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/utils/api';
import { useToast } from "@/components/ui/ToastProvider";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function VerifyEmailTab({ profile, onVerified }) {
  const { showToast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      const res = await api.post('/auth/resend-verification', {});
      if (res.success) {
        setSent(true);
        showToast('Verification email sent! Check your inbox.', 'success');
      } else {
        showToast(res.message || 'Failed to send email.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send email.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (profile.emailVerified) {
    return (
      <div className="bg-brand-surface dark:bg-brand-surface rounded-[4px] p-10 shadow-sm border border-slate-100 dark:border-[#2c2c2e] max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center py-6">
          {/* Verified icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-brand-teal/10 flex items-center justify-center mb-6">
            <BadgeCheck className="w-10 h-10 text-brand-teal" strokeWidth={1.5} />
          </div>

          <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-2">
            Email Verified
          </h2>
          <p className="text-[15px] text-[#86868b] max-w-sm">
            Your email address <span className="font-medium text-[#1d1d1f] dark:text-white">{profile.email}</span> has been verified. Your account is fully secure.
          </p>

          {/* Decorative badge */}
          <div className="mt-8 flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-brand-teal/10 rounded-full">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span className="text-[13px] font-semibold text-brand-teal dark:text-emerald-400">Verified Account</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface dark:bg-brand-surface rounded-[4px] p-10 shadow-sm border border-slate-100 dark:border-[#2c2c2e] max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center py-4">

        {/* Unverified icon */}
        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-brand-amber/10 flex items-center justify-center mb-6">
          <Mail className="w-10 h-10 text-brand-amber" strokeWidth={1.5} />
        </div>

        <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-[15px] text-[#86868b] max-w-sm">
          We sent a verification link to{' '}
          <span className="font-medium text-[#1d1d1f] dark:text-white">{profile.email}</span>.
          Click the link in the email to verify your account.
        </p>

        {/* Warning note */}
        <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-brand-amber/10 rounded-2xl text-left max-w-sm w-full">
          <AlertCircle className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-700 dark:text-amber-400">
            Unverified accounts may have limited access to some features. Please verify your email.
          </p>
        </div>

        {/* Resend button */}
        <div className="mt-8 w-full max-w-sm">
          {sent ? (
            <div className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 dark:bg-brand-teal/10 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-brand-teal" />
              <span className="text-[14px] font-medium text-brand-teal dark:text-emerald-400">
                Email sent! Check your inbox.
              </span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={isSending}
              className="w-full py-3.5 bg-[#1d1d1f] dark:bg-brand-surface text-white dark:text-black rounded-full text-[15px] font-medium transition-all hover:opacity-80 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <AppleSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSending ? 'Sending…' : 'Resend Verification Email'}
            </button>
          )}
        </div>

        <p className="mt-5 text-[12px] text-[#86868b]">
          Didn't receive it? Check your spam folder or request a new link above.
        </p>
      </div>
    </div>
  );
}
