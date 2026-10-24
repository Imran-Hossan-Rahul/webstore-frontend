"use client";
import Image from "next/image";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Check, ArrowRight, Zap, Target } from "lucide-react";
import { api } from "@/utils/api";

const INTERESTS_LIST = [
  "Web Development", "UI/UX Design", "3D Art", "AI & ML",
  "Mobile Apps", "Game Dev", "Cybersecurity", "Blockchain",
  "Digital Marketing", "Video Editing", "Photography", "Writing"
];

export default function UserOnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Profile Pic, 2: Interests
  const [loading, setLoading] = useState(false);
  
  // Profile Picture State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Interests State
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const toggleInterest = (interest) => {
      if (selectedInterests.includes(interest)) {
          setSelectedInterests(prev => prev.filter(i => i !== interest));
      } else {
          if (selectedInterests.length < 3) {
              setSelectedInterests(prev => [...prev, interest]);
          }
      }
  };

  const handleSubmit = async () => {
      setLoading(true);
      try {
          // 1. Upload Image (if exists)
          let avatarUrl = "";
          if (file) {
              const formData = new FormData();
              formData.append("image", file); // Must match backend field 'image'
              const uploadRes = await api.upload("/upload/user/profile-picture", formData);
              if (uploadRes.success) {
                  avatarUrl = uploadRes.data.url;
              }
          }

          // 2. Update Profile
          const payload = {
              hasCompletedOnboarding: true,
              interests: selectedInterests
          };
          
          if (avatarUrl) payload.profilePicture = avatarUrl; // Only update if new image uploaded

          const res = await api.patch("/user/profile", payload);

          if (res.success) {
               window.location.reload(); // Refresh to show new avatar/state
          }

      } catch (error) {
          console.error("Onboarding failed", error);
      } finally {
          setLoading(false);
          onClose(); // Fallback close
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-brand-surface dark:bg-slate-900 w-full max-w-md rounded-2xl overflow-hidden shadow-sm border border-white/20 relative">
            
            {/* Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-brand-surface/10 w-full">
                <div 
                    className="h-full bg-black dark:bg-brand-surface transition-all duration-500"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                />
            </div>

            <div className="p-8">
                
                {/* Step 1: Profile Picture */}
                {step === 1 && (
                    <div className="text-center animate-in slide-in-from-right duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                             Make a Statement
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Add a profile picture so patrons and community members recognize you.
                        </p>

                        <div className="flex justify-center mb-8">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-32 h-32 rounded-full border-2 border-dashed border-brand-navy/[0.10] dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#111418] dark:hover:border-white hover:bg-[#E6E9ED] dark:hover:bg-white/10 transition-all relative overflow-hidden group"
                            >
                                {previewUrl ? (
                                    <Image src={getOptimizedUrl(previewUrl)} alt="Preview" fill sizes="128px" className="object-cover" />
                                ) : (
                                    <>
                                        <Upload className="text-slate-400 mb-2 group-hover:opacity-80 transition-opacity" />
                                        <span className="text-xs text-slate-400 font-bold">Upload Photo</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            className="w-full py-3 rounded-xl bg-black dark:bg-brand-surface text-white dark:text-black font-bold hover:transform hover:opacity-80 transition-all flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight size={18} />
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full mt-3 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:text-slate-100 dark:hover:text-white transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                )}

                {/* Step 2: Interests */}
                {step === 2 && (
                    <div className="text-center animate-in slide-in-from-right duration-300">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                             Focus Your Feed
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Pick up to 3 topics you want to see.
                        </p>

                        <div className="flex flex-wrap justify-center gap-3 mb-8 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                            {INTERESTS_LIST.map(interest => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                        selectedInterests.includes(interest)
                                        ? "bg-[#111418] border-[#111418] text-white shadow-sm shadow-[rgba(17,20,24,0.20)]"
                                        : "bg-brand-surface dark:bg-brand-surface/5 border-brand-navy/[0.10] dark:border-white/10 text-brand-slate dark:text-slate-300 hover:border-[#111418]"
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-3 rounded-xl bg-black dark:bg-brand-surface text-white dark:text-black font-bold hover:transform hover:opacity-80 transition-all flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-wait" : ""}`}
                        >
                            {loading ? "Setting up..." : "Finish Setup"}
                        </button>
                        <div className="flex gap-2 mt-3">
                            <button 
                                onClick={() => setStep(1)}
                                className="flex-1 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:text-slate-100 dark:hover:text-white transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                onClick={onClose}
                                className="flex-1 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:text-slate-100 dark:hover:text-white transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
}


