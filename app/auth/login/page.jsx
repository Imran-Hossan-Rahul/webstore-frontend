"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Shield, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import SocialAuth from "@/components/Auth/SocialAuth";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  return errors;
}

// ─── Shared Input component ───────────────────────────────────────────────────

const AuthInput = ({ label, icon: Icon, error, forgotLink, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center px-1">
        <label className="text-[13px] font-semibold text-apple-secondary">
          {label}
        </label>
        {forgotLink && (
          <Link
            href="/auth/forgot-password"
            className="text-[13px] text-apple-accent hover:underline"
          >
            Forgot?
          </Link>
        )}
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-apple-muted transition-colors duration-300">
          <Icon size={18} strokeWidth={2} />
        </div>
        <input
          {...props}
          type={inputType}
          className={`w-full pl-11 ${isPassword ? "pr-11" : "pr-6"} py-3 bg-white dark:bg-[#1c1c1e] border ${
            error ? "border-red-500" : "border-gray-200 dark:border-gray-800"
          } rounded-[12px] text-[15px] text-black dark:text-white placeholder-gray-400 focus:border-[#0071e3] focus:ring-[3px] focus:ring-[#0071e3]/20 focus:outline-none transition-all duration-200 shadow-sm truncate`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-[12px] font-medium mt-1.5 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Login Page ───────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFaCode, setTwoFaCode]     = useState("");
  const [twoFaError, setTwoFaError]   = useState("");
  const [tempToken, setTempToken]     = useState("");

  // Read OAuth error params
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "token_failed") setGeneralError("OAuth authentication failed. Please try again.");
    if (errorParam === "server_error")  setGeneralError("A server error occurred. Please try again.");
  }, [searchParams]);

  // Social OAuth redirect
  const handleSocialLogin = (provider) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");
    window.location.href = `${backendUrl}/api/v1/oauth/${provider}/login`;
  };

  // ── Main login submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // Client-side validation
    const errors = validateLogin(email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      // Use api utility — sends CSRF token + httpOnly cookies automatically
      const data = await api.post("/auth/login", { email, password });

      if (data.requires2FA) {
        setRequires2FA(true);
        setTempToken(data.tempToken);
        return;
      }

      completeLogin(data.data);
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA verification ───────────────────────────────────────────────────────
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setTwoFaError("");
    if (twoFaCode.length !== 6) return;

    setLoading(true);
    try {
      const data = await api.post("/auth/verify-2fa-login", {
        tempToken,
        code: twoFaCode,
      });
      completeLogin(data.data);
    } catch (err) {
      setTwoFaError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Post-login state update ────────────────────────────────────────────────
  const completeLogin = (userData) => {
    // ✅ Tokens live in httpOnly cookies set by backend — we never touch them.
    // Store only non-sensitive UI state for fast client-side rendering.
    localStorage.setItem("user",                JSON.stringify(userData));
    localStorage.setItem("userId",              userData._id);
    
    // Store CSRF token for cross-port/cross-origin requests
    if (userData.csrfToken) {
      localStorage.setItem("XSRF-TOKEN", userData.csrfToken);
    }

    setRequires2FA(false); // 🔑 Fix: clear 2FA flag so it transitions to the success animation screen
    setLoginSuccess(true);
    // Small delay so the success animation plays before navigating
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthContainer
      title={requires2FA ? "Security Check" : "Welcome back"}
      subtitle={
        requires2FA
          ? "Enter the 6-digit code from your authenticator app"
          : "Sign in to access your account"
      }
      footer={
        !requires2FA && (
          <p className="text-center text-[15px] text-apple-secondary font-normal">
            New here?{" "}
            <Link
              href="/auth/register"
              className="text-apple-accent hover:underline transition-all"
            >
              Create an account
            </Link>
          </p>
        )
      }
    >
      <TrackerPatron />

      <AnimatePresence mode="wait">
        {/* ── 2FA Step ──────────────────────────────────────────────────── */}
        {requires2FA ? (
          <motion.form
            key="2fa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handle2FASubmit}
            className="space-y-8"
          >
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Shield size={40} />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                autoComplete="one-time-code"
                placeholder="000000"
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.5em] font-mono text-[32px] py-4 bg-apple-canvas dark:bg-apple-surface-dark border border-apple-hairline rounded-apple-lg text-apple-ink focus:border-apple-focus focus:ring-[2px] focus:ring-apple-focus focus:outline-none transition-all duration-300"
              />
              <AnimatePresence>
                {twoFaError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-[12px] font-medium"
                  >
                    {twoFaError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || twoFaCode.length !== 6}
                className="w-full bg-apple-accent hover:opacity-90 text-white text-[17px] py-[11px] rounded-apple-pill transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <AppleSpinner />
                ) : (
                  <span>Verify Account</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setRequires2FA(false); setTwoFaCode(""); setTwoFaError(""); }}
                className="w-full py-2 text-[14px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>

        /* ── Success State ──────────────────────────────────────────────── */
        ) : loginSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={56} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Authentication Successful
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-2">
              Preparing your dashboard…
            </p>
          </motion.div>

        /* ── Login Form ─────────────────────────────────────────────────── */
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SocialAuth
              onGoogle={() => handleSocialLogin("google")}
            />

            {/* Divider */}
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-apple-hairline" />
              </div>
              <div className="relative flex justify-center text-[12px] text-apple-muted">
                <span className="px-4 bg-apple-parchment dark:bg-apple-parchment">
                  or
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2" noValidate>
              <AuthInput
                label="Email"
                icon={Mail}
                type="email"
                placeholder="user@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
                error={fieldErrors.email}
              />

              <AuthInput
                label="Password"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                error={fieldErrors.password}
                forgotLink
              />

              {/* General / server error */}
              <AnimatePresence>
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-3 items-center"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-red-600 dark:text-red-400 text-[12px] font-medium">
                        {generalError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-apple-accent hover:opacity-90 text-white text-[17px] py-[14px] rounded-apple-pill transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden mt-8"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="spinner"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="animate-spin"
                      >
                        <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
                        <path d="M22 12C22 6.47715 17.5228 2 12 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <span className="text-[17px] tracking-tight font-medium">Sign In</span>
                      <ArrowRight size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContainer>
  );
}
