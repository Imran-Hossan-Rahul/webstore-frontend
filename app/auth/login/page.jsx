"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import TrackerClient from "@/components/TrackerClient";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!email || !password) {
      if (!email) setEmailError("Email is required");
      if (!password) setPasswordError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // Store authentication data
      Cookies.set("token", data.data.accessToken, { expires: 7 });
      Cookies.set("hasCreatorAccount", data.data.hasCreatorAccount, { expires: 7 });

      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("hasCreatorAccount", data.data.hasCreatorAccount);
      localStorage.setItem("userId", data.data._id);
      localStorage.setItem("token", data.data.accessToken);

      // Force refresh to update server components with new cookie
      router.refresh();

      // Redirect to homepage (Authenticated View)
      router.push("/");
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TrackerClient />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6">
        {/* Login Form — centered */}
        <div className="w-full max-w-[450px]">
          <div className="mb-10">
            <h2 className="text-[#1a1a1a] text-4xl font-bold mb-3 flex items-center gap-3">
              <span className="text-3xl">✦</span> Welcome Back
            </h2>
            <p className="text-[#6b7280] text-base">
              Sign in to access your dashboard and analytics.
            </p>
          </div>

          {/* Google Sign In */}
          <button className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl py-3.5 mb-3 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
            <img src="/google-svgrepo-com.svg" alt="Google" className="w-5 h-5" />
            <span className="text-[#1a1a1a] font-medium">Continue with Google</span>
          </button>

          {/* Apple Sign In */}
          <button className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white rounded-xl py-3.5 mb-6 hover:bg-[#2a2a2a] transition shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            <span className="font-medium">Continue with Apple</span>
          </button>

          {/* OR Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-[#1a1a1a] text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3.5 bg-white border-2 ${
                  emailError ? "border-red-400" : "border-gray-200"
                } rounded-xl text-[#1a1a1a] placeholder-gray-400 focus:border-purple-500 focus:outline-none transition`}
              />
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[#1a1a1a] text-sm font-semibold">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-purple-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-white border-2 ${
                    passwordError ? "border-red-400" : "border-gray-200"
                  } rounded-xl text-[#1a1a1a] placeholder-gray-400 focus:border-purple-500 focus:outline-none transition`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
            </div>

            {/* General Error */}
            {generalError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{generalError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span>→</span>}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[#6b7280] mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-purple-600 font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
