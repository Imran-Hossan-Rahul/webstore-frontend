"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, ArrowRight, Users } from "lucide-react";

export default function AuthGuardModal({ isOpen, onClose, reason = "engage" }) {
  const router = useRouter();
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const reasonText = {
    like: "like posts",
    comment: "comment on posts",
    save: "save posts",
    download: "download templates",
    engage: "engage with the community",
  }[reason] || "engage with the community";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
        <div className="relative bg-white dark:bg-[#111] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">

          {/* Gradient banner top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-all z-10"
          >
            <X size={18} />
          </button>

          <div className="px-8 pt-10 pb-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Sparkles className="text-white" size={28} />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Join the Community
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
              Create a free account to {reasonText} and connect with creators worldwide.
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 mb-7 text-xs text-gray-400 dark:text-gray-500">
              <Users size={14} />
              <span>Thousands of creators already onboard</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/register")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Free Account
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl border border-gray-200 dark:border-white/10 transition-all"
              >
                Already have an account? Log in
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
