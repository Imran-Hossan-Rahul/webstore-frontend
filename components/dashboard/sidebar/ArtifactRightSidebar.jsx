"use client";
import React, { useEffect, useState } from 'react';
import { User, ArrowRight, Heart, Eye, Download, Share2, Layers, Tag, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import CraftsmanProfileModal from '../modals/CraftsmanProfileModal';
import { useToast } from "@/components/ui/ToastProvider";

const ArtifactRightSidebar = ({ currentArtifactId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [artifact, setArtifact] = useState(null);
  const [moreFromAuthor, setMoreFromAuthor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCraftsmanModalOpen, setIsCraftsmanModalOpen] = useState(false);
  
  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);

  useEffect(() => {
    if (!currentArtifactId) return;

    const fetchArtifactAndSidebarData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Artifact Data
        const artifactRes = await api.get(`/artifact/${currentArtifactId}`);
        const artifactData = artifactRes.data || artifactRes;
        
        setArtifact(artifactData);
        setIsLiked(artifactData.isLiked || false);
        setLikesCount(artifactData.likes?.length || artifactData.likesCount || 0);
        setDownloadsCount(artifactData.downloadsCount || 0);
        
        const author = artifactData.user || artifactData.craftsman;

        // 2. Fetch more from author
        if (author && author._id) {
          try {
             // Reusing the general artifacts endpoint to fetch author artifacts if possible
             const authorRes = await api.get(`/artifact`);
             if (authorRes && authorRes.artifacts) {
                 const filtered = authorRes.artifacts.filter(t => t._id !== currentArtifactId && (t.user?._id === author._id || t.craftsman?._id === author._id)).slice(0, 3);
                 setMoreFromAuthor(filtered);
             }
          } catch(e) { console.error(e); }
        }

      } catch (err) {
         console.error("Sidebar fetch error", err);
      } finally {
         setLoading(false);
      }
    };

    fetchArtifactAndSidebarData();
  }, [currentArtifactId]);

  const handleLike = async (e) => {
      if (e) e.stopPropagation();
      const prevLiked = isLiked;
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      try {
          const res = await api.post(`/artifact/${currentArtifactId}/like`);
          // Assuming the backend has a like endpoint. If not, this will just fail gracefully
      } catch (err) {
          setIsLiked(prevLiked);
          setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
          showToast("Failed to update like", "error");
      }
  };

  const handleShare = () => {
      if (navigator.share) {
          navigator.share({
              title: artifact?.title,
              url: window.location.href,
          }).catch(console.error);
      } else {
          navigator.clipboard.writeText(window.location.href);
          showToast("Link copied to clipboard", "success");
      }
  };

  const handleDownload = async (e) => {
      e.stopPropagation();
      try {
          const response = await api.post(`/artifact/${currentArtifactId}/download`);
          if (response.success && response.url) {
              const link = document.createElement('a');
              link.href = response.url;
              link.download = `${artifact.title || 'artifact'}.zip`;
              link.target = '_blank';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setDownloadsCount(prev => prev + 1);
          } else if (response.requiresPurchase) {
              showToast('Please purchase this artifact first', "error");
          } else if (response.requiresAuth) {
              showToast('Please login to download', "error");
          }
      } catch (error) {
          console.error("Download error:", error);
          showToast(error.message || "Download failed. Please try again.", "error");
      }
  };

  if (loading || !artifact) {
      return (
          <div className="space-y-6 animate-pulse">
              <div className="h-40 bg-white dark:bg-white/5 rounded-lg"></div>
              <div className="h-60 bg-white dark:bg-white/5 rounded-lg"></div>
          </div>
      );
  }

  const author = artifact.user || artifact.craftsman || {};
  const viewsCount = artifact.viewsCount || 0;
  const authorImage = author?.profilePicture || author?.avatar || author?.profilePic;
  const authorUsername = author?.username || (author?.email ? author.email.split('@')[0] : 'user');
  
  const tech = artifact.tech || [];
  const category = artifact.category || 'Uncategorized';
  const price = artifact.price > 0 ? `$${artifact.price}` : 'Free';

  return (
    <div className="space-y-6 pb-20">
      
      {/* Interactive Stats & Links */}
      <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
          
          <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                      {new Date(artifact.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{category}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</span>
                  <span className="text-sm font-black text-emerald-500">{price}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{viewsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Likes</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{likesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Downloads</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{downloadsCount}</span>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
              {artifact.githubLink && (
                  <a href={artifact.githubLink} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
                      <Github size={16} /> Repository
                  </a>
              )}
              {artifact.liveLink && (
                  <a href={artifact.liveLink} target="_blank" rel="noreferrer" className="w-full py-3.5 bg-white dark:bg-black text-slate-900 dark:text-white border-2 border-slate-100 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-300 dark:hover:border-white/30 transition-colors flex items-center justify-center gap-3">
                      <ExternalLink size={16} /> Live Preview
                  </a>
              )}
              <button onClick={handleDownload} className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
                  <Download size={16} /> Download Artifact
              </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={handleLike} className={`py-3.5 rounded-lg border-2 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors ${isLiked ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-500' : 'bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                  <Heart size={14} className={isLiked ? 'fill-current text-red-500' : ''} />
                  {isLiked ? 'Liked' : 'Like'}
              </button>
              <button onClick={handleShare} className="py-3.5 rounded-xl border-2 bg-white dark:bg-black border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <Share2 size={14} /> Share
              </button>
          </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white dark:bg-black rounded-lg p-6 border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
          <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                  {tech.length > 0 ? tech.map((t, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                          {t}
                      </span>
                  )) : <span className="text-xs text-slate-400 font-medium italic">No technologies listed</span>}
              </div>
          </div>
      </div>

      {/* 1. Author Profile Snippet */}
      {author && author.name && (
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
                  {moreFromAuthor.map(t => (
                      <div key={t._id} onClick={() => router.push(`/artifacts/${t._id}`)} className="group flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all">
                                  <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                                  {t.title}
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

export default ArtifactRightSidebar;


