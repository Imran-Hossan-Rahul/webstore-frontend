"use client";
import AppleSpinner from "@/components/ui/AppleSpinner";

import React, { useEffect, useState } from 'react';
import { User, ArrowRight, Star, Eye, ShieldCheck, Layers, Github, ExternalLink, Download, Share2, CheckCircle2, Clock, Circle, Flag } from "lucide-react";
import Image from 'next/image';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import CraftsmanProfileModal from '../modals/CraftsmanProfileModal';
import { useToast } from "@/components/ui/ToastProvider";

const DevlogRightSidebar = ({ currentPostId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [post, setPost] = useState(null);
  const [moreFromAuthor, setMoreFromAuthor] = useState([]);
  const [similarDevlogs, setSimilarDevlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCraftsmanModalOpen, setIsCraftsmanModalOpen] = useState(false);
  
  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (!currentPostId) return;

    const fetchPostAndSidebarData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Post Data
        const postRes = await api.get(`/posts/${currentPostId}`);
        if (!postRes.success) throw new Error("Post not found");
        
        const postData = postRes.data;
        setPost(postData);
        setIsLiked(postData.isLiked || false);
        setLikesCount(postData.likesCount || (postData.likes ? postData.likes.length : 0));
        
        const author = postData.user;
        const category = postData.devlogStats?.category;

        // 2. Fetch more from author
        if (author && author._id) {
          try {
             const authorRes = await api.get(`/codex?author=${author._id}&limit=5`);
             if (authorRes && authorRes.codex) {
                 const filtered = authorRes.codex.filter(b => b._id !== currentPostId).slice(0, 3);
                 setMoreFromAuthor(filtered);
             }
          } catch(e) { console.error(e); }
        }

        // 3. Fetch similar
        try {
           const similarRes = await api.get(`/codex?limit=5`); 
           if (similarRes && similarRes.codex) {
               const filtered = similarRes.codex.filter(b => b._id !== currentPostId && b.author?._id !== author?._id).slice(0, 3);
               setSimilarDevlogs(filtered);
           }
        } catch(e) { console.error(e); }

      } catch (err) {
         console.error("Sidebar fetch error", err);
      } finally {
         setLoading(false);
      }
    };

    fetchPostAndSidebarData();
  }, [currentPostId]);

  const handleLike = async (e) => {
      if (e) e.stopPropagation();
      const prevLiked = isLiked;
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      try {
          const res = await api.put(`/posts/${currentPostId}/like`);
          if (!res.success) throw new Error();
      } catch (err) {
          setIsLiked(prevLiked);
          setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
          showToast("Failed to update like", "error");
      }
  };

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: post?.title,
              url: window.location.href,
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(window.location.href);
          showToast("Link copied to clipboard", "success");
      }
  };

  if (loading || !post) {
      return (
          <div className="flex justify-center p-12"><AppleSpinner /></div>
      );
  }

  const author = post.user;
  const viewsCount = post.viewsCount || 0;
  const authorImage = author?.profilePicture || author?.avatar;
  const authorUsername = author?.username || (author?.email ? author.email.split('@')[0] : 'user');
  const { 
    tools = [], 
    tags: devlogTags = [], 
    license = 'MIT', 
    devlogLink, 
    livePreviewUrl, 
    documentationUrl, 
    resources = [],
    milestones = [],
    startDate,
    endDate,
    phase = 'Planning',
    status = 'Planning',
    difficulty = 'Intermediate'
  } = post.devlogStats || {};

  // Tags can live in multiple places and may be strings or objects {name: ...}
  const normTag = (t) => (typeof t === 'string' ? t : t?.name || t?.label || '');
  const tags = [
    ...(Array.isArray(post.tags) ? post.tags.map(normTag) : []),
    ...(Array.isArray(devlogTags) ? devlogTags.map(normTag) : []),
  ].filter((t, i, arr) => t && arr.indexOf(t) === i); // dedupe non-empty



  // Phase color mapping removed as we are using direct conditional styles or gradients

  const getTimelineProgress = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const progress = getTimelineProgress();

  return (
    <div className="space-y-6 pb-20">
      
      {/* Project Timeline (Feed Style) */}
      <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Timeline</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                      phase === 'Completed' ? 'bg-green-500' :
                      phase === 'Live' ? 'bg-blue-500' :
                      phase === 'Maintenance' ? 'bg-orange-500' :
                      'bg-indigo-500'
                  }`} />
                  <span className="text-[9px] font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {phase}
                  </span>
              </div>
          </div>
          
          <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  <span>{startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Start'}</span>
                  <span>{Math.round(progress)}% Completed</span>
                  <span>{endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'End'}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                      style={{ width: `${progress}%` }} 
                      className={`h-full relative transition-all duration-1000 ease-out ${
                          phase === 'Completed' ? 'bg-green-500' :
                          phase === 'Live' ? 'bg-blue-500' :
                          phase === 'Maintenance' ? 'bg-orange-500' :
                          'bg-gradient-to-r from-indigo-500 to-purple-600'
                      }`}
                  />
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic text-center pt-1">
                  Status: {status}
              </p>
          </div>
      </div>
      
      {/* Interactive Stats & Links */}
      <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
          
          <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                      {post?.devlogStats?.startDate ? new Date(post.devlogStats.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{post?.devlogStats?.category || 'Uncategorized'}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{viewsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stars</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{likesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                      difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      difficulty === 'Advanced' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                      difficulty === 'Expert' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                  }`}>
                      {difficulty}
                  </span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">License</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{license}</span>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
              {devlogLink && (
                  <a href={devlogLink} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
                      <Github size={16} /> Repository
                  </a>
              )}
              {livePreviewUrl && (
                  <a href={livePreviewUrl} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-white dark:bg-black text-slate-900 dark:text-white border-2 border-slate-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/30 transition-colors flex items-center justify-center gap-3">
                      <ExternalLink size={16} /> Live Preview
                  </a>
              )}
              {resources && resources.length > 0 && (
                  <a href={resources[0].link || resources[0].url} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-white dark:bg-black text-slate-900 dark:text-white border-2 border-slate-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/30 transition-colors flex items-center justify-center gap-3">
                      <Download size={16} /> Download
                  </a>
              )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleLike} className={`py-3.5 rounded-lg border-2 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors ${isLiked ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : 'bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <Star size={14} className={isLiked ? 'fill-current text-red-500' : ''} />
                  {isLiked ? 'Starred' : 'Star'}
              </button>
              <button onClick={handleShare} className="py-3.5 rounded-xl border-2 bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <Share2 size={14} /> Share
              </button>
          </div>
      </div>

      {/* Technology Stack & Tags */}
      <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
          <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                  {tools.length > 0 ? tools.map(tool => (
                      <span key={tool} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                          {tool}
                      </span>
                  )) : <span className="text-xs text-slate-400 font-medium italic">No technologies listed</span>}
              </div>
          </div>

          {tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Devlog Tags</h3>
                  <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 cursor-pointer transition-colors">
                              #{tag}
                          </span>
                      ))}
                  </div>
              </div>
          )}

      </div>

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
          <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Flag size={12} className="text-indigo-500" />
                      Milestones
                  </h3>
                  <span className="text-[9px] font-black text-slate-400">
                      {milestones.filter(m => m.status === 'Completed').length}/{milestones.length}
                  </span>
              </div>
              <div className="space-y-2">
                  {milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                          <div className="mt-0.5 shrink-0">
                              {milestone.status === 'Completed' ? (
                                  <CheckCircle2 size={13} className="text-emerald-500" />
                              ) : milestone.status === 'In Progress' ? (
                                  <Clock size={13} className="text-blue-500 animate-pulse" />
                              ) : (
                                  <Circle size={13} className="text-slate-300 dark:text-slate-700" />
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{milestone.title}</p>
                              {milestone.description && (
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">{milestone.description}</p>
                              )}
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">
                              {milestone.date ? new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                          </span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 1. Author Profile Snippet */}
      {author && (
        <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Craftsman</h3>
            <div className="flex items-center gap-4 mb-5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsCraftsmanModalOpen(true)}>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                     {authorImage ? (
                         <Image src={authorImage} width={48} height={48} className="object-cover w-full h-full" alt={author.name || 'Author'} />
                     ) : (
                         <User size={20} className="text-slate-400" />
                     )}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{author.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">@{authorUsername}</p>
                </div>
            </div>
            <button 
                onClick={() => setIsCraftsmanModalOpen(true)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
            >
                View Profile
            </button>
        </div>
      )}

      {/* 2. More from Author */}
      {moreFromAuthor.length > 0 && (
          <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More by Craftsman</h3>
                  <ArrowRight size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
              </div>
              <div className="space-y-4">
                  {moreFromAuthor.map(p => (
                      <div key={p._id || p.slug} onClick={() => router.push(`/post/${p._id}`)} className="group flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all">
                                  <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                                  {p.title}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Profile Modal */}
      <CraftsmanProfileModal 
          isOpen={isCraftsmanModalOpen} 
          onClose={() => setIsCraftsmanModalOpen(false)} 
          userId={author?._id} 
      />
    </div>
  );
};

export default DevlogRightSidebar;



