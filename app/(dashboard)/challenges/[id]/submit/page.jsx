"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Rocket, ArrowRight, ChevronLeft, Plus, Trash2, Upload, 
  Link as LinkIcon, Video, FileText, Github, Info, ShieldCheck, 
  Loader2, X, CheckCircle2, Trophy, Clock, Zap, Download, ExternalLink,
  Check, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "../../../layout";
import Link from "next/link";

export default function ChallengeSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };
  
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(1);
  
  // Form State
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    tagline: "",
    fullBrief: "",
    githubLink: "",
    accessibleLink: "",
    liveUrl: "",
    videoLink: "",
  });

  const [resources, setResources] = useState([
    { title: "", url: "", altText: "", type: "github", file: null }
  ]);

  const [screenshots, setScreenshots] = useState([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);

  useEffect(() => {
    fetchChallenge();
  }, [params.id]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challenges/${params.id}`);
      if (res.success) {
        setChallenge(res.data);
      } else {
        showToast("Challenge not found", "error");
        router.push("/challenges");
      }
    } catch (error) {
      console.error("Failed to fetch challenge", error);
      showToast("Failed to load challenge details", "error");
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
    setResources(prev => [...prev, { title: "", url: "", altText: "", type: "link", file: null }]);
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

  const handleDeploy = async () => {
    if (isGuest) { 
        if (requireAuth) requireAuth("submit your entry"); 
        return; 
    }
    
    // Validate devlog info
    if (!submissionForm.title.trim() || !submissionForm.fullBrief.trim()) {
      showToast("Devlog title and full brief are required", "error");
      return;
    }

    // Validate GitHub Link (backend requirement)
    const githubLinkValue = submissionForm.githubLink.trim() || resources.find(r => r.type === 'github' && r.url)?.url;
    if (!githubLinkValue) {
      showToast("GitHub Repository link is required for submission", "error");
      return;
    }

    // Validate at least one resource or link is provided
    const hasAnyAccess = githubLinkValue || 
                        submissionForm.accessibleLink.trim() || 
                        submissionForm.liveUrl.trim() || 
                        submissionForm.videoLink.trim() ||
                        resources.some(r => (r.url && r.url.trim()) || r.file);

    if (!hasAnyAccess) {
      showToast("Please share at least one link or file to access your devlog", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();

      // For backward compatibility
      const githubRes = resources.find(r => r.type === 'github' && r.url);
      const liveRes = resources.find(r => r.type === 'link' && r.url);
      const videoRes = resources.find(r => r.type === 'video' && r.url);
      const accessRes = resources.find(r => r.type === 'doc' && r.url);

      const githubLinkValue = submissionForm.githubLink.trim() || resources.find(r => r.type === 'github' && r.url)?.url || "";
      
      const updatedForm = {
        ...submissionForm,
        githubLink: githubLinkValue,
        liveUrl: submissionForm.liveUrl.trim(),
        videoLink: submissionForm.videoLink.trim(),
        accessibleLink: submissionForm.accessibleLink.trim(),
        techStack: submissionForm.techStack || "", // Ensure it's a string if sent
      };

      Object.keys(updatedForm).forEach(key => {
        if (updatedForm[key] !== undefined) {
           data.append(key, updatedForm[key]);
        }
      });
      screenshots.forEach(file => data.append("screenshots", file));

      let fileCounter = 0;
      const resourcesPayload = resources
        .filter(r => r.title || r.url || r.file)
        .map((r) => {
          if (r.file) {
            const placeholder = `FILE_${fileCounter}`;
            fileCounter++;
            return { title: r.title, url: placeholder, altText: r.altText, type: 'file' };
          }
          return { title: r.title, url: r.url, altText: r.altText, type: r.type };
        });

      data.append("resources", JSON.stringify(resourcesPayload));
      resources
        .filter(r => r.title || r.url || r.file)
        .forEach((r) => { if (r.file) data.append("resourceFiles", r.file); });

      const res = await api.upload(`/challenges/${params.id}/submit`, data);
      if (res.success) {
        showToast("Entry submitted successfully!", "success");
        router.push(`/challenges/${params.id}`);
      }
    } catch (error) {
      showToast(error.message || "Submission failed", "error");
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
    <div className="max-w-[1250px] mx-auto pt-[31px] pb-6 px-[13px] animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors font-medium text-sm"
        >
          <ChevronLeft size={16} />
          Back to Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start">
        
        {/* Main Content: Submission Wizard */}
        <div className="col-span-1 space-y-6">
          <div className="pt-4 pb-2">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                Deploy Artifact
             </h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                Complete the mission by submitting your proof of work for <span className="text-slate-900 dark:text-white font-bold">{challenge?.title}</span>.
             </p>
          </div>

          {/* Devlog Identity Section */}
          <section className="space-y-6 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">
              Devlog Identity
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Artifact Title</label>
                <input
                  type="text"
                  value={submissionForm.title}
                  onChange={e => setSubmissionForm({...submissionForm, title: e.target.value})}
                  placeholder="e.g. Nexus Dashboard v1.0"
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Brief Description</label>
                <textarea
                  value={submissionForm.fullBrief}
                  onChange={e => setSubmissionForm({...submissionForm, fullBrief: e.target.value})}
                  placeholder="Explain your approach, tech stack, and key features..."
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Access Nodes Section */}
          <section className="space-y-6 pt-12">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">
              Access Nodes
            </h3>
            <div className="space-y-4">
              {resources.map((res, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {['github', 'link', 'video', 'file'].map(t => (
                        <button
                          key={t}
                          onClick={() => updateResource(index, 'type', t)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${res.type === t ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-black/40 text-slate-400'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    {resources.length > 1 && (
                      <button onClick={() => removeResource(index)} className="text-red-500 p-1 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={res.title}
                      onChange={e => updateResource(index, 'title', e.target.value)}
                      placeholder="Node Label"
                      className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    {res.type === 'file' ? (
                      <label className="flex items-center gap-3 cursor-pointer px-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg">
                        <Upload size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 truncate">{res.file ? res.file.name : "Upload File"}</span>
                        <input type="file" hidden onChange={e => e.target.files[0] && handleResourceFile(index, e.target.files[0])} />
                      </label>
                    ) : (
                      <input
                        type="url"
                        value={res.url}
                        onChange={e => updateResource(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
                      />
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addResource} className="w-full py-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                + Add Access Node
              </button>
            </div>
          </section>

          {/* Visual Proof Section */}
          <section className="space-y-6 pt-12">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-4">
              Visual Proof
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <label className="aspect-square rounded-xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
                <ImageIcon size={20} className="text-slate-400" />
                <span className="text-[9px] font-bold uppercase text-slate-400">Add Image</span>
                <input type="file" hidden multiple accept="image/*" onChange={handleScreenshotsChange} />
              </label>
              {screenshotPreviews.map((preview, index) => (
                <div key={index} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group">
                  <img src={preview} className="w-full h-full object-cover" alt="" />
                  <button onClick={() => removeScreenshot(index)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Submission Action */}
          <div className="pt-16 pb-12">
            <button
              onClick={handleDeploy}
              disabled={isSubmitting}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} />}
              Final Deployment
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">
              Ensure all access nodes are live before submitting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
