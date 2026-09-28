"use client";
import { useState } from "react";
import { X, ChevronRight, CheckCircle, User } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

export default function CraftsmanOnboardingModal({ isOpen, onClose, onSuccess }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // ...
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    skills: "",
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !formData.displayName.trim()) {
      showToast("Display Name is required to continue.", "warning", "Required Field");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(s => s);
      
      const payload = {
        displayName: formData.displayName,
        bio: formData.bio,
        skills: skillsArray
      };

      const res = await api.post("/craftsman/create", payload);
      
      if (res.success) {
        // Update local storage to reflect craftsman status immediately
        if (typeof window !== 'undefined') {
            localStorage.setItem("hasCraftsmanAccount", "true");
        }
        
        if (onSuccess) onSuccess();
        // Force refresh or let the parent handle it? 
        // Ideally we just close and the parent (Dashboard) sees the new state.
        // But since we are ON the /user/craftsman page, it might need a reload/refetch.
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      showToast(error.message || "Failed to create craftsman account. Please try again.", "error", "Setup Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#15121e] border border-purple-500/20 rounded-2xl w-full max-w-2xl shadow-sm relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-[#2a2438]">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 mb-4 ring-1 ring-white/10">
              <User className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 1 && "Welcome to Craftsman Mode"}
              {step === 2 && "Tell us about yourself"}
              {step === 3 && "You're all set!"}
            </h2>
            <p className="text-slate-400">
              {step === 1 && "Let's set up your public profile identity."}
              {step === 2 && "Help others discover your talents."}
              {step === 3 && "Ready to start your journey?"}
            </p>
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[#2a2438] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition"
                    placeholder="e.g. Creative Studio"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  This is how you will appear to other users publicly.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Bio & Skills */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-4 bg-[#2a2438] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition min-h-[100px]"
                  placeholder="Tell your story... (Optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2a2438] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition"
                  placeholder="e.g. React, Design, 3D Art"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-300">
              <div className="bg-[#2a2438]/50 rounded-2xl p-6 border border-purple-500/10">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                        {formData.displayName.charAt(0).toUpperCase()}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{formData.displayName}</h3>
                <p className="text-sm text-slate-400 mb-3">{formData.skills || "Artist"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic max-w-sm mx-auto">
                    &quot;{formData.bio || "Ready to create!"}&quot;
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
             {step > 1 ? (
                <button 
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-6 py-2.5 text-slate-400 hover:text-white font-medium transition"
                >
                    Back
                </button>
             ) : (
                 // Placeholder to keep spacing
                 <div /> 
             )}

             {step < 3 ? (
                <button
                    onClick={handleNext}
                    disabled={step === 1 && !formData.displayName.trim()}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-surface text-black rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step <ChevronRight size={18} />
                </button>
             ) : (
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-sm hover:shadow-purple-500/25 transition disabled:opacity-70"
                >
                    {loading ? "Creating..." : "Finish Setup"} <CheckCircle size={18} />
                </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}

