"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { User, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AuthContainer from "@/components/Auth/AuthContainer";
import SocialAuth from "@/components/Auth/SocialAuth";
import TrackerPatron from "@/components/TrackerPatron";
import { api } from "@/utils/api";

import AppleSpinner from "@/components/ui/AppleSpinner";

// ─── Validation helpers ───────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns 0–3 strength score */
function getPasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)   score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password))    score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-yellow-400", "bg-emerald-500"];
const STRENGTH_TEXT   = ["", "text-red-500", "text-yellow-500", "text-emerald-500"];

function validateRegister({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name.trim() || name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters";
  }
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Must be at least 8 characters";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Must contain at least one uppercase letter";
  } else if (!/\d/.test(password)) {
    errors.password = "Must contain at least one number";
  }
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

// ─── Shared Input component ───────────────────────────────────────────────────

const AuthInput = ({ label, icon: Icon, error, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center px-1">
        <label className="text-[13px] font-semibold text-apple-secondary">
          {label}
        </label>
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
          } rounded-[12px] text-[15px] text-black dark:text-white placeholder-gray-400 focus:border-[#0071e3] focus:ring-0 focus:outline-none transition-colors duration-200 shadow-sm truncate`}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
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

// ─── Password Strength Bar ────────────────────────────────────────────────────

function PasswordStrengthBar({ password }) {
  const score = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="px-1 -mt-4 mb-5 space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= score ? STRENGTH_COLORS[score] : "bg-slate-200 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center px-1">
          <p className={`text-[12px] font-medium ${STRENGTH_TEXT[score]}`}>
            {STRENGTH_LABELS[score]} password
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [fieldErrors,     setFieldErrors]     = useState({});
  const [generalError,    setGeneralError]    = useState("");

  // Social OAuth redirect
  const handleSocialLogin = (provider) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "");
    window.location.href = `${backendUrl}/api/v1/oauth/${provider}/login`;
  };

  // Clear individual field error on change
  const clearError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

  const handleSignUp = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // Client-side validation
    const errors = validateRegister({ name, email, password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      // Use api utility — CSRF + credentials handled automatically
      const data = await api.post("/auth/register", { name, email, password });

      // ✅ Tokens live in httpOnly cookies — we store only UI state
      localStorage.setItem("user",                JSON.stringify(data.data));
      localStorage.setItem("userId",              data.data._id);
      
      // Store CSRF token for cross-port/cross-origin requests
      if (data.data.csrfToken) {
        localStorage.setItem("XSRF-TOKEN", data.data.csrfToken);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthContainer
      title="Create account"
      subtitle="Join the marketplace today"
      footer={
        <p className="text-center text-[15px] text-apple-secondary font-normal">
          Already a member?{" "}
          <Link
            href="/auth/login"
            className="text-apple-accent hover:underline transition-all"
          >
            Sign in here
          </Link>
        </p>
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
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account Created
            </h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-2 text-center">
              Welcome aboard! Redirecting to marketplace…
            </p>
          </motion.div>

        /* ── Register Form ──────────────────────────────────────────────── */
        ) : (
          <motion.div
            key="register"
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

            <form onSubmit={handleSignUp} className="space-y-1" noValidate>
              {/* Name */}
              <AuthInput
                label="Full Name"
                icon={User}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError("name"); }}
                error={fieldErrors.name}
              />

              {/* Email */}
              <AuthInput
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                error={fieldErrors.email}
              />

              {/* Password + Strength bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <div>
                  <AuthInput
                    label="Password"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                    error={fieldErrors.password}
                  />
                  <PasswordStrengthBar password={password} />
                </div>
                <AuthInput
                  label="Confirm"
                  icon={ShieldCheck}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {/* General / server error */}
              <AnimatePresence>
                {generalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-3 items-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    <div className="flex items-center gap-2">
                      <p className="text-red-600 dark:text-red-400 text-[12px] font-medium">
                        {generalError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms checkbox */}
              <div className="pb-4 px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center flex-shrink-0">
                    <input
                      type="checkbox"
                      required
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-apple-hairline transition-all checked:bg-apple-accent checked:border-apple-accent"
                    />
                    <svg
                      className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block text-white left-0.5 top-0.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-[14px] text-apple-secondary transition-colors">
                    I agree to the{" "}
                    <span className="font-semibold underline text-apple-ink hover:text-apple-accent transition-colors">
                      Community Guidelines
                    </span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-apple-accent hover:opacity-90 text-white text-[17px] py-[11px] rounded-apple-pill transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
              >
                {loading ? (
                  <AppleSpinner size={24} />
                ) : (
                  <>
                    <span className="text-[17px] tracking-tight">Create Account</span>
                    <ArrowRight
                      size={20} strokeWidth={1.5}
                      className="group-hover:translate-x-1 transition-opacity duration-300"
                    />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContainer>
  );
}
