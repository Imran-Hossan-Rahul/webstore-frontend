"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, Users } from "lucide-react";

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
    download: "download artifacts",
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
        <div className="relative bg-white dark:bg-[#111] rounded-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10">

          {/* Subtle line top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/10" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all z-10"
          >
            <X size={20} strokeWidth={1.5} />
          </button>

          <div className="px-8 pt-10 pb-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                <Users strokeWidth={1.5} className="text-indigo-600 dark:text-indigo-400" size={28} />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
              Join the Community
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
              Create a free account to {reasonText} and connect with craftsmen worldwide.
            </p>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-2 mb-7 text-xs text-slate-400 dark:text-slate-500">
              <Users size={16} strokeWidth={1.5} />
              <span>Thousands of craftsmen already onboard</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push("/auth/register")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:opacity-60 shadow-sm"
              >
                Create Free Account
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>

              <button
                onClick={() => router.push("/auth/login")}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 font-medium rounded-lg border border-slate-200 dark:border-white/10 transition-all"
              >
                Already have an account? Log in
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-5">
              Free forever · Token-native platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

