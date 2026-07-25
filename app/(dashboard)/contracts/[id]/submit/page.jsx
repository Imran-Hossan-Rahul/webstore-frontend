"use client";

import React, { useState, useEffect, useContext, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Rocket, ChevronLeft, Plus, Trash2, Upload, Link as LinkIcon, Video, FileText, Info, Loader2, X, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";

function ContractSubmitContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestoneId");
  const { showToast } = useToast();
  const { user } = useContext(DashboardContext) || {};
  
  const [contract, setContract] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    description: "",
    tagline: "",
    fullBrief: "",
    githubLink: "",
    accessibleLink: "",
    liveUrl: "",
    videoLink: "",
  });

  const [resources, setResources] = useState([
    { title: "", url: "", type: "link", file: null }
  ]);

  const [screenshots, setScreenshots] = useState([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);

  useEffect(() => {
    if (params.id) {
      fetchContract();
    }
  }, [params.id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${params.id}`);
      if (res.success) {
        setContract(res.data);
        if (milestoneId) {
          const m = res.data.milestones.find(m => m._id === milestoneId);
          setMilestone(m);
        }
      } else {
        showToast("Contract not found", "error");
        router.push("/contracts");
      }
    } catch (error) {
      showToast("Failed to load contract details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setScreenshots(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setScreenshotPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeScreenshot = (index) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addResource = () => {
    setResources(prev => [...prev, { title: "", url: "", type: "link", file: null }]);
  };

  const removeResource = (index) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  const updateResource = (index, field, value) => {
    setResources(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleResourceFile = (index, file) => {
    setResources(prev => prev.map((r, i) => i === index ? { ...r, file, url: `FILE_${index}`, type: 'file' } : r));
  };

  const handleSubmit = async () => {
    if (!submissionForm.title.trim()) {
      return showToast("Please provide a title for your submission", "error");
    }
    if (!submissionForm.description.trim()) {
      return showToast("Please provide a description of your work", "error");
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      
      const payload = {
        ...submissionForm,
        fullBrief: submissionForm.description, // Mapping description to fullBrief for backend consistency
        techStack: "" // Optional: add if needed
      };

      Object.keys(payload).forEach(key => {
        if (payload[key]) data.append(key, payload[key]);
      });

      // Handle screenshots
      screenshots.forEach(file => data.append("screenshots", file));

      // Handle resources
      let fileCounter = 0;
      const resourcesPayload = resources
        .filter(r => r.title || r.url || r.file)
        .map((r) => {
          if (r.file) {
            const placeholder = `FILE_${fileCounter}`;
            fileCounter++;
            return { title: r.title, url: placeholder, type: 'file' };
          }
          return { title: r.title, url: r.url, type: r.type };
        });

      data.append("resources", JSON.stringify(resourcesPayload));
      resources
        .filter(r => r.file)
        .forEach((r) => data.append("resourceFiles", r.file));

      const res = await api.upload(`/contracts/${params.id}/milestones/${milestoneId}/submit`, data);
      if (res.success) {
        showToast("Work submitted successfully!", "success");
        router.push(`/contracts/${params.id}`);
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto pt-[31px] pb-12 px-[13px] animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors font-medium text-sm group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-opacity" />
          Back to Workspace
        </button>
      </div>

      <div className="space-y-12">
        {/* Page Title */}
        <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Deploy Artifact</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                Submit your professional proof of work. Ensure all access nodes are configured and visual assets represent the quality of your deliverables.
            </p>
        </div>

        {/* Form Sections */}
        <div className="grid grid-cols-1 gap-12">
            
            {/* Identity */}
            <section className="space-y-8">
                <div className="border-b border-slate-100 dark:border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Devlog Identity</h3>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Artifact Title</label>
                        <input
                            type="text"
                            value={submissionForm.title}
                            onChange={e => setSubmissionForm({...submissionForm, title: e.target.value})}
                            placeholder="e.g. Nexus Dashboard v1.0"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Submission Memo</label>
                        <textarea
                            value={submissionForm.description}
                            onChange={e => setSubmissionForm({...submissionForm, description: e.target.value})}
                            placeholder="Detail your implementation, highlights, and any specific instructions for the patron..."
                            rows={6}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition-all resize-none shadow-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Access Nodes */}
            <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Access Nodes</h3>
                    <button onClick={addResource} className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest hover:underline">+ Add Node</button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {resources.map((res, index) => (
                        <div key={index} className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    {['link', 'file'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => updateResource(index, 'type', t)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${res.type === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105' : 'bg-white dark:bg-black/40 text-slate-400 border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                {resources.length > 1 && (
                                    <button onClick={() => removeResource(index)} className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Label</label>
                                    <input
                                        type="text"
                                        value={res.title}
                                        onChange={e => updateResource(index, 'title', e.target.value)}
                                        placeholder="e.g. Production URL"
                                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">{res.type === 'file' ? 'Asset' : 'URL'}</label>
                                    {res.type === 'file' ? (
                                        <label className="flex items-center gap-3 cursor-pointer px-4 py-2.5 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl hover:border-black dark:hover:border-white transition-all h-[42px]">
                                            <Upload size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-500 truncate">{res.file ? res.file.name : "Select Deliverable"}</span>
                                            <input type="file" hidden onChange={e => e.target.files[0] && handleResourceFile(index, e.target.files[0])} />
                                        </label>
                                    ) : (
                                        <input
                                            type="url"
                                            value={res.url}
                                            onChange={e => updateResource(index, 'url', e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white outline-none focus:border-black dark:focus:border-white"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Visual Proof */}
            <section className="space-y-8">
                <div className="border-b border-slate-100 dark:border-white/5 pb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Visual Proof</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                    <label className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group hover:border-black dark:hover:border-white bg-slate-50/50 dark:bg-transparent">
                        <div className="w-10 h-10 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-sm group-hover:opacity-80 transition-opacity">
                            <ImageIcon size={20} className="text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors tracking-widest">Add Insight</span>
                        <input type="file" hidden multiple accept="image/*" onChange={handleScreenshotsChange} />
                    </label>
                    {screenshotPreviews.map((preview, index) => (
                        <div key={index} className="aspect-square relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 group shadow-md hover:shadow-xl transition-all">
                            <img src={preview} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-80" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-600/90 to-rose-600/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                <button onClick={() => removeScreenshot(index)} className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors">
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer Actions */}
            <div className="pt-20 border-t border-slate-100 dark:border-white/5 flex flex-col items-center space-y-6">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full max-w-md py-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:opacity-80 active:opacity-60 transition-all flex items-center justify-center gap-4 group"
                >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-opacity" />}
                    Final Deployment
                </button>
                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Secure Escrow Protection Active
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    3-Day Security Hold Applies
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default function ContractSubmitPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    }>
      <ContractSubmitContent />
    </Suspense>
  );
}
