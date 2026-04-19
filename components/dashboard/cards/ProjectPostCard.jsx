import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, 
  Calendar, MapPin, ExternalLink, Github, Layers, Clock, 
  CheckCircle2, Circle, AlertCircle, FileText, Download, ChevronRight,
  Tag, Shield, Users
} from 'lucide-react';
import { api } from "@/utils/api";
import dynamic from 'next/dynamic';

const AdvancedCommentSection = dynamic(() => import('../comments/AdvancedCommentSection'), { ssr: false });
import CreatorProfileModal from '../modals/CreatorProfileModal';

import { useRouter } from 'next/navigation';

const ProjectPostCard = ({ 
  post,
  item, 
  onClick,
  isDetailPage = false,
  isBlog = false
}) => {
  const actualItem = post || item;
  const router = useRouter();
  const { 
    _id, 
    slug,
    title,
    user, 
    content, 
    images, 
    likes: initialLikes, 
    likesCount,
    commentsCount: initialCommentsCount, 
    isLiked: initialIsLiked, 
    isFavorited: initialIsFavorited,
    projectStats,
    createdAt 
  } = actualItem;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(likesCount || initialLikes || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  
  // Comment State (Legacy vars removed, relying on nav)
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialCommentsCount || 0);

  // Parse stats
  const {
      category = 'Uncategorized',
      tags = [],
      tools = [],
      difficulty = 'Intermediate',
      status = 'Ongoing',
      startDate,
      endDate,
      originalEndDate,
      extensions = [],
      milestones = [],
      resources = [],
      collaborators = [],
      location,
      license = 'None',
      projectLink,
      livePreviewUrl
  } = projectStats || {};

  // Helper for timeline
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
  
  // Format Date (reused)
  const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const handleNavigation = (e) => {
      if (isDetailPage) return;
      if (onClick) {
          onClick(e); // Allow parent override if strictly needed, but likely we want Nav.
          // If parent just selects it, we might still want to nav. 
          // The user said: "প্রতি বার যখন কোনো পোস্টে ক্লিক করা হবে, তখন মডাল নয়, ওই ডাইনামিক পেজেই ঐ পোস্ট ওপেন হবে।"
          // So I should FORCE navigation.
      }
      if (isBlog) {
          router.push(`/blog/${slug}`);
      } else {
          router.push(`/post/${_id}`);
      }
  };

  const toggleComments = (e) => {
      e.stopPropagation();
      handleNavigation();
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => !isLiked ? prev + 1 : prev - 1);
    try {
       await api.put(`/posts/${_id}/like`);
    } catch (err) {
       console.error("Like failed", err);
       setIsLiked(isLiked); // Revert
       setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  return (
    <div 
        className="group relative bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer p-4 flex gap-6"
        onClick={handleNavigation}
    >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}>
             <div className="relative group/avatar cursor-pointer hover:opacity-80 transition-opacity">
                 {/* Removed hover glow effect */}
                 <div className="relative w-12 h-12 rounded-full p-[2px] bg-white dark:bg-black border border-gray-200 dark:border-white/10">
                     {user?.avatar ? (
                         <Image 
                            src={user.avatar} 
                            width={48} 
                            height={48} 
                            className="rounded-full w-full h-full object-cover"
                            alt={user.name || 'User'}
                         />
                     ) : (
                         <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-500 font-bold text-lg">
                             {user?.name?.[0] || "U"}
                         </div>
                     )}
                 </div>
                 {/* Online/Status Badge */}
                 <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
             </div>
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-1">
                 <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                     <div className="flex items-center gap-2">
                        <h3 
                            className="font-bold text-gray-900 dark:text-gray-100 text-base hover:underline decoration-2 decoration-purple-500 underline-offset-4 transition-colors cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}
                        >
                            {user?.name}
                        </h3>
                        {/* TYPE BADGE: PROJECT */}
                        <span className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <Layers size={10} className="stroke-[3]" /> Project
                        </span>
                     </div>
                     <div className="flex items-center gap-1 text-sm text-gray-500">
                         <span>@{user?.username}</span>
                         <span className="text-gray-300 dark:text-gray-600">•</span>
                         <span className="text-gray-400 hover:text-purple-500">{formatDate(createdAt)}</span>
                     </div>
                 </div>

                 {/* Status & Category Badge */}
                 <div className="flex flex-col items-end gap-1">
                     <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                         status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                         status === 'Planning' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                         'bg-purple-500/10 text-purple-500 border-purple-500/20'
                     }`}>
                         {status}
                     </div>
                     {category && <span className="text-[9px] uppercase font-bold text-gray-400 hidden sm:block">{category}</span>}
                 </div>
            </div>

            {/* Description */}
            {isBlog && title && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            )}
            <div 
                 className="text-gray-800 dark:text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap mb-3 font-normal"
                 dangerouslySetInnerHTML={{ __html: isBlog ? (content?.substring(0, 200) + '...') : content }}
            />
            
            {/* Project Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-3">
                {/* Left: Images */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                     {/* Media Container */}
                     {images && images.length > 0 ? (
                         <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 group/media h-[250px] sm:h-[300px] lg:h-[400px] w-full shadow-inner">
                             {images.length === 1 ? (
                                 <Image 
                                     src={images[0]} 
                                     fill 
                                     alt="Project preview" 
                                     className="object-cover"
                                 />
                             ) : (
                                 <div className="grid grid-cols-2 h-full w-full gap-0.5">
                                     {images.slice(0, 4).map((img, i) => (
                                         <div key={i} className={`relative overflow-hidden ${
                                             images.length === 3 && i === 0 ? 'row-span-2' : ''
                                         }`}>
                                             <Image 
                                                 src={img} 
                                                 fill 
                                                 alt={`Preview ${i}`} 
                                                 className="object-cover"
                                             />
                                         </div>
                                     ))}
                                 </div>
                             )}
                             <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                                 {images.length} Image{images.length > 1 ? 's' : ''}
                             </div>
                         </div>
                     ) : (
                         <div className="hidden lg:flex flex-col items-center justify-center text-gray-400 h-[300px] bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                             <Layers size={48} className="opacity-20 mb-2" />
                             <span className="text-xs font-medium">No preview available</span>
                         </div>
                     )}
                </div>

                {/* Right: Stats Panel */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-white/10 h-full flex flex-col shadow-sm">
                        <div className="space-y-4">
                            {/* Header: Links & Download */}
                            <div className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-white/10">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <FileText size={14}/> Details
                                </span>
                                <div className="flex gap-2">
                                     {projectLink && (
                                         <a href={projectLink} target="_blank" className="p-1.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors shadow-sm" title="View Source">
                                             <Github size={14} />
                                         </a>
                                     )}
                                     {livePreviewUrl && (
                                         <a href={livePreviewUrl} target="_blank" className="p-1.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors shadow-sm" title="Live Demo">
                                             <ExternalLink size={14} />
                                         </a>
                                     )}
                                     {resources.length > 0 && (
                                          <a href={resources[0].url || resources[0]} target="_blank" className="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-sm shadow-purple-500/25" title="Download Resource">
                                              <Download size={14} />
                                          </a>
                                     )}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Shield size={11}/> License</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{license}</div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Users size={11}/> Team</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{collaborators.length > 0 ? `${collaborators.length} Members` : 'Solo Creator'}</div>
                                 </div>
                            </div>

                            {/* Timeline */}
                            <div>
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={11} /> Timeline</span>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative"></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[9px] text-gray-400 font-medium">
                                    <span>{formatDate(startDate)}</span>
                                    <span>{formatDate(endDate)}</span>
                                </div>
                            </div>

                            {/* Tech Stack */}
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Layers size={11} /> Stack</div>
                                <div className="flex flex-wrap gap-1">
                                    {tools.slice(0, 5).map(tool => (
                                        <span key={tool} className="text-xs font-bold px-2 py-0.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded text-gray-600 dark:text-gray-300">
                                            {tool}
                                        </span>
                                    ))}
                                    {tools.length > 5 && (
                                        <span className="text-xs font-bold px-1.5 py-0.5 text-gray-400">+{tools.length - 5}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Milestone / Footer */}
                        {milestones.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/5">
                                 <div className="flex items-center gap-2">
                                     <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded md">
                                         <CheckCircle2 size={14} />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="text-[9px] uppercase font-bold text-gray-400">Next Milestone</div>
                                         <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{milestones[0].title}</div>
                                     </div>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between max-w-md">
                 <div className="flex items-center gap-6">
                     <button 
                         onClick={handleLike}
                         className={`flex items-center gap-2 text-sm group transition-all ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                     >
                         <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                         </div>
                         <span className="text-xs font-bold tabular-nums">{likeCount}</span>
                     </button>
                     
                     <button 
                         onClick={toggleComments}
                         className="flex items-center gap-2 text-sm group transition-all text-gray-500 hover:text-blue-500"
                     >
                         <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <MessageCircle size={18} />
                         </div>
                         <span className="text-xs font-bold tabular-nums">{currentCommentsCount}</span>
                     </button>

                     <button 
                         className="flex items-center gap-2 text-sm group transition-all text-gray-500 hover:text-green-500"
                         onClick={(e) => e.stopPropagation()}
                     >
                         <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <Share2 size={18} />
                         </div>
                     </button>
                 </div>
                 
                 <div>
                     <button 
                         onClick={(e) => { e.stopPropagation(); setIsFavorited(!isFavorited); }}
                         className={`p-1.5 rounded-full group transition-all ${isFavorited ? 'text-purple-500' : 'text-gray-400 hover:text-purple-500 hover:bg-purple-500/10'}`}
                     >
                         <Bookmark size={18} className={isFavorited ? 'fill-current' : ''} />
                     </button>
                 </div>
            </div>
        </div>

        {/* Creator Profile Modal */}
        <CreatorProfileModal 
            isOpen={isCreatorModalOpen}
            onClose={() => setIsCreatorModalOpen(false)}
            userId={user?._id}
        />
    </div>
  );
};

export default ProjectPostCard;
