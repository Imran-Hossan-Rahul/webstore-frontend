"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";

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
            className="inline-flex items-center gap-2 text-[15px] text-slate-500 dark:text-zinc-500 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={56} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Check your inbox
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              If an account with{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-300">
                {email}
              </span>{" "}
              exists, you&apos;ll receive a reset link shortly.
            </p>

            <p className="mt-6 text-xs text-slate-400 dark:text-zinc-600 uppercase tracking-widest font-bold">
              Didn&apos;t get it?
            </p>
            <button
              onClick={() => { setSuccess(false); setEmail(""); }}
              className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
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
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-zinc-400 tracking-wide uppercase px-1 block">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="patron@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-950/50 border-2 ${
                    error
                      ? "border-red-500/50"
                      : "border-slate-100 dark:border-zinc-800"
                  } rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all duration-300`}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-3 items-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-tighter">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-indigo-500/25 active:opacity-60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <AppleSpinner />
              ) : (
                <>
                  <span className="text-[17px] tracking-tight">Send Reset Link</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-opacity duration-300"
                  />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthContainer>
  );
}
