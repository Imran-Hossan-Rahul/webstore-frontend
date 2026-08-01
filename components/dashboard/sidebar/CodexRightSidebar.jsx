"use client";
import AppleSpinner from "@/components/ui/AppleSpinner";

import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useEffect, useState } from 'react';
import { User, ArrowRight, Eye, Share2, Clock, Calendar, Tag, Bookmark, Star } from "lucide-react";
import Image from 'next/image';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import CraftsmanProfileModal from '../modals/CraftsmanProfileModal';
import CraftsmanHoverCard from '../cards/CraftsmanHoverCard';
import { useToast } from "@/components/ui/ToastProvider";

const CodexRightSidebar = ({ currentCodexSlug }) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [codex, setCodex] = useState(null);
  const [moreFromAuthor, setMoreFromAuthor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCraftsmanModalOpen, setIsCraftsmanModalOpen] = useState(false);
  const [publicNotes, setPublicNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  
  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await api.get('/user/profile');
            if (res.success) setCurrentUser(res.data);
        } catch (err) {}
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentCodexSlug) return;

    const fetchCodexAndSidebarData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Codex Data
        const codexRes = await api.get(`/codex/${currentCodexSlug}`);
        const codexData = codexRes.data || codexRes;
        
        setCodex(codexData);
        
        const userId = currentUser?._id?.toString() || currentUser?._id;
        const initialIsLiked = codexData.isLiked === true || (userId && codexData.likedBy?.includes(userId)) || false;
        const initialLikesCount = codexData.likesCount !== undefined ? codexData.likesCount : (typeof codexData.likes === 'number' ? codexData.likes : (Array.isArray(codexData.likes) ? codexData.likes.length : 0));
        
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
        
        const author = codexData.author || codexData.user;

        // 2. Fetch more from author
        if (author && author._id) {
          try {
             const authorRes = await api.get(`/codex?author=${author._id}&limit=5`);
             if (authorRes && authorRes.codex) {
                 const filtered = authorRes.codex.filter(b => b.slug !== currentCodexSlug && b._id !== currentCodexSlug).slice(0, 3);
                 setMoreFromAuthor(filtered);
             }
          } catch(e) { console.error(e); }
        }

        // 3. Fetch Public Community Notes
        if (codexData._id) {
           try {
               setNotesLoading(true);
               const notesRes = await api.get(`/notes/codex/${codexData._id}/public`);
               if (notesRes.success) setPublicNotes(notesRes.data);
           } catch(e) {
               console.error("Failed to fetch community notes", e);
           } finally {
               setNotesLoading(false);
           }
        }

      } catch (err) {
         console.error("Sidebar fetch error", err);
      } finally {
         setLoading(false);
      }
    };

    fetchCodexAndSidebarData();
  }, [currentCodexSlug, currentUser]);

  const handleLike = async (e) => {
      if (e) e.stopPropagation();
      const prevLiked = isLiked;
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      
      try {
          const res = await api.post(`/codex/${currentCodexSlug}/like`);
          if (res.success) {
              setIsLiked(res.isLiked);
              setLikesCount(res.likesCount);
          }
      } catch (err) {
          setIsLiked(prevLiked);
          setLikesCount(prev => prevLiked ? prev + 1 : Math.max(0, prev - 1));
          showToast("Failed to update like", "error");
      }
  };

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: codex?.title,
              text: 'Check out this amazing codex!',
              url: window.location.href,
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(window.location.href);
          showToast("Link copied to clipboard", "success");
      }
  };

  if (loading || !codex) {
      return (
          <div className="flex justify-center p-12"><AppleSpinner /></div>
      );
  }

  const author = codex.author || codex.user || {};
  const viewsCount = codex.viewsCount || codex.views || 0;
  const authorImage = author?.profilePicture || author?.avatar || author?.profilePic;
  const authorUsername = author?.username || (author?.email ? author.email.split('@')[0] : 'user');
  
  const tags = codex.tags || [];
  const category = codex.category || 'Codex';
  const readTime = codex.readTime || '5 min read';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Interactive Stats & Links */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
          
          <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Published</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(codex.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Category</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-tight">{category}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Read Time</span>
                  <span className="text-sm font-semibold text-emerald-500">{readTime}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Views</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{viewsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Stars</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{likesCount}</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleLike} className={`py-3.5 rounded-xl border-2 font-semibold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors ${isLiked ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : 'bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <Star size={14} className={isLiked ? 'fill-current text-red-500' : ''} />
                  {isLiked ? 'Starred' : 'Star'}
              </button>
              <button onClick={handleShare} className="py-3.5 rounded-xl border-2 bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <Share2 size={14} /> Share
              </button>
          </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
          <div className="bg-white dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
              <div>
                  <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                      {tags.map((t, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                              #{t}
                          </span>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Community Notes */}
      <div className="bg-white dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bookmark className="text-amber-500" size={14} /> Community Notes
          </h3>
          
          {notesLoading ? (
              <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                      <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-xl"></div>
                  ))}
              </div>
          ) : publicNotes.length > 0 ? (
              <div className="space-y-4">
                  {publicNotes.map(note => (
                      <div 
                          key={note._id}
                          onClick={() => window.dispatchEvent(new CustomEvent('scroll-to-highlight', { detail: note }))}
                          className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl hover:border-amber-400 transition-colors cursor-pointer group"
                      >
                          <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-200">
                                  {note.user?.profilePicture ? (
                                      <img src={getOptimizedUrl(note.user.profilePicture)} alt={note.user.name} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-bold">
                                          {note.user?.name?.[0]}
                                      </div>
                                  )}
                              </div>
                              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{note.user?.name}</span>
                          </div>
                          <p className="text-xs font-medium italic text-slate-700 dark:text-slate-300 line-clamp-3 mb-2 border-l-2 border-amber-400 pl-2">
                              &quot;{note.highlightedText}&quot;
                          </p>
                          {note.noteContent && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {note.noteContent}
                              </p>
                          )}
                      </div>
                  ))}
              </div>
          ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">No Notes Yet</p>
                  <p className="text-[10px] text-slate-500">Be the first to highlight and share a public note for this codex.</p>
              </div>
          )}
      </div>

      {/* 1. Author Profile Snippet */}
      {author && author.name && (
        <div className="bg-white dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Author</h3>
            <CraftsmanHoverCard
                userId={author?._id}
                username={authorUsername}
                avatarUrl={authorImage}
                displayName={author.name}
            >
                <div 
                    className="flex items-center gap-4 mb-5 cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => router.push(`/u/${authorUsername}`)}
                >
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-white/10">
                        {authorImage ? (
                            <Image src={authorImage} width={48} height={48} className="object-cover w-full h-full" alt={author.name || 'Author'} />
                        ) : (
                            <User size={20} className="text-slate-400" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm hover:text-indigo-600 transition-colors">{author.name}</h4>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mt-1">@{authorUsername}</p>
                    </div>
                </div>
            </CraftsmanHoverCard>
            <button 
                onClick={() => router.push(`/u/${authorUsername}`)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-all"
            >
                View Profile
            </button>
        </div>
      )}

      {/* 2. More from Author */}
      {moreFromAuthor.length > 0 && (
          <div className="bg-white dark:bg-black rounded-2xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">More by Author</h3>
                  <ArrowRight size={14} className="text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
              </div>
              <div className="space-y-4">
                  {moreFromAuthor.map(b => (
                      <div key={b._id} onClick={() => router.push(`/codex/${b.slug || b._id}`)} className="group flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all">
                                  <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-xs font-medium text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                                  {b.title}
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

export default CodexRightSidebar;



