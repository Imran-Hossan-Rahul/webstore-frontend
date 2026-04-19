"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import React from "react";

import NameInput from "@/components/Input/NameInput";
import EmailInput from "@/components/Input/EmailInput";
import PasswordInput from "@/components/Input/PasswordInput";
import CheckBox from "@/components/Input/CheckBox";
import TrackerClient from "@/components/TrackerClient";

// Custom Button Components for this specific design
const LargeSocialButton = ({ icon, text, style, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full h-12 rounded-lg font-medium flex items-center justify-center gap-3 transition-all duration-200 border ${style}`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Registration failed");

      // Store auth
      Cookies.set("token", data.data.accessToken, { expires: 7 });
      Cookies.set("hasCreatorAccount", data.data.hasCreatorAccount, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("hasCreatorAccount", data.data.hasCreatorAccount);
      localStorage.setItem("userId", data.data._id);
      localStorage.setItem("token", data.data.accessToken);

      setSuccess(true);
      
      // Force refresh to ensure Server Components see the cookie
      router.refresh();
      
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-black font-sans selection:bg-purple-100 items-center justify-center">
      <TrackerClient />
      
      {/* Form — centered */}
      <div className="w-full max-w-md px-6 py-10 fade-in">
        <div className="max-w-md w-full mx-auto">
          
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
              ✦ Welcome Back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to access your dashboard and analytics.
            </p>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-8">
            <LargeSocialButton 
              icon={<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />}
              text="Continue with Google"
              style="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-800"
            />
            <LargeSocialButton 
              icon={<img src="https://www.svgrepo.com/show/511330/apple-173.svg" className="w-5 h-5" alt="A" />}
              text="Continue with Apple"
              style="bg-black text-white border-black hover:opacity-90 dark:bg-white dark:text-black dark:border-white"
            />
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-black text-gray-400 uppercase text-xs tracking-wider">Or</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSignUp}>
            <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Full Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                />
            </div>

            {/* Split Password Row */}
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    />
                </div>
                <div className="w-1/2">
                     <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Confirm</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                 <div className="flex items-center">
                    <CheckBox />
                    <span className="ml-2 text-xs text-gray-500">Remember me</span>
                 </div>
                 <a href="/auth/login" className="text-xs font-semibold text-purple-600 hover:text-purple-700">Already have account?</a>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
                {loading ? "Creating..." : "Sign Up →"}
            </button>

            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
            {success && <p className="text-green-500 text-xs text-center mt-2">Account created successfully!</p>}
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400">
                Don't have an account? <span className="text-purple-600 font-bold cursor-pointer">Sign up for free</span>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
