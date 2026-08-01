import React, { useState, useEffect, useContext } from 'react';
import { api } from '@/utils/api';
import { ShieldCheck, Linkedin, Github, ExternalLink, CheckCircle2, Award, Lock, ArrowRight, UserCheck, Zap, Info, Check as LucideCheck, X as LucideX } from "lucide-react";
import { useToast } from '@/components/ui/ToastProvider';
import { DashboardContext } from '@/app/(dashboard)/layout';
import VerificationForm from './VerificationForm';
import { motion, AnimatePresence } from 'framer-motion';
import AppleSpinner from "@/components/ui/AppleSpinner";

const TieredVerification = () => {
  const { user, fetchUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [activeTier, setActiveTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const isTier1Completed = user?.isVerified || user?.verificationStatus === 'approved';
  const isTier2Completed = !!user?.verificationGrants?.tier2Awarded;
  const isTier3Completed = !!user?.verificationGrants?.tier3Awarded;

  const tiers = [
    {
      id: 1,
      title: "Identity Foundation",
      reward: user?.role === 'patron' ? 10 : 5,
      icon: <ShieldCheck size={24} />,
      description: "Secure your account with legal identity verification.",
      status: isTier1Completed ? "completed" : (user?.verificationStatus === 'pending' ? "pending" : "available"),
      features: ["Legal Name Registry", "Biometric Audit", "Fraud Protection"],
      eligible: true
    },
    {
      id: 2,
      title: "Professional Authority",
      reward: 20,
      icon: <Linkedin size={24} />,
      description: "Link your professional network to build platform trust.",
      status: isTier2Completed ? "completed" : "available",
      features: ["LinkedIn/GitHub Verification", "Career History Audit", "Instant Grant"],
      eligible: true
    },
    {
      id: 3,
      title: "Profile Sovereignty",
      reward: 10,
      icon: <Award size={24} />,
      description: "Establish your professional identity with a 100% complete profile.",
      status: isTier3Completed ? "completed" : "available",
      features: ["Verified Bio", "Skill Certification", "Portfolio Snapshot"],
      eligible: true
    }
  ];

  const handleLinkSubmit = async () => {
    if (!linkUrl) {
      showToast("Please provide a valid URL", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/verification/professional-link', {
        platform: selectedPlatform,
        url: linkUrl
      });
      if (res.success) {
        showToast(res.message, "success");
        setActiveTier(null);
        fetchUser(); 
      }
    } catch (err) {
      showToast(err.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimProfileReward = async () => {
    setLoading(true);
    try {
      const res = await api.post('/verification/claim-profile-reward');
      if (res.success) {
        showToast(res.message, "success");
        fetchUser();
      }
    } catch (err) {
      if (!err.message?.includes("profile incomplete")) {
        showToast(err.message || "Claim failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const isTier3RequirementsMet = Object.values({
    bio: (user?.bio?.length || 0) >= 50,
    pic: !!user?.profilePicture,
    skills: (user?.skills?.length || 0) > 0,
    email: user?.emailVerified
  }).every(v => v);

  return (
    <div className="space-y-12">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">Verification Hub</h1>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {tiers.map((tier) => (
            <div 
              key={tier.id}
              onClick={() => tier.eligible && tier.status === 'available' && setActiveTier(tier.id)}
              className={`relative bg-white dark:bg-slate-900 border rounded-3xl p-8 transition-all flex flex-col justify-between overflow-hidden group ${
                tier.status === 'completed' ? 'border-emerald-500/30 shadow-emerald-500/5 shadow-xl' : 'border-slate-200 dark:border-white/10 hover:border-indigo-600/30 shadow-sm'
              } ${tier.eligible && tier.status === 'available' ? 'cursor-pointer hover:opacity-80 active:opacity-60' : 'opacity-60 cursor-not-allowed grayscale-[0.2]'}`}
            >
               {tier.status === 'completed' && (
                 <div className="absolute top-6 right-6 text-emerald-500">
                    <CheckCircle2 size={24} />
                 </div>
               )}

               {!tier.eligible && (
                 <div className="absolute top-6 right-6 text-gray-300">
                    <Lock size={20} />
                 </div>
               )}

               <div className="space-y-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    tier.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-white/5 text-slate-400'
                  }`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">{tier.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{tier.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.features.map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {f}
                      </span>
                    ))}
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <span className="text-2xl font-bold text-slate-900 dark:text-white">+{tier.reward}</span>
                     <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">TKNS</span>
                  </div>
                  
                  {tier.status === 'completed' ? (
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Completed</span>
                  ) : tier.status === 'pending' ? (
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">In Review</span>
                  ) : !tier.eligible ? (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTier(tier.id); }}
                      className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80 active:opacity-60 transition-all shadow-lg"
                    >
                      <ArrowRight size={18} />
                    </button>
                  )}
               </div>
               
               <div className={`absolute -bottom-12 -right-12 w-32 h-32 blur-[80px] rounded-full transition-all group-hover:w-48 group-hover:h-48 ${
                 tier.status === 'completed' ? 'bg-emerald-500/10' : 'bg-indigo-600/5'
               }`} />
            </div>
         ))}
      </div>

      <AnimatePresence>
        {activeTier && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
               <button 
                 onClick={() => setActiveTier(null)}
                 className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all z-10"
               >
                  <LucideX size={20} />
               </button>

               {activeTier === 1 && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <VerificationForm />
                 </div>
               )}

               {activeTier === 2 && (
                 <div className="max-w-2xl mx-auto space-y-10 py-6">
                    <div className="text-center space-y-4">
                       <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Professional Link</h2>
                       <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                          Authorize your professional network to verify your career history and claim your authority tokens.
                       </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={20} /> },
                         { id: 'github', name: 'GitHub', icon: <Github size={20} /> }
                       ].map(p => (
                         <button 
                           key={p.id}
                           onClick={() => setSelectedPlatform(p.id)}
                           className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${
                             selectedPlatform === p.id ? 'border-indigo-600 bg-indigo-600/5 text-indigo-600' : 'border-slate-50 dark:border-white/5 text-slate-400 hover:border-slate-200'
                           }`}
                         >
                            {p.icon}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{p.name}</span>
                         </button>
                       ))}
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Profile URL</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full py-5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl outline-none px-8 text-sm font-bold tracking-tight focus:ring-4 ring-indigo-600/10 transition-all"
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                             <ExternalLink size={18} />
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleLinkSubmit}
                      disabled={loading || !selectedPlatform || !linkUrl}
                      className="w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:opacity-80 active:opacity-60 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                    >
                       {loading ? <AppleSpinner className="animate-spin" size={18} /> : "Finalize Linkage"}
                    </button>
                 </div>
               )}

               {activeTier === 3 && (
                 <div className="max-w-2xl mx-auto space-y-10 py-6 text-center">
                    <div className="w-20 h-20 bg-indigo-600/10 text-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-4 animate-bounce">
                       <UserCheck size={40} />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Claim Authority</h2>
                       <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                          Establish your full digital identity. Ensure your Bio, Profile Picture, and Skills are optimized to claim your bonus.
                       </p>
                    </div>
                    
                    <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 text-left border border-slate-100 dark:border-white/10">
                       {[
                         { label: "Bio Quality", status: (user?.bio?.length || 0) >= 50, hint: "Min 50 characters" },
                         { label: "Identity Visuals", status: !!user?.profilePicture, hint: "Avatar uploaded" },
                         { label: "Skill Clusters", status: (user?.skills?.length || 0) > 0, hint: "At least 1 skill" },
                         { label: "Email Verified", status: user?.emailVerified, hint: "Identity confirmed" }
                       ].map((item, idx) => (
                         <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-black/20 rounded-2xl shadow-sm">
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                               <span className="text-[9px] text-slate-500 font-medium italic">{item.hint}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${item.status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-gray-300'}`}>
                               {item.status ? <LucideCheck size={14} strokeWidth={4} /> : <LucideX size={14} strokeWidth={4} />}
                            </div>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-6">
                      <button 
                        onClick={handleClaimProfileReward}
                        disabled={loading || !isTier3RequirementsMet}
                        className={`w-full py-6 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                          isTier3RequirementsMet 
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80 active:opacity-60' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed opacity-60 grayscale-[0.5]'
                        }`}
                      >
                         {loading ? <AppleSpinner className="animate-spin" size={18} /> : (
                           isTier3RequirementsMet ? "Claim 10 TKNS Reward" : "Audit Pending - Requirements Unmet"
                         )}
                      </button>

                      {!isTier3RequirementsMet && (
                        <p 
                          onClick={() => window.location.href = '/dashboard/dashboard?view=settings'} 
                          className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline animate-pulse"
                        >
                          Return to Command Center to Update Profile
                        </p>
                      )}
                    </div>
                 </div>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-8 p-8 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
         <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-500 shrink-0">
            <Lock size={24} />
         </div>
         <div className="space-y-2">
            <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Scarcity & Authority Protocol</h4>
            <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
               Tokens awarded through verification are a one-time grant. This ensures the platform economy remains deflationary and high-value. Verification data is end-to-end encrypted and used only for career authenticity audits.
            </p>
         </div>
      </div>

    </div>
  );
};

export default TieredVerification;

