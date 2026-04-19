"use client";

import { useState } from "react";
import Link from "next/link";
import TrackerClient from "@/components/TrackerClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Assuming you will have an endpoint for this later:
      // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });
      
      // For now, simulate functionality
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("If an account with that email exists, we've sent a password reset link.");
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TrackerClient />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6">
        <div className="w-full max-w-[450px]">
          <div className="mb-10 text-center">
            <h2 className="text-[#1a1a1a] text-3xl font-bold mb-3">Forgot Password</h2>
            <p className="text-[#6b7280] text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-[#1a1a1a] text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[#1a1a1a] focus:bg-white focus:border-purple-500 focus:outline-none transition"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl border border-green-200">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            
            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-purple-600 font-semibold hover:underline">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
