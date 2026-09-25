"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from "react";
import { X, Trophy, Calendar, Gift, Code, PenTool, Layout as LayoutIcon, ArrowRight, CheckCircle, ExternalLink, Link as LinkIcon, FileText, Clock, Users, Star } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function ChallengeDetailsModal({ challenge, isOpen, onClose, isGuest, onRequireAuth, user }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(challenge);
  
  // Form state
  const [devlogLink, setDevlogLink] = useState("");
  const [description, setDescription] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    setCurrentChallenge(challenge);
  }, [challenge]);

  const { showToast } = useToast();

  useEffect(() => {
    if (challenge.status !== 'active') return;

    const timer = setInterval(() => {
      const difference = new Date(challenge.endDate) - new Date();
      if (difference <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge.endDate, challenge.status]);

  if (!isOpen || !challenge) return null;

  const isActive = challenge.status === 'active';
  const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  const getTypeIcon = (type) => {
    switch(type) {
      case 'design': return <PenTool size={20} className="text-pink-500" />;
      case 'code': return <Code size={20} className="text-brand-blue" />;
      case 'content': return <LayoutIcon size={20} className="text-brand-teal" />;
      default: return <Trophy size={20} className="text-purple-500" />;
    }
  };

  const handleLike = async (submissionId) => {
    if (isGuest) {
      onRequireAuth("vote for a submission");
      return;
    }

    try {
      const res = await api.post(`/challenges/${currentChallenge._id}/submissions/${submissionId}/like`);
      if (res.success) {
        // Update local state
        const updatedSubmissions = currentChallenge.submissions.map(sub => {
          if (sub._id === submissionId) {
            const alreadyLiked = sub.likes.includes(user._id);
            const newLikes = alreadyLiked 
              ? sub.likes.filter(id => id !== user._id)
              : [...sub.likes, user._id];
            return { ...sub, likes: newLikes };
          }
          return sub;
        });
        setCurrentChallenge({ ...currentChallenge, submissions: updatedSubmissions });
      }
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      onRequireAuth("submit an entry");
      return;
    }

    if (!devlogLink || !description) {
      showToast("Please provide both a link and description.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/challenges/${challenge._id}/submit`, {
        devlogLink,
        description
      });
      
      if (res.success || res.status === 201 || res.status === 200) {
        showToast("Entry submitted successfully! Good luck!", "success");
        setHasSubmitted(true);
        setShowSubmitForm(false);
      } else {
        showToast(res.message || "Failed to submit entry", "error");
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        
        {/* Simple Header */}
        <div className="relative h-40 flex-shrink-0 bg-slate-900 dark:bg-black overflow-hidden border-b border-slate-100 dark:border-white/5">
          {currentChallenge.coverImage ? (
            <img 
              src={currentChallenge.coverImage} 
              alt={currentChallenge.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-brand-blue text-white text-[10px] font-bold uppercase tracking-widest rounded">
                  {currentChallenge.type}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${
                  isActive ? 'bg-white text-green-600 border-green-100' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isActive ? 'Active' : currentChallenge.status}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {currentChallenge.title}
              </h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 relative flex-1 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-12">
          
          {/* Main Content (Left) */}
          <div className="flex-1 space-y-10">
            <section>
              <p className="text-brand-slate dark:text-slate-400 leading-relaxed text-base">
                {currentChallenge.description}
              </p>
            </section>

            {currentChallenge.rules && currentChallenge.rules.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-l-2 border-brand-blue pl-3">
                  Guidelines
                </h3>
                <div className="bg-brand-cloud dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg p-5">
                  <ul className="space-y-3">
                    {currentChallenge.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-brand-slate dark:text-slate-400">
                        <span className="text-brand-blue font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Winners Section */}
            {currentChallenge.status === 'completed' && currentChallenge.winners && currentChallenge.winners.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-l-2 border-yellow-500 pl-3">
                  Hall of Fame
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {currentChallenge.winners.sort((a, b) => a.rank - b.rank).map((winner, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-center">
                      <div className="text-2xl mb-1">
                        {winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{winner.user?.name || "Anonymous"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                        {winner.rank === 1 ? "Winner" : winner.rank === 2 ? "2nd Place" : "3rd Place"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {showSubmitForm && isActive && !hasSubmitted && (
              <section className="bg-white dark:bg-[#0a0a0a] border border-indigo-100 dark:border-brand-blue/20 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Submission Form</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Devlog URL</label>
                    <input 
                      type="url" 
                      required
                      value={devlogLink}
                      onChange={(e) => setDevlogLink(e.target.value)}
                      placeholder="Enter live devlog or repository link" 
                      className="w-full px-4 py-3 bg-brand-cloud dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-blue transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approach & Tech</label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your process..." 
                      className="w-full px-4 py-3 bg-brand-cloud dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-brand-blue transition-colors text-sm min-h-[120px] resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button 
                      type="button" 
                      onClick={() => setShowSubmitForm(false)}
                      className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-8 py-2.5 bg-brand-blue hover:bg-brand-blue text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <AppleSpinner size={20} />
                      ) : (
                        "Submit Entry"
                      )}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Submissions Gallery */}
            <section className="space-y-6 pt-10 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest border-l-2 border-brand-blue pl-3">
                  Submissions
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {currentChallenge.submissions?.length || 0} participants
                </span>
              </div>
              
              {currentChallenge.submissions && currentChallenge.submissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentChallenge.submissions.map((submission, idx) => (
                    <div key={idx} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg p-5 flex flex-col group transition-all hover:bg-brand-cloud dark:hover:bg-white/10 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-50 dark:border-white/5">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-white/10 overflow-hidden">
                          {submission.user?.profilePicture ? (
                            <img src={getOptimizedUrl(submission.user.profilePicture)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                               <Trophy size={14} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{submission.user?.name || "Craftsman"}</p>
                          <p className="text-[10px] text-slate-400">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                        {submission.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <a 
                          href={submission.devlogLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-brand-blue dark:text-indigo-400 hover:underline"
                        >
                          Devlog Link <ExternalLink size={10} />
                        </a>
                        
                        <button 
                          onClick={() => handleLike(submission._id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                            submission.likes?.includes(user?._id)
                              ? "bg-red-50 text-red-500 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                              : "bg-white text-slate-500 border-slate-200 dark:bg-white/5 dark:border-white/10 hover:bg-brand-cloud"
                          }`}
                        >
                          <Star size={10} fill={submission.likes?.includes(user?._id) ? "currentColor" : "none"} />
                          {submission.likes?.length || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-brand-cloud dark:bg-white/5 rounded-lg border border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-xs text-slate-400 font-medium">Waiting for the first entry...</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar (Right) */}
          <div className="w-full lg:w-72 space-y-6 flex-shrink-0">
            {/* CTA Button */}
            {!showSubmitForm && (
              <button 
                onClick={() => isGuest ? onRequireAuth("submit entry") : setShowSubmitForm(true)}
                disabled={!isActive || hasSubmitted}
                className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                  hasSubmitted 
                    ? "bg-green-50 text-green-600 border-green-100 dark:bg-brand-teal/10 dark:text-green-400 cursor-not-allowed" 
                    : !isActive
                    ? "bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border-slate-200 dark:border-white/10"
                    : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-slate-100 shadow-lg active:opacity-60"
                }`}
              >
                {hasSubmitted ? "Entry Submitted" : !isActive ? "Closed" : "Submit Entry"}
                {!hasSubmitted && isActive && <ArrowRight size={16} />}
                {hasSubmitted && <CheckCircle size={16} />}
              </button>
            )}

            {/* Prize Block */}
            <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Challenge Reward</h4>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">{currentChallenge.prize}</p>
              
              {currentChallenge.prizeDetails && Object.keys(currentChallenge.prizeDetails).length > 0 && (
                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-white/5">
                  {currentChallenge.prizeDetails.first && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">1st Place</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentChallenge.prizeDetails.first}</span>
                    </div>
                  )}
                  {currentChallenge.prizeDetails.second && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">2nd Place</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentChallenge.prizeDetails.second}</span>
                    </div>
                  )}
                  {currentChallenge.prizeDetails.third && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">3rd Place</span>
                      <span className="font-bold text-slate-900 dark:text-white">{currentChallenge.prizeDetails.third}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline Block */}
            <div className="p-6 bg-brand-cloud dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Timeline</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-teal mt-1.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Launched</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(currentChallenge.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${isActive ? 'bg-orange-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{isActive ? 'Deadline' : 'Ended'}</p>
                    <p className={`text-xs font-bold ${isActive ? 'text-orange-600' : 'text-slate-900 dark:text-white'}`}>
                       {isActive ? timeLeft : new Date(currentChallenge.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Participants</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{currentChallenge.submissions?.length || 0}</p>
              </div>
              <Users size={24} className="text-slate-200 dark:text-white/10" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}


