"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing from the link. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is invalid or missing.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Complexity validation matching backend
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setError("Password must contain uppercase, lowercase, number, and a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err) {
      console.error("[ResetPassword]", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid or expired reset token. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer
      title="Reset credentials"
      subtitle="Establish your new secure access credentials"
      footer={
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[15px] text-slate-500 dark:text-zinc-500 font-medium hover:text-[#111418] dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      }
    >
      <TrackerPatron />

      <AnimatePresence mode="wait">
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
              Credentials updated
            </h3>
            <p className="text-[14px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Your password has been successfully configured. Preparing security redirect...
            </p>
            <div className="mt-8 w-full max-w-[200px] h-[3px] bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
                className="h-full bg-brand-teal"
              />
            </div>
          </motion.div>
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
            {/* New Password */}
            <div className="space-y-2 mb-5">
              <label className="text-[11px] font-mono font-medium tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase px-1 block">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 transition-colors duration-300">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`w-full h-10 pl-10 pr-4 bg-brand-surface dark:bg-brand-surface border ${
                    error ? "border-red-500" : "border-brand-navy/[0.08] dark:border-white/10"
                  } rounded-[4px] text-[14px] font-sans text-brand-navy dark:text-white placeholder:text-slate-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-colors`}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 mb-2">
              <label className="text-[11px] font-mono font-medium tracking-[0.1em] text-slate-500 dark:text-slate-400 uppercase px-1 block">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 transition-colors duration-300">
                  <Lock size={16} strokeWidth={1.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className={`w-full h-10 pl-10 pr-4 bg-brand-surface dark:bg-brand-surface border ${
                    error ? "border-red-500" : "border-brand-navy/[0.08] dark:border-white/10"
                  } rounded-[4px] text-[14px] font-sans text-brand-navy dark:text-white placeholder:text-slate-400 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue focus:outline-none transition-colors`}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-[#201010] border border-red-200 dark:border-red-900/50 rounded-[4px] p-4 flex gap-3 items-center mt-2"
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
              disabled={loading || !token}
              variant="primary"
              className="w-full mt-4"
            >
              {loading ? (
                <AppleSpinner size={20} className="text-white" />
              ) : (
                <>
                  <span>Save Credentials</span>
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
