"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { TrendingUp, Users, Zap, ArrowRight, X } from "lucide-react";
import Cookies from "js-cookie";

export default function CraftsmanAccountModal({ isOpen, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    displayName: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/craftsman/create", {
        displayName: formData.displayName,
      });

      if (response.success) {
        // Update localStorage and cookies with new token
        localStorage.setItem("hasCraftsmanAccount", "true");
        
        // Update token if provided
        if (response.data.accessToken) {
          localStorage.setItem("token", response.data.accessToken);
          Cookies.set("token", response.data.accessToken, { expires: 7 });
          Cookies.set("hasCraftsmanAccount", "true", { expires: 7 });
        }
        
        // Force page reload to update middleware with new token
        window.location.href = "/user/craftsman";
      }
    } catch (err) {
      setError(err.message || "Failed to create craftsman account");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 dark:bg-black text-white p-6 rounded-t-2xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Become a Craftsman</h2>
                <p className="text-purple-100 text-sm">Start earning from your creative work</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Benefits */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02]">
          <h3 className="font-semibold text-slate-900 mb-4">What you&apos;ll get:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Earn Tokens</h4>
              <p className="text-sm text-slate-600">Sell artifacts, codex, and services</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Grow Your Brand</h4>
              <p className="text-sm text-slate-600">Build your portfolio and audience</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Join Community</h4>
              <p className="text-sm text-slate-600">Connect with other craftsmen</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error.message || error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Your creative name"
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none transition-all shadow-sm"
            />
            <p className="text-xs text-slate-500 mt-1">You can add more details after creating your account</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : "Create Account"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


