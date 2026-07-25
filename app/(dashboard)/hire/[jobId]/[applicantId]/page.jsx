"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { ShieldCheck, ArrowLeft, Calendar, Plus, Trash2, Check, FileText, Info, Gavel, Clock, Lock, Zap, Send } from "lucide-react";

export default function HirePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useContext(DashboardContext) || {};
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [applicant, setApplicant] = useState(null);
  
  const [totalBudget, setTotalBudget] = useState(0);
  const [milestones, setMilestones] = useState([
    { title: "Devlog Initiation & Security Deposit", amount: 0, dueDate: "" }
  ]);
  const [legalTerms, setLegalTerms] = useState({
    nda: true,
    ipOwnership: "Patron",
    governingLaw: "International Standard"
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (params.jobId && params.applicantId) {
      fetchData();
    }
  }, [params.jobId, params.applicantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobRes = await api.get(`/jobs/${params.jobId}`);
      if (jobRes.success) {
        setJob(jobRes.data);
        const app = jobRes.data.applicants?.find(a => a._id === params.applicantId);
        if (app) {
          setApplicant(app);
          const rateStr = String(app.proposal?.expectedRate || jobRes.data.budget?.max || "0");
          const rangeMatch = rateStr.match(/(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)/i);
          
          let initialBudget = 0;
          if (rangeMatch) {
            initialBudget = parseFloat(rangeMatch[2]); // Use max for allocation logic
          } else {
            initialBudget = parseFloat(rateStr.replace(/[^\d.]/g, "")) || 0;
          }

          setTotalBudget(initialBudget);
          setMilestones([
            { 
              title: "Devlog Initiation & Security Deposit (20%)", 
              amount: (initialBudget * 0.2).toFixed(2), 
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
            },
            {
              title: "Final Delivery & Completion",
              amount: (initialBudget * 0.8).toFixed(2),
              dueDate: ""
            }
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load hiring data", "error");
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => {
    const currentTotal = milestones.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);
    const remaining = Math.max(0, totalBudget - currentTotal);
    setMilestones([...milestones, { title: "", amount: remaining.toFixed(2), dueDate: "" }]);
  };

  const removeMilestone = (index) => {
    if (index === 0) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    if (index === 0 && field === 'amount') return; // Lock security deposit amount
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const totalAllocated = milestones.reduce((sum, m) => sum + parseFloat(m.amount || 0), 0);
  const isBudgetMatched = Math.abs(totalAllocated - totalBudget) < 0.01;
  const firstMilestonePct = (parseFloat(milestones[0].amount) / totalBudget) * 100;

  const handleDeployContract = async () => {
    if (!termsAccepted) {
      showToast("Please accept the agreement terms to proceed", "warning");
      return;
    }
    if (!isBudgetMatched) {
      showToast("Milestone total must match the agreed budget", "error");
      return;
    }
    if (firstMilestonePct < 20) {
      showToast("Security deposit must be at least 20%", "error");
      return;
    }

    setSubmitting(true);
    try {
      const contractData = {
        title: `Service Agreement: ${job.title}`,
        description: job.description,
        budgetType: job.budget?.type || "fixed",
        agreedBudget: totalBudget,
        milestones: milestones,
        craftsmanId: applicant.user._id || applicant.user,
        jobId: job._id,
        legalTerms
      };

      const res = await api.post("/contracts", contractData);
      if (res.success) {
        await api.patch(`/jobs/${job._id}/applicants/${applicant._id}/stage`, {
          stage: "offer_sent",
          note: `Formal offer extended with ${totalBudget} TKNS budget via the new contract builder.`,
          offerId: res.data._id
        });
        showToast("Offer deployed successfully!", "success");
        router.push("/manage-jobs");
      }
    } catch (err) {
      showToast(err.message || "Failed to deploy contract", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      
      {/* Upper Navigation */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-opacity" /> Back to Candidates
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
           <Zap size={14} className="text-emerald-500" />
           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">Smart Draft Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Main Form - Document Style */}
        <div className="lg:col-span-8 space-y-12">
           <main className="bg-white dark:bg-[#0d0d0d] rounded-[48px] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
              <div className="p-12 md:p-16">
                 
                 <div className="mb-16">
                    <h1 className="text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight italic mb-4">
                       Service Agreement
                    </h1>
                    <p className="text-slate-500 font-medium">
                       Formal engagement between <span className="text-black dark:text-white font-bold">{user?.displayName}</span> and <span className="text-black dark:text-white font-bold">{applicant.user?.displayName || applicant.user?.name}</span>
                    </p>
                 </div>

                 {/* Section 1: Financials */}
                 <section className="space-y-8 mb-16">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Terms (TKNS)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-4">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Budget (TKNS)</label>
                          <div className="relative group">
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">T</span>
                             <input 
                                type="number" 
                                value={totalBudget}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setTotalBudget(val);
                                  if (milestones.length === 2) {
                                    const newM = [...milestones];
                                    newM[0].amount = (val * 0.2).toFixed(2);
                                    newM[1].amount = (val * 0.8).toFixed(2);
                                    setMilestones(newM);
                                  }
                                }}
                                className="w-full pl-12 pr-6 py-8 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl text-3xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
                             />
                          </div>
                       </div>
                       
                       <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex flex-col justify-center shadow-xl">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Platform Security</p>
                          <p className="text-xs font-medium opacity-60 leading-relaxed uppercase tracking-wider">
                             Funds are held in secure escrow. 10% platform fee applies upon milestone release.
                          </p>
                       </div>
                    </div>
                 </section>

                 {/* Section 2: Roadmap */}
                 <section className="space-y-8 mb-16">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                       <div className="flex items-center gap-3">
                          <Clock size={20} className="text-slate-400" />
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Devlog Roadmap</h3>
                       </div>
                       <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${isBudgetMatched ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                          {isBudgetMatched ? "Fully Allocated" : `${(totalBudget - totalAllocated).toFixed(2)} TKNS Remaining`}
                       </div>
                    </div>

                    <div className="space-y-4">
                       {milestones.map((m, idx) => (
                         <div key={idx} className="group p-8 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl hover:border-black dark:hover:border-white transition-all shadow-sm">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                               <div className="lg:col-span-1">
                                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-bold">
                                     {idx + 1}
                                  </div>
                               </div>
                               
                               <div className="lg:col-span-5 space-y-3">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phase Title</label>
                                  <input 
                                     type="text"
                                     placeholder="e.g. Initial Research"
                                     value={m.title}
                                     onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                                     className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 font-bold focus:border-black dark:focus:border-white outline-none transition-all text-sm"
                                  />
                               </div>

                               <div className="lg:col-span-3 space-y-3">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Budget Allocation</label>
                                  <div className="flex items-center gap-2">
                                     <span className="font-bold text-slate-400">T</span>
                                     <input 
                                        type="number"
                                        value={m.amount}
                                        onChange={(e) => updateMilestone(idx, 'amount', e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 font-bold focus:border-black dark:focus:border-white outline-none transition-all text-base"
                                     />
                                  </div>
                               </div>

                               <div className="lg:col-span-2 space-y-3">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Date</label>
                                  <input 
                                     type="date"
                                     value={m.dueDate}
                                     onChange={(e) => updateMilestone(idx, 'dueDate', e.target.value)}
                                     className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 py-2 font-bold focus:border-black dark:focus:border-white outline-none transition-all text-xs"
                                  />
                               </div>

                               <div className="lg:col-span-1 flex justify-end pb-1">
                                  {idx === 0 ? (
                                     <ShieldCheck size={20} className="text-emerald-500" />
                                  ) : (
                                     <button onClick={() => removeMilestone(idx)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                  )}
                               </div>
                            </div>
                         </div>
                       ))}
                       <button 
                          onClick={addMilestone}
                          className="w-full py-6 border-2 border-dashed border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-transparent transition-all flex items-center justify-center gap-3 shadow-sm"
                       >
                          <Plus size={16} /> Append Milestone Phase
                       </button>
                    </div>
                 </section>

                 {/* Section 3: Legalities */}
                 <section className="space-y-8">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
                       <Gavel size={20} className="text-slate-400" />
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal Directives</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div 
                          onClick={() => setLegalTerms({...legalTerms, nda: !legalTerms.nda})}
                          className={`p-8 rounded-[40px] border-2 transition-all cursor-pointer ${legalTerms.nda ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xl" : "bg-transparent border-slate-100 dark:border-white/10 text-slate-400"}`}
                       >
                          <div className="flex justify-between items-start mb-6">
                             <Lock size={32} className={legalTerms.nda ? "opacity-100" : "opacity-30"} />
                             {legalTerms.nda && <Check size={24} />}
                          </div>
                          <h4 className="text-lg font-bold uppercase tracking-tight mb-2">NDA Clause</h4>
                          <p className="text-[10px] font-medium opacity-60 leading-relaxed uppercase tracking-wider">
                             All shared data is strictly confidential.
                          </p>
                       </div>

                       <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/10 rounded-[40px] space-y-6 shadow-sm">
                          <div>
                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">IP Ownership</label>
                             <select 
                                value={legalTerms.ipOwnership}
                                onChange={(e) => setLegalTerms({...legalTerms, ipOwnership: e.target.value})}
                                className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xs font-bold outline-none shadow-sm"
                             >
                                <option value="Patron">patron default</option>
                                <option value="Craftsman">Craftsman Retains</option>
                                <option value="Shared">Bilateral Share</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Governing Law</label>
                             <input 
                                type="text"
                                value={legalTerms.governingLaw}
                                onChange={(e) => setLegalTerms({...legalTerms, governingLaw: e.target.value})}
                                className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xs font-bold outline-none shadow-sm"
                                placeholder="e.g. International Standard"
                             />
                          </div>
                       </div>
                    </div>
                 </section>

              </div>
           </main>
        </div>

        {/* Sidebar - Quick Execution */}
        <div className="lg:col-span-4 space-y-8 sticky top-24">
           
           {/* Summary Card */}
           <div className="bg-black dark:bg-white text-white dark:text-black rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                 <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Contract Execution</h4>
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contract Value</p>
                       <p className="text-6xl font-bold italic font-serif tracking-tighter">{totalBudget} <span className="text-sm font-bold text-purple-500 ml-2">TKNS</span></p>
                    </div>
                 </div>

                 <div className="space-y-6 pt-10 border-t border-white/10 dark:border-black/10">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <span className="opacity-40">Initial Deposit (20%+)</span>
                       <span className={firstMilestonePct >= 20 ? "text-emerald-500" : "text-red-500"}>{milestones[0].amount} T</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                       <span className="opacity-40">Agreement Status</span>
                       <span className="text-indigo-600">READY TO SIGN</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex gap-3 cursor-pointer group">
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${termsAccepted ? "bg-indigo-600 border-indigo-600" : "border-white/20 dark:border-black/20"}`}>
                          {termsAccepted && <Check size={14} className="text-white" />}
                          <input type="checkbox" className="hidden" onChange={(e) => setTermsAccepted(e.target.checked)} />
                       </div>
                       <span className="text-[9px] font-bold opacity-60 leading-relaxed uppercase tracking-widest group-hover:opacity-100 transition-opacity">
                          I acknowledge the escrow protection rules and authorize the security deposit.
                       </span>
                    </label>

                    <button 
                       onClick={handleDeployContract}
                       disabled={submitting || !termsAccepted || !isBudgetMatched || firstMilestonePct < 20}
                       className="w-full py-6 bg-white dark:bg-black text-black dark:text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-80 active:opacity-60 transition-all shadow-xl disabled:opacity-30"
                    >
                       {submitting ? (
                         <div className="w-5 h-5 border-2 border-black/30 border-t-black dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                       ) : (
                         <><Send size={16} /> Deploy Offer</>
                       )}
                    </button>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
           </div>

           {/* Security Tip */}
           <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[40px] border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400 mb-4">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Escrow v2.0 Protection</span>
              </div>
              <p className="text-[9px] text-blue-700/60 dark:text-blue-400/50 font-bold leading-relaxed uppercase tracking-wider">
                 Funds are only released when you approve the work. The 20% security deposit ensures devlog prioritization.
              </p>
           </div>

        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&display=swap');
        .font-serif {
          font-family: 'Playfair+Display', serif;
        }
      `}</style>
    </div>
  );
}
