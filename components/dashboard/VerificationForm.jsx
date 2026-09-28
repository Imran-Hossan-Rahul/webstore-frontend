"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import React, { useState, useEffect, useContext } from 'react';
import { DashboardContext } from '@/app/(dashboard)/layout';
import { api, API_BASE_URL } from '@/utils/api';
import { User, Building2, Upload, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle, Camera, Smartphone, Fingerprint, FileCheck, ShieldAlert, Info, Check as LucideCheck, X as LucideX, Zap } from "lucide-react";
import { useToast } from '@/components/ui/ToastProvider';
import CameraCapture from '@/components/ui/CameraCapture';
import { motion, AnimatePresence } from 'framer-motion';
import AppleSpinner from "@/components/ui/AppleSpinner";

const VerificationForm = () => {
  const { user: contextUser, fetchUser: refreshContextUser } = useContext(DashboardContext) || {};
  const [step, setStep] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [user, setUser] = useState(contextUser || null);

  const calculateEligibility = (userData) => {
    if (!userData) return {
      profileComplete: false,
      bioQuality: false,
      contactVerified: false,
      accountIntegrity: true
    };
    return {
      profileComplete: !!(userData.profilePicture && userData.name),
      bioQuality: !!(userData.bio && userData.bio.length >= 50),
      contactVerified: userData.emailVerified !== false,
      accountIntegrity: !userData.isSuspended
    };
  };

  const [eligibility, setEligibility] = useState(calculateEligibility(contextUser));
  
  const [formData, setFormData] = useState({
    category: 'individual',
    legalName: '',
    idType: 'national_id',
    idNumber: '',
    idDocumentFront: '',
    idDocumentBack: '',
    selfieWithId: '',
    rulesAgreed: false
  });

  const { showToast } = useToast();

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setEligibility(calculateEligibility(contextUser));
    } else {
      fetchEligibility();
    }
  }, [contextUser]);

  const fetchEligibility = async () => {
    try {
      const res = await api.get('/user/profile'); 
      const userData = res.data;
      setUser(userData);
      
      const checks = {
        profileComplete: !!(userData.profilePicture && userData.name),
        bioQuality: !!(userData.bio && userData.bio.length >= 50),
        contactVerified: userData.emailVerified !== false,
        accountIntegrity: !userData.isSuspended
      };
      
      setEligibility(checks);
    } catch (err) {
      showToast('Failed to sync security context', 'error');
    }
  };

  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = (API_BASE_URL || "").replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const uploadFile = async (file, field) => {
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api.upload('/upload/image', fd);
      setFormData(prev => ({ ...prev, [field]: res.url }));
      showToast('Artifact captured successfully', 'success');
    } catch (err) {
      showToast('Encryption failed. Try again.', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.rulesAgreed) {
        showToast('You must agree to the platform rules', 'warning');
        return;
    }
    setLoading(true);
    try {
      await api.post('/verification/apply', formData);
      setStep(5);
    } catch (err) {
      showToast(err.message || 'Audit submission failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (step === 5) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck className="text-brand-teal" size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Verification in Progress</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-10">
          Your information has been securely submitted for review. You will be notified once the audit is complete.
        </p>
        <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-3.5 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white rounded-xl text-xs font-semibold transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="mb-16 text-center">
         <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest mb-4">Security Protocol</p>
         <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            {step === 0 && "Eligibility Check"}
            {step === 1 && "Platform Rules"}
            {step === 2 && "Identity Type"}
            {step === 3 && "Document Upload"}
            {step === 4 && "Identity Verification"}
         </h1>
         <p className="text-xs text-slate-400 font-medium mb-10">Stage {step + 1} of 5</p>
         
         <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map(s => (
               <div key={s} className={`h-1 rounded-full transition-all duration-500 ${step === s ? 'w-10 bg-brand-blue' : 'w-2 bg-slate-100 dark:bg-brand-surface/10'}`} />
            ))}
         </div>
      </div>

      <AnimatePresence mode="wait">
         
         {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
               <div className="p-8 bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 space-y-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requirements Checklist</h4>
                  <div className="space-y-4">
                     <EligibilityItem label="Name & Profile Picture" met={eligibility?.profileComplete} />
                     <EligibilityItem label="Professional Bio (Min 50 chars)" met={eligibility?.bioQuality} />
                     <EligibilityItem label="Verified Email Address" met={eligibility?.contactVerified} />
                     <EligibilityItem label="Account Standing" met={eligibility?.accountIntegrity} />
                  </div>
               </div>
               
               <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest leading-relaxed">
                  All requirements must be <span className="text-brand-teal font-bold">verified</span> before proceeding.
               </p>

               <button 
                  disabled={!Object.values(eligibility || {}).every(v => v)}
                  onClick={nextStep}
                  className="w-full py-4.5 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-30 transition-all shadow-sm"
               >
                  Get Started
               </button>
            </motion.div>
         )}

         {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
               <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  <RuleBlock icon={<ShieldAlert size={18}/>} title="Absolute Integrity" text="Fraudulent documents or impersonation will result in immediate termination of your account." />
                  <RuleBlock icon={<Zap size={18}/>} title="Activity Commitment" text="Verified entities must maintain high professional standards." />
                  <RuleBlock icon={<Info size={18}/>} title="Data Privacy" text="Your documents are encrypted and only used for identity verification purposes." />
               </div>

               <div className="p-5 bg-brand-blue/5 rounded-2xl border border-brand-blue/10 flex items-center gap-4 cursor-pointer" onClick={() => setFormData({...formData, rulesAgreed: !formData.rulesAgreed})}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${formData.rulesAgreed ? 'bg-brand-blue border-brand-blue text-white' : 'border-brand-navy/[0.08]'}`}>
                     {formData.rulesAgreed && <LucideCheck size={12} strokeWidth={3} />}
                  </div>
                  <span className="text-[10px] font-bold text-brand-slate dark:text-slate-300 uppercase tracking-widest leading-relaxed">I agree to the Platform Code of Conduct</span>
               </div>

               <div className="flex items-center gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 border border-slate-100 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-brand-cloud transition-all">Back</button>
                  <button disabled={!formData.rulesAgreed} onClick={nextStep} className="flex-[2] py-4 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-20 transition-all shadow-sm">Continue</button>
               </div>
            </motion.div>
         )}

         {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <CategoryBtn active={formData.category === 'individual'} label="Individual" icon={<User size={18}/>} onClick={() => setFormData({...formData, category: 'individual'})} />
                  <CategoryBtn active={formData.category === 'company'} label="Corporate" icon={<Building2 size={18}/>} onClick={() => setFormData({...formData, category: 'company'})} />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Full Name</label>
                  <input 
                     type="text" 
                     value={formData.legalName}
                     onChange={(e) => setFormData({...formData, legalName: e.target.value})}
                     className="w-full py-4 bg-brand-cloud dark:bg-brand-surface/[0.02] border border-slate-100 dark:border-white/5 rounded-xl outline-none px-6 text-sm font-medium focus:border-brand-blue/50 transition-all"
                     placeholder="Enter your name as per official ID"
                  />
               </div>
               <div className="flex items-center gap-4 pt-8">
                  <button onClick={prevStep} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-slate dark:text-slate-300 transition-colors">Back</button>
                  <button disabled={!formData.legalName} onClick={nextStep} className="flex-[2] py-4 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm">Next</button>
               </div>
            </motion.div>
         )}

         {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Type</label>
                     <select 
                        value={formData.idType}
                        onChange={(e) => setFormData({...formData, idType: e.target.value})}
                        className="w-full py-4 bg-brand-cloud dark:bg-brand-surface/[0.02] border border-slate-100 dark:border-white/5 rounded-xl outline-none px-6 text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer"
                     >
                        <option value="national_id">National ID Card</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                     </select>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Number</label>
                     <input 
                        type="text" 
                        value={formData.idNumber}
                        onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                        className="w-full py-4 bg-brand-cloud dark:bg-brand-surface/[0.02] border border-slate-100 dark:border-white/5 rounded-xl outline-none px-6 text-sm font-medium focus:border-brand-blue/50 transition-all"
                     />
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photo of ID Document</label>
                  <div 
                     onClick={() => document.getElementById('idUp').click()}
                     className={`aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${formData.idDocumentFront ? 'border-brand-teal/20 bg-brand-teal/5' : 'border-slate-100 dark:border-white/5 hover:border-brand-blue/30 bg-brand-cloud/50 dark:bg-brand-surface/[0.01]'}`}
                  >
                     <input type="file" id="idUp" hidden onChange={(e) => uploadFile(e.target.files[0], 'idDocumentFront')} />
                     {uploading === 'idDocumentFront' ? <AppleSpinner className="animate-spin text-brand-blue" /> : 
                      formData.idDocumentFront ? <img src={getOptimizedUrl(getFullUrl(formData.idDocumentFront))} className="w-full h-full object-cover rounded-xl" alt="" /> :
                      <div className="flex flex-col items-center gap-3 opacity-40"><Upload size={20}/><span className="text-[9px] font-bold uppercase tracking-widest">Upload Front of ID</span></div>
                     }
                  </div>
               </div>

               <div className="flex items-center gap-4 pt-8">
                  <button onClick={prevStep} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-slate dark:text-slate-300 transition-colors">Back</button>
                  <button disabled={!formData.idDocumentFront || !formData.idNumber} onClick={nextStep} className="flex-[2] py-4 bg-slate-900 dark:bg-brand-surface text-white dark:text-slate-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm">Continue</button>
               </div>
            </motion.div>
         )}

         {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-center">
               <div className="relative w-full aspect-square max-w-[240px] mx-auto">
                  <div 
                     onClick={() => setShowCamera(true)}
                     className={`w-full h-full rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${formData.selfieWithId ? 'border-brand-blue shadow-sm shadow-blue-600/10' : 'border-slate-100 dark:border-white/5 hover:border-brand-blue/30 bg-brand-cloud/50 dark:bg-brand-surface/[0.01]'}`}
                  >
                     {uploading === 'selfieWithId' ? <AppleSpinner className="animate-spin text-brand-blue" /> : 
                      formData.selfieWithId ? <img src={getOptimizedUrl(getFullUrl(formData.selfieWithId))} className="w-full h-full object-cover scale-105" alt="" /> :
                      <div className="flex flex-col items-center gap-3 opacity-40"><Camera size={28}/><span className="text-[9px] font-bold uppercase tracking-widest">Take Selfie</span></div>
                     }
                  </div>
               </div>
               
               <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-10">
                  Ensure your face is clearly visible in well-lit conditions for biometric verification.
               </p>

               <div className="flex items-center gap-4 pt-8">
                  <button onClick={prevStep} className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-slate dark:text-slate-300 transition-colors">Back</button>
                  <button 
                     disabled={loading || !formData.selfieWithId} 
                     onClick={handleSubmit} 
                     className="flex-[2] py-4 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-20 transition-all flex items-center justify-center gap-3"
                  >
                     {loading ? <AppleSpinner className="animate-spin" size={16} /> : <><Fingerprint size={16} /> Submit for Review</>}
                  </button>
               </div>
            </motion.div>
         )}

      </AnimatePresence>

      {showCamera && (
        <CameraCapture 
          onCapture={(file) => { setShowCamera(false); uploadFile(file, 'selfieWithId'); }} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

const EligibilityItem = ({ label, met }) => (
   <div className="flex items-center justify-between group py-1.5">
      <span className={`text-xs font-medium transition-colors ${met ? 'text-brand-slate dark:text-slate-300' : 'text-slate-400'}`}>{label}</span>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${met ? 'bg-emerald-50 dark:bg-brand-teal/10 text-brand-teal' : 'bg-brand-cloud dark:bg-brand-surface/5 text-slate-300'}`}>
         {met ? <LucideCheck size={10} strokeWidth={4} /> : <LucideX size={10} strokeWidth={4} />}
      </div>
   </div>
);

const RuleBlock = ({ icon, title, text }) => (
   <div className="p-6 bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 hover:border-brand-blue/20 transition-all group">
      <div className="flex items-center gap-3 text-slate-900 dark:text-white">
         <div className="p-2 bg-brand-sky dark:bg-brand-blue/10 rounded-lg text-brand-blue transition-colors">
            {icon}
         </div>
         <h5 className="text-[11px] font-bold uppercase tracking-widest">{title}</h5>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest">{text}</p>
   </div>
);

const CategoryBtn = ({ active, label, icon, onClick }) => (
   <button onClick={onClick} className={`p-8 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${active ? 'border-brand-blue bg-brand-sky/50 dark:bg-brand-blue/5 text-brand-blue shadow-sm shadow-blue-500/5' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-brand-blue/20'}`}>
      <div className={`transition-opacity duration-300 ${active ? 'scale-110' : ''}`}>
         {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
   </button>
);

export default VerificationForm;

