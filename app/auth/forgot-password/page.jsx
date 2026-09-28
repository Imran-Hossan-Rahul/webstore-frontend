"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";
import { Button } from "@/components/ui/Button";

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Forgot Password Page ─────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      // Always show success — never reveal whether the email exists (security)
      setSuccess(true);
    } catch (err) {
      // Show generic message for security; log real error for debugging
      console.error("[ForgotPassword]", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[15px] text-slate-500 dark:text-zinc-500 font-medium hover:text-brand-blue dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      }
    >
      <TrackerPatron />

      <AnimatePresence mode="wait">
        {/* ── Success State ──────────────────────────────────────────────── */}
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <div className="w-16 h-16 rounded-[4px] bg-brand-cloud dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 flex items-center justify-center text-brand-teal mb-6">
              <CheckCircle2 size={32} strokeWidth={2} />
            </div>
            <h3 className="text-[20px] font-display font-medium text-brand-navy dark:text-white mb-2">
              Check your inbox
            </h3>
            <p className="text-[14px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              If an account with{" "}
              <span className="font-semibold text-brand-navy dark:text-white">
                {email}
              </span>{" "}
              exists, you&apos;ll receive a reset link shortly.
            </p>

            <p className="mt-8 text-[11px] font-mono text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Didn&apos;t get it?
            </p>
            <button
              onClick={() => { setSuccess(false); setEmail(""); }}
              className="mt-2 text-brand-blue text-sm font-medium hover:underline transition-colors"
            >
              Try a different email
            </button>
          </motion.div>

        /* ── Form ──────────────────────────────────────────────────────── */
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            {/* Email input */}
            <div className="space-y-2 mb-5">
              <label className="text-[11px] font-mono font-medium tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase px-1 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 transition-colors duration-300">
                  <Mail size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className={`w-full h-10 pl-10 pr-4 bg-brand-surface dark:bg-brand-surface border ${
                    error
                      ? "border-red-500"
                      : "border-brand-navy/[0.08] dark:border-white/10"
                  } rounded-[4px] text-[14px] font-sans text-brand-navy dark:text-white placeholder:text-slate-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-colors`}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-[#201010] border border-red-200 dark:border-red-900/50 rounded-[4px] p-4 flex gap-3 items-center"
                  >
                    <p className="text-red-600 dark:text-red-400 text-[13px] font-sans font-medium">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full mt-4"
            >
              {loading ? (
                <AppleSpinner size={20} className="text-white" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthContainer>
  );
}
