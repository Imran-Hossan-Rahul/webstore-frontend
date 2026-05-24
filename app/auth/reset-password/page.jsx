"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

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
              Credentials updated
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Your password has been successfully configured. Preparing security redirect...
            </p>
            <div className="mt-8 w-full max-w-[200px] h-[3px] bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.8, ease: "easeInOut" }}
                className="h-full bg-emerald-500"
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
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-zinc-400 tracking-wide uppercase px-1 block">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-950/50 border-2 ${
                    error ? "border-red-500/50" : "border-slate-100 dark:border-zinc-800"
                  } rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all duration-300`}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 dark:text-zinc-400 tracking-wide uppercase px-1 block">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-950/50 border-2 ${
                    error ? "border-red-500/50" : "border-slate-100 dark:border-zinc-800"
                  } rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all duration-300`}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-3 items-center mt-2"
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
              disabled={loading || !token}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-[17px] tracking-tight">Save Credentials</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform duration-300"
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
