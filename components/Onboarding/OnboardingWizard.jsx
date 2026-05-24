"use client";

import { useState } from "react";
import { User, Check, X } from "lucide-react";
import { api } from "@/utils/api";
// Triggering HMR update

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    skills: [],
    workType: "solo", // 'solo' or 'team'
    profilePicture: "", // URL for now, or file logic if we have upload
  });
  const [skillInput, setSkillInput] = useState("");

  const handleNext = () => setStep((p) => p + 1);
  const handleBack = () => setStep((p) => p - 1);

  const handleSkip = async () => {
      setLoading(true);
      try {
          // Just mark as completed without saving other data
          await api.patch("/user/profile", { hasCompletedOnboarding: true });
          onComplete();
      } catch (err) {
          console.error("Skip error:", err);
      } finally {
          setLoading(false);
      }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
        await api.patch("/user/profile", {
            ...formData,
            hasCompletedOnboarding: true
        });
        onComplete();
    } catch (err) {
        console.error("Onboarding error:", err);
    } finally {
        setLoading(false);
    }
  };

  const addSkill = (e) => {
      if (e.key === 'Enter' && skillInput.trim()) {
          if (!formData.skills.includes(skillInput.trim())) {
              setFormData(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
          }
          setSkillInput("");
      }
  };

  const removeSkill = (skill) => {
      setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100">
          <div 
            className="h-full bg-black transition-all duration-300 ease-out"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <User size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome! Let's get to know you.</h2>
                <p className="text-slate-500">Tell us a bit about yourself to personalize your experience.</p>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="I am a software engineer passionate about..."
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none resize-none h-32"
                  />
                  <p className="text-right text-xs text-slate-400 mt-1">{formData.bio.length}/500</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
               <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    {/* Icon removed */}
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Professional Details</h2>
                <p className="text-slate-500">How do you usually work?</p>
              </div>

              {/* Work Type */}
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({...formData, workType: 'solo'})}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.workType === 'solo' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                      <h3 className="font-bold text-lg mb-1">Solo Craftsman</h3>
                      <p className="text-sm text-slate-500">I work on devlogs by myself.</p>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, workType: 'team'})}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.workType === 'team' ? 'border-black bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                      <h3 className="font-bold text-lg mb-1">Team / Agency</h3>
                      <p className="text-sm text-slate-500">I collaborate with a team.</p>
                  </button>
              </div>

              {/* Skills */}
              <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Skills</label>
                  <div className="w-full p-3 rounded-xl bg-slate-50 border-2 border-transparent focus-within:border-black focus-within:bg-white transition-all flex flex-wrap gap-2 min-h-[56px]">
                      {formData.skills.map(skill => (
                          <span key={skill} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                          </span>
                      ))}
                      <input 
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                        placeholder="Type skill & press Enter"
                        className="bg-transparent outline-none flex-1 min-w-[120px]"
                      />
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
            <button 
                onClick={handleSkip}
                className="text-slate-500 font-medium hover:text-black transition-colors"
            >
                Skip for now
            </button>
            <div className="flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={handleBack}
                        className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                        Back
                    </button>
                )}
                <button 
                    onClick={step === 2 ? handleFinish : handleNext}
                    disabled={loading}
                    className="px-8 py-3 rounded-xl bg-black text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                    {loading ? "Saving..." : (step === 2 ? "Finish Setup" : "Continue")}
                    {!loading && step === 2 && <Check size={18} />}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

