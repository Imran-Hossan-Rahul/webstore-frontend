"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { ShieldCheck, ArrowLeft, Calendar, Check, FileText, Info, Gavel, Clock, Lock, ChevronRight, Play, Square, Monitor, MousePointer2, Keyboard, RefreshCw, Maximize2, X, AlertCircle, ShieldAlert, History, Plus, CheckCircle, ExternalLink, Eye, Zap, Wallet, BarChart3, ArrowUpRight, Download, Link2, Upload, PenTool, Loader2, ArrowRight, User, Trash2, Video, Image as ImageIcon, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrackerEngine from "@/utils/TrackerEngine";
import socket from "@/utils/socket";

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useContext(DashboardContext) || {};
  
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const trackerRef = useRef(null);
  
  // Checkout & Funding State
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Custom Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    type: "confirm", 
    inputPlaceholder: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleOpenImage = (url) => {
    setZoomScale(1);
    setPanPos({ x: 0, y: 0 });
    setSelectedImage(url);
  };

  const getFullUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_SOCKET_URL}${url}`;
  };

  const handleDownload = async (e, url, title) => {
    e.preventDefault();
    const finalUrl = getFullUrl(url);
    try {
      const response = await fetch(finalUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = title || "file-download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback
      window.open(finalUrl, '_blank');
    }
  };

  useEffect(() => {
    const handleWheel = (e) => {
      if (selectedImage) {
        e.preventDefault();
        setZoomScale(prev => {
          const delta = e.deltaY * -0.005;
          return Math.min(Math.max(0.5, prev + delta), 10);
        });
      }
    };
    if (selectedImage) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [selectedImage]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
  };
  
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    setPanPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  const isPatron = contract && (contract.patron?._id || contract.patron)?.toString() === user?._id?.toString();
  const isCraftsman = contract && (contract.craftsman?._id || contract.craftsman)?.toString() === user?._id?.toString();

  useEffect(() => {
    if (params.id) {
      fetchContract();
      fetchTimeLogs();
      socket.emit("chat:join", params.id);
      const handleUpdate = (data) => {
        if (data.contractId === params.id) {
          fetchContract();
          showToast(data.message || "Contract Updated", "info");
        }
      };
      socket.on("contract:update", handleUpdate);
      return () => {
        socket.off("contract:update", handleUpdate);
        if (trackerRef.current) trackerRef.current.stop();
      };
    }
  }, [params.id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${params.id}`);
      if (res.success) setContract(res.data);
    } catch (err) {
      showToast("Failed to load contract", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeLogs = async () => {
    try {
      const res = await api.get(`/contracts/${params.id}/time-logs`);
      if (res.success) {
        setTimeLogs(res.data);
        const active = res.data.find(l => l.status === "active");
        if (active && isCraftsman) initTrackerEngine(active);
      }
    } catch (err) {}
  };

  const initTrackerEngine = (session) => {
    if (trackerRef.current && trackerRef.current.isActive) return;
    setActiveTimer(session);
    trackerRef.current = new TrackerEngine({
      contractId: params.id,
      onSnapshot: async (data) => {
        try { 
          await api.post(`/contracts/${params.id}/time-logs/${session._id}/snapshot`, data); 
          fetchTimeLogs();
        } catch (err) {}
      }
    });
    trackerRef.current.start(session);
    const start = new Date(session.startTime).getTime();
    const interval = setInterval(() => setElapsedTime(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  };

  const handleStartTimer = async () => {
    try {
      const res = await api.post(`/contracts/${params.id}/time-logs/start`, { memo: "Expert Session" });
      if (res.success) {
        initTrackerEngine(res.data);
        showToast("Tracker Started", "success");
      }
    } catch (err) { showToast("Error starting tracker", "error"); }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      trackerRef.current.stop();
      const res = await api.patch(`/contracts/${params.id}/time-logs/${activeTimer._id}/stop`);
      if (res.success) {
        setActiveTimer(null);
        setElapsedTime(0);
        fetchTimeLogs();
        showToast("Session Saved", "success");
      }
    } catch (err) { showToast("Error stopping tracker", "error"); }
  };

  const handleAcceptOffer = async () => {
    try {
      setIsProcessing(true);
      const res = await api.patch(`/contracts/${params.id}/accept`);
      if (res.success) {
        setContract(res.data);
        showToast("Agreement accepted! Mission is now active.", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error accepting offer", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineOffer = async () => {
    try {
      setIsProcessing(true);
      const res = await api.patch(`/contracts/${params.id}/decline`);
      if (res.success) {
        setContract(res.data);
        showToast("Offer declined successfully.", "info");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error declining offer", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivateContract = async () => {
    try {
      setIsProcessing(true);
      const res = await api.patch(`/contracts/${params.id}/activate`);
      if (res.success) {
        setContract(res.data);
        showToast("Mission activated and funded successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to activate mission", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveMilestone = (mId) => {
    setConfirmConfig({
      title: "Approve Deliverables",
      message: "You are about to approve the work for this milestone. This starts a 3-day security hold period before funds are released.",
      confirmText: "Approve Work",
      cancelText: "Cancel",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await api.patch(`/contracts/${params.id}/milestones/${mId}/approve`);
          if (res.success) {
            setContract(res.data);
            showToast("Work approved successfully!", "success");
            setShowConfirmModal(false);
          }
        } catch (err) { showToast(err.message || "Failed to approve", "error"); }
      }
    });
    setShowConfirmModal(true);
  };

  const handleDisputeMilestone = (mId) => {
    setConfirmConfig({
      title: "Open Formal Dispute",
      message: "Please describe the reason for the dispute. An admin will review the submission.",
      confirmText: "Flag Dispute",
      cancelText: "Cancel",
      type: "input",
      inputPlaceholder: "Reason...",
      inputValue: ""
    });
    setShowConfirmModal(true);
  };

  const handleFundMilestone = (milestone) => {
    const amount = parseFloat(milestone.amount) || 0;
    setConfirmConfig({
      title: "Escrow Deposit Confirmation",
      message: `You are moving ${amount} Tokens into secure escrow for: "${milestone.title}". These funds will be held by the platform and only released to the talent upon your final work approval.`,
      confirmText: `Authorize Deposit`,
      cancelText: "Decline",
      type: "escrow_fund",
      amount: amount,
      onConfirm: async () => {
        try {
          const res = await api.post(`/contracts/${params.id}/fund`, {
            amount: amount,
            milestoneIds: [milestone._id]
          });
          if (res.success) {
            setContract(prev => ({
              ...prev,
              escrowBalance: res.data.escrowBalance,
              paymentStatus: res.data.paymentStatus,
              milestones: prev.milestones.map(m => 
                m._id === milestone._id ? { ...m, isFunded: true, status: 'funded', amountFunded: amount } : m
              )
            }));
            showToast("Escrow funded successfully!", "success");
            setShowConfirmModal(false);
            fetchContract(); // Refresh to be safe
          }
        } catch (err) {
          showToast(err.response?.data?.message || "Funding failed", "error");
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleOpenSubmission = (mId) => {
    router.push(`/contracts/${params.id}/submit?milestoneId=${mId}`);
  };

  const formatLink = (url) => {
    if (!url) return "";
    try {
      const normalized = url.startsWith('http') ? url : `https://${url}`;
      return new URL(normalized).hostname.replace('www.', '');
    } catch (e) { return url.split('/')[0] || url; }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  if (!contract) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold">Devlog not found</h2>
      <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold uppercase text-[10px]">Go back</button>
    </div>
  );

  const activeReview = contract.milestones.find(m => m.status === 'submitted' || m.status === 'holding' || m.status === 'disputed');
  const paidAmount = contract.milestones.filter(m => m.status === 'paid').reduce((s, m) => s + (parseFloat(m.amount) || 0), 0);
  const totalAmount = parseFloat(contract.agreedBudget) || 0;
  const inEscrow = contract.escrowBalance || 0;

  return (
    <div className="max-w-[1745px] mx-auto pt-[31px] pb-6 pl-[13px] pr-0 animate-in fade-in duration-500">
      
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* LEFT COLUMN: HEADER + MAIN CONTENT */}
        <div className="flex-1 min-w-0">
          {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors font-medium text-sm mb-4"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-opacity" />
            Back to Devlogs
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{contract.title}</h1>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
              contract.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              {contract.status}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isCraftsman && contract.status === 'active' && (() => {
            const submittableMilestone = contract.milestones?.find(m => m.isFunded && !['submitted', 'holding', 'paid'].includes(m.status));
            return (
              <div className="flex items-center gap-3">
                {submittableMilestone ? (
                  <button 
                    onClick={() => handleOpenSubmission(submittableMilestone._id)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-all shadow-lg hover:opacity-90"
                  >
                    <Upload size={18} />
                    Submit Work
                  </button>
                ) : (() => {
                  const submitted = contract.milestones?.find(m => m.status === 'submitted');
                  if (submitted) return (
                    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 rounded-xl font-bold text-sm">
                      <CheckCircle size={18} />
                      Work Submitted
                    </div>
                  );
                  return null;
                })()}
                
                <div className={`flex items-center gap-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl ${activeTimer ? "ring-2 ring-indigo-500" : ""}`}>
                  <div className="px-4 py-1.5 font-mono font-bold text-sm">
                    {activeTimer ? Math.floor(elapsedTime / 3600).toString().padStart(2, '0') + ":" + Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0') + ":" + (elapsedTime % 60).toString().padStart(2, '0') : "00:00:00"}
                  </div>
                  <button 
                    onClick={activeTimer ? handleStopTimer : handleStartTimer}
                    className={`p-2 rounded-lg ${activeTimer ? "bg-rose-500 text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900"}`}
                  >
                    {activeTimer ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

          <div className="space-y-8">
          
          {/* PENDING ACTIONS BANNER */}
          {contract.status === 'pending' && (
            <div className="bg-slate-900 dark:bg-white rounded-xl p-8 text-white dark:text-slate-900 shadow-xl relative overflow-hidden mb-8">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-2">
                     <h3 className="text-xl font-black tracking-tight">Contract Engagement Offer</h3>
                     <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {isCraftsman && !contract.craftsmanAccepted ? "Action Required: Review and accept to begin work" :
                         isPatron && !contract.patronAccepted && contract.craftsmanAccepted ? "Action Required: Fund escrow to activate mission" :
                         "Awaiting counterpart action..."}
                     </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                     {isCraftsman && !contract.craftsmanAccepted && (
                        <>
                           <button 
                             onClick={handleAcceptOffer}
                             disabled={isProcessing}
                             className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                           >
                             {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                             Accept Offer
                           </button>
                            <button 
                              onClick={handleDeclineOffer}
                              disabled={isProcessing}
                              className="flex-1 md:flex-none px-8 py-3 bg-white/10 dark:bg-slate-100 border border-white/10 dark:border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                              Decline
                            </button>
                        </>
                     )}

                     {isPatron && !contract.patronAccepted && contract.craftsmanAccepted && (
                        <button 
                          onClick={handleActivateContract}
                          disabled={isProcessing}
                          className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          Fund & Activate Mission
                        </button>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* PROGRESS STEPS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {["Agreement", "Escrow Funded", "Execution", "Review", "Finalized"].map((label, idx) => {
              const isDone = 
                (idx === 0 && contract.craftsmanAccepted && contract.patronAccepted) || 
                (idx === 1 && inEscrow > 0) || 
                (idx === 2 && (activeReview || contract.milestones.some(m => m.status === 'paid'))) ||
                (idx === 3 && contract.milestones.some(m => m.status === 'holding' || m.status === 'paid')) ||
                (idx === 4 && contract.status === 'completed');
                
              const isActive = 
                (idx === 2 && inEscrow > 0 && !activeReview && contract.status === 'active') || 
                (idx === 3 && activeReview && activeReview.status === 'submitted');

              return (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : isDone ? "text-emerald-500" : "text-slate-300"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : isDone ? "bg-emerald-500" : "bg-current opacity-20"}`} />
                    {label}
                    {isDone && <Check size={10} strokeWidth={4} />}
                  </div>
                  {idx < 4 && <ChevronRight size={12} className="text-slate-200" />}
                </div>
              );
            })}
          </div>

          {/* ACTIVE REVIEW SECTION */}
          {activeReview && (
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/10 rounded-xl overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Eye className="text-indigo-500" size={18} /> 
                    {activeReview.status === 'holding' ? "Approved Submission" : 
                     activeReview.status === 'disputed' ? "Disputed Submission" : 
                     isPatron ? "Review Work" : "Submitted For Review"}
                  </h3>
                </div>
                
                {isPatron && (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {activeReview.status === 'submitted' && (
                      <button onClick={() => handleDisputeMilestone(activeReview._id)} className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">Flag Dispute</button>
                    )}
                    {(activeReview.status === 'submitted' || activeReview.status === 'disputed') && (
                      <button onClick={() => handleApproveMilestone(activeReview._id)} className="flex-1 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
                        {activeReview.status === 'disputed' ? "Resolve & Approve" : "Approve Work"}
                      </button>
                    )}
                    {activeReview.status === 'holding' && (
                      <div className="px-6 py-2.5 bg-emerald-500/10 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Check size={14} /> Approved (Hold Period)
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-8 flex flex-col gap-10">
                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Narrative</label>
                  <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 min-h-[120px] whitespace-pre-wrap break-words">
                    {activeReview.submissions?.[0]?.description || "No description provided."}
                  </div>
                  {/* Standard Links */}
                  {(activeReview.submissions?.[0]?.githubLink || activeReview.submissions?.[0]?.liveUrl) && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Links</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeReview.submissions[0].githubLink && (
                          <a href={formatLink(activeReview.submissions[0].githubLink)} target="_blank" className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl hover:border-slate-400 dark:hover:border-white/20 transition-all text-xs font-bold text-slate-700 dark:text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                              <Link2 size={14} className="text-slate-500" />
                            </div>
                            <span className="truncate flex-1">GitHub Repository</span>
                            <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
                          </a>
                        )}
                        {activeReview.submissions[0].liveUrl && (
                          <a href={formatLink(activeReview.submissions[0].liveUrl)} target="_blank" className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl hover:border-slate-400 dark:hover:border-white/20 transition-all text-xs font-bold text-slate-700 dark:text-slate-300">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                              <ExternalLink size={14} className="text-emerald-500" />
                            </div>
                            <span className="truncate flex-1">Live Production</span>
                            <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Resource Nodes */}
                  {activeReview.submissions?.[0]?.resources?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource Nodes</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {activeReview.submissions[0].resources.map((res, i) => (
                          <a 
                            key={i} 
                            href={res.type === 'file' ? getFullUrl(res.url) : (res.url.startsWith('http') ? res.url : `https://${res.url}`)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (res.type === 'file') {
                                handleDownload(e, res.url, res.title || "Deliverable-File");
                              }
                            }}
                            className="group flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl hover:border-slate-400 dark:hover:border-white/20 transition-all cursor-pointer"
                          >
                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${res.type === 'file' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-slate-50 dark:bg-white/10 text-slate-500'}`}>
                               {res.type === 'file' ? <Download size={14} /> : <Link2 size={14} />}
                             </div>
                             <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold truncate text-slate-700 dark:text-slate-300">{res.title || (res.type === 'file' ? "Deliverable File" : "Reference Link")}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{res.type}</p>
                             </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshots / Digital Assets */}
                {activeReview.submissions?.[0]?.screenshots?.length > 0 && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Proof</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {activeReview.submissions[0].screenshots.map((url, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleOpenImage(url)}
                          className="group relative aspect-video bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 block cursor-zoom-in w-full"
                        >
                           <img src={url} alt="Visual Proof" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-500" />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                             <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                           </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEVLOG BRIEF */}
          {contract.description && (
            <div className="space-y-4 px-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText size={14} /> Devlog Brief & Mission Overview
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                {contract.description}
              </p>
            </div>
          )}


          </div>
        </div>

        {/* SIDEBAR CONTENT (RIGHT) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          
          {/* VAULT LEDGER */}
          <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl shadow-black/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vault Ledger</h4>
                <ShieldCheck size={18} className="text-slate-500" />
              </div>
              
              <div className="space-y-1 mb-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Valuation</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter">{totalAmount.toLocaleString()}</span>
                  <span className="text-xs font-bold text-white/40">Tokens</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Paid to Date</p>
                  <p className="text-lg font-bold">{paidAmount} T</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">In Escrow</p>
                  <p className="text-lg font-bold text-emerald-400">{inEscrow} T</p>
                </div>
              </div>
            </div>
          </div>


          {/* DEVLOG ROADMAP (MOVED TO SIDEBAR) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <History size={14} /> Devlog Roadmap
            </h4>
            <div className="space-y-3">
              {contract.milestones.map((m, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-5 hover:border-slate-400 dark:hover:border-white/20 transition-all shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold leading-tight">
                        {m.title}
                      </h4>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{m.amount} Tokens</p>
                    </div>
                    {isPatron && m.isFunded && m.status !== 'paid' && (
                      <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 shrink-0 ml-4">
                        Funded
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 mb-4">
                    {/* Content moved to top row for cleaner look */}
                  </div>

                  {isPatron && !m.isFunded && m.status !== 'paid' && contract.status === 'active' && (
                    <button 
                      onClick={() => handleFundMilestone(m)}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Fund Milestone
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVITY PULSE (Moved to Sidebar) */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2">
              <Zap size={14} className="text-amber-500" /> Activity Pulse
            </h4>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-6 max-h-[350px] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {contract.activities?.length > 0 ? (
                  contract.activities.slice().reverse().map((act, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-white/20 shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{act.message}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                          {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 text-[10px] font-bold uppercase py-4">No activity logged</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-indigo-600" size={24} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{confirmConfig.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">{confirmConfig.message}</p>
                
                {confirmConfig.type === "input" && (
                  <textarea 
                    autoFocus
                    className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm mb-8 focus:border-slate-900 dark:focus:border-white outline-none transition-all min-h-[120px]"
                    placeholder={confirmConfig.inputPlaceholder}
                    onChange={(e) => setConfirmConfig(prev => ({ ...prev, inputValue: e.target.value }))}
                  />
                )}

                {confirmConfig.type === "escrow_fund" && (
                  <div className="mb-8 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-indigo-900/40 dark:text-indigo-400/40 uppercase tracking-widest">Transaction Summary</span>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Escrow Secure</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Deposit</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{confirmConfig.amount}</span>
                        <span className="text-[10px] font-bold text-slate-400">TKNS</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mandatory Consent Checkbox */}
                {(confirmConfig.type === "escrow_fund" || confirmConfig.type === "confirm") && (
                  <label className="flex items-start gap-3 mb-8 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input 
                        type="checkbox" 
                        id="escrow-consent"
                        className="peer sr-only"
                        onChange={(e) => setConfirmConfig(prev => ({ ...prev, hasConsent: e.target.checked }))}
                      />
                      <div className="w-5 h-5 border-2 border-slate-200 dark:border-white/10 rounded-md transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-white peer-checked:border-slate-900 dark:peer-checked:border-white" />
                      <Check className="absolute inset-0 m-auto text-white dark:text-black opacity-0 peer-checked:opacity-100 transition-opacity" size={12} strokeWidth={4} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 transition-colors uppercase tracking-tight leading-snug">
                      I understand that these tokens will be held in escrow and cannot be withdrawn until work is approved or a dispute is resolved.
                    </span>
                  </label>
                )}
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowConfirmModal(false)} 
                    className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {confirmConfig.cancelText}
                  </button>
                  <button 
                    disabled={ (confirmConfig.type === "escrow_fund" || confirmConfig.type === "confirm") && !confirmConfig.hasConsent }
                    onClick={() => confirmConfig.onConfirm(confirmConfig.inputValue)}
                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-white/10 hover:opacity-80 active:opacity-60 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    {confirmConfig.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}


      </AnimatePresence>
      
      {/* IMAGE PREVIEW MODAL - Portaled to body for z-index dominance */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedImage && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10 overflow-hidden">
              <motion.div 
                key="preview-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="absolute inset-0 bg-slate-900/98 backdrop-blur-2xl" 
              />
              
              <motion.div 
                key="preview-content"
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
              >
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-[10001] pointer-events-auto p-2"
                >
                  <X size={32} />
                </button>
                
                <div 
                  className="relative cursor-grab active:cursor-grabbing pointer-events-auto will-change-transform"
                  style={{
                    transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <img 
                      src={selectedImage} 
                      alt="Visual Proof Preview" 
                      className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none pointer-events-none"
                  />
                </div>
                
                <p className="absolute bottom-10 text-white/40 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
                    Scroll to Zoom • Drag to Pan • Click backdrop to close
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
