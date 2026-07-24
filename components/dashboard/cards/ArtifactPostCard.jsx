import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Share2, MoreHorizontal, Bookmark, Download, ExternalLink, Eye, Tag, Globe, Github, FileText, Shield, Layers, Clock, Code, Zap, CheckCircle, AlertCircle, HelpCircle, Lightbulb, Flame, PanelRight, X, Star } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/ToastProvider";
import CraftsmanHoverCard from './CraftsmanHoverCard';
import { useEffect } from 'react';
import { useShare } from "@/hooks/useShare";
import NProgress from 'nprogress';

// Dynamic Tech Badge Colors
const getTechColor = (tool) => {
    if (!tool) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10';
    const t = tool.toLowerCase();
    if (t.includes('react') || t.includes('flutter')) return 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20';
    if (t.includes('node') || t.includes('mongo') || t.includes('vue')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (t.includes('next') || t.includes('vercel')) return 'bg-slate-800 text-gray-200 border-slate-600 dark:bg-white/10 dark:text-gray-200 dark:border-white/20';
    if (t.includes('tailwind') || t.includes('css')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    if (t.includes('js') || t.includes('javascript') || t.includes('html')) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    if (t.includes('python') || t.includes('figma')) return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10';
};

const ArtifactPostCard = ({ 
  item, 
  onClick,
  isDetailPage = false,
  isGuest = false,
  onRequireAuth
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { 
    _id, 
    user, 
    title,
    description,
    previewFile,
    thumbnail,
    likes: initialLikes, 
    likeCount: initialLikeCount,
    isLiked: initialIsLiked, 
    viewsCount,
    downloadsCount,
    price,
    priceType,
    tags = [],
    category,
    liveLink,
    githubLink,
    codepenUrl,
    fileType,
    fileSize,
    versions = [],
    tech = [],
    commentsCount: initialCommentsCount = 0,
    createdAt,
    updatedAt
  } = item;

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFavorited, setIsFavorited] = useState(item.isFavorited || false);
  const [likesCount, setLikesCount] = useState(initialLikes || initialLikeCount || 0);
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialCommentsCount);
  const [showIframeModal, setShowIframeModal] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { share } = useShare();
  
  const isFree = priceType === 'free' || !price || price === 0;
  const imageSrc = previewFile || thumbnail;

  const handleNavigation = (e) => {
      if (isDetailPage) return;
      NProgress.start();
      router.push(`/artifacts/${_id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const response = await api.post(`/artifact/${_id}/like`);
      if (response.queued === undefined && !response.success) {
        // Revert on failure
        setIsLiked(!newIsLiked);
        setLikesCount(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (err) {
       console.error("Like failed", err);
       setIsLiked(!newIsLiked);
       setLikesCount(prev => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('download'); return; }
    try {
      const response = await api.post(`/artifact/${_id}/download`);
      if (response.success && response.url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.url;
        link.download = `${title || 'artifact'}.zip`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (response.requiresPurchase) {
        showToast('Please purchase this artifact first', "error");
      }
    } catch (error) {
      console.error("Download error:", error);
      showToast(error.message || "Download failed. Please try again.", "error");
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('save'); return; }
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);
    try {
        await api.post('/favorites/toggle', { postId: _id, itemType: 'Artifact' });
        showToast(newIsFavorited ? "Added to favorites" : "Removed from favorites", "success");
    } catch (err) {
        console.error("Favorite failed", err);
        setIsFavorited(!newIsFavorited);
        showToast("Failed to update favorites", "error");
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    await share({
        title: title || "Artifact",
        text: description ? description.substring(0, 100) : "",
        url: `/artifacts/${_id}`
    });
  };

  const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
      if (!bytes) return 'N/A';
      const mb = bytes / (1024 * 1024);
      return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  // ----------------------------------------------------------------------
  // Dynamic Avatar Fetching (Mirroring CraftsmanProfileModal logic)
  // ----------------------------------------------------------------------
  const [craftsmanAvatar, setCraftsmanAvatar] = useState(null);
  
  useEffect(() => {
    const authorId = user?._id || user || item?.craftsman?._id || item?.craftsman || item?.owner?._id || item?.owner || item?.user?._id || item?.user;
    const initialAvatar = user?.profilePicture || user?.avatar || user?.profilePic || 
                          item?.craftsman?.profilePicture || item?.craftsman?.avatar ||
                          item?.owner?.profilePicture || item?.owner?.avatar ||
                          item?.user?.profilePicture || item?.user?.avatar;
    
    if (authorId && !initialAvatar && typeof authorId === 'string') {
      if (window.__avatarCache && window.__avatarCache[authorId]) {
        setCraftsmanAvatar(window.__avatarCache[authorId]);
        return;
      }
      
      api.get(`/craftsman/${authorId}`)
        .then(res => {
          if (res.success && res.data) {
            const fetchedAvatar = res.data.profilePicture || res.data.userId?.profilePicture;
            if (fetchedAvatar) {
              setCraftsmanAvatar(fetchedAvatar);
              window.__avatarCache = window.__avatarCache || {};
              window.__avatarCache[authorId] = fetchedAvatar;
            }
          }
        })
        .catch(() => {});
    }
  }, [user, item]);

  const userName = user?.name || item?.craftsman?.name || item?.owner?.name || item?.user?.name || 'Craftsman';
  const initialAvatarUrl = user?.profilePicture || user?.avatar || user?.profilePic || 
                           item?.craftsman?.profilePicture || item?.craftsman?.avatar ||
                           item?.owner?.profilePicture || item?.owner?.avatar ||
                           item?.user?.profilePicture || item?.user?.avatar;
  const finalAvatarUrl = craftsmanAvatar || initialAvatarUrl;

  return (
    <div 
        className="group relative sm:border-b sm:border-slate-100 dark:sm:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer p-4 flex gap-2 sm:gap-6"
        onClick={handleNavigation}
    >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
             <CraftsmanHoverCard
               userId={user?._id || item?.craftsman?._id || item?.owner?._id}
               username={user?.username || item?.craftsman?.username || item?.owner?.username}
               avatarUrl={finalAvatarUrl}
               displayName={userName}
             >
               <div className="relative group/avatar">
                   <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-slate-200 dark:border-white/10">
                       {finalAvatarUrl ? (
                           <Image 
                               src={finalAvatarUrl} 
                               width={48} 
                               height={48} 
                               className="rounded-full w-full h-full object-cover"
                               alt={userName}
                               unoptimized
                           />
                       ) : (
                           <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                               {userName[0] || "U"}
                           </div>
                       )}
                   </div>
                   <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-black rounded-full"></div>
               </div>
             </CraftsmanHoverCard>
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0">
             {/* Header */}
             <div className="flex justify-between items-start mb-1">
                 <div className="flex flex-row items-center gap-1.5 flex-wrap">
                     <div className="flex items-center gap-2">
                        <CraftsmanHoverCard
                          userId={user?._id || item?.craftsman?._id || item?.owner?._id}
                          username={user?.username || item?.craftsman?.username || item?.owner?.username}
                          avatarUrl={finalAvatarUrl}
                          displayName={userName}
                          wrapperDisplay="inline"
                        >
                          <h3 className="font-bold text-slate-900 dark:text-gray-100 text-base hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-150 font-sans">
                              {user?.name || item?.craftsman?.name || item?.owner?.name || 'Craftsman'}
                          </h3>
                        </CraftsmanHoverCard>
                     </div>
                     <span className="text-slate-400 text-sm">·</span>
                     <span className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                         {formatDate(createdAt)}
                     </span>
                 </div>
                 <button className="lg:hidden flex-shrink-0 ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 bg-slate-100 dark:bg-white/5 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} title="Toggle Details">
                     {isExpanded ? <X size={18} /> : <PanelRight size={18} />}
                 </button>
             </div>

            {/* Artifact Title & Pricing */}
            <div className="mb-3 flex justify-between items-start gap-4">
                <h2 className="text-base font-normal text-slate-900 dark:text-white mb-1 font-sans">
                    {title}
                </h2>
                <div className="flex-shrink-0 hidden sm:block">
                    {isFree ? (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] font-mono font-medium rounded uppercase tracking-[0.2em]">
                            Free
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-mono font-medium rounded flex items-center gap-1 shadow-sm uppercase tracking-wider">
                            <Zap size={12} /> {price} TKNS
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content Grid: Image + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-3 relative overflow-hidden rounded-xl lg:rounded-none lg:overflow-visible">
                
                {/* Left: Preview Image */}
                <div className="lg:col-span-7 h-full">
                    {previewFile ? (
                        <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-100 dark:border-white/5 group/media w-full shadow-inner aspect-[4/3] lg:aspect-auto lg:h-full">
                            {previewFile.endsWith('.mp4') || previewFile.endsWith('.webm') ? (
                                <video 
                                    src={previewFile} 
                                    className="w-full h-full object-cover"
                                    controls
                                    playsInline
                                />
                            ) : (
                                <Image 
                                    src={previewFile} 
                                    fill 
                                    alt={title || 'Artifact preview'} 
                                    className="object-cover"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 w-full bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10 aspect-[4/3] lg:aspect-auto lg:h-full">
                            <Layers size={48} className="opacity-20 mb-2" />
                            <span className="text-xs font-medium">No preview available</span>
                        </div>
                    )}
                </div>

                {/* Right: Details Section */}
                <div className={`
                    lg:col-span-5 
                    absolute inset-0 z-20 lg:static lg:z-auto lg:h-full p-2 lg:p-0
                    bg-transparent
                    transition-all duration-300 ease-out
                    ${isExpanded 
                        ? 'translate-x-0 opacity-100 visible pointer-events-auto' 
                        : 'translate-x-8 opacity-0 invisible pointer-events-none lg:translate-x-0 lg:opacity-100 lg:visible lg:pointer-events-auto'}
                `}>
                    <div className="bg-white/40 dark:bg-[#0a0a0a]/60 backdrop-blur-xl lg:bg-slate-50 lg:dark:bg-[#111] lg:backdrop-blur-none rounded-xl p-4 lg:p-0 sm:lg:p-4 border border-white/60 dark:border-white/10 lg:border-slate-100 lg:dark:border-white/10 h-full flex flex-col shadow-xl sm:shadow-sm overflow-y-auto lg:overflow-y-visible [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full pr-2 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent]">
                        <div className="space-y-3">
                            
                            {/* Header: Links & Download */}
                            <div className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-white/10">
                                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <FileText size={14}/> Details
                                </span>
                                <div className="flex flex-wrap gap-2 pb-2 sm:pb-0">
                                     {githubLink ? (
                                         <a 
                                            href={githubLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors shadow-sm" 
                                            title="GitHub"
                                         >
                                             <Github size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); showToast('GitHub link not available', "info"); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No GitHub link"
                                         >
                                             <Github size={14} />
                                         </button>
                                     )}
                                     {liveLink ? (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); setShowIframeModal(true); }}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors shadow-sm" 
                                            title="Quick Preview"
                                         >
                                             <Eye size={14} />
                                         </button>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); showToast('Live demo not available', "info"); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No live demo"
                                         >
                                             <ExternalLink size={14} />
                                         </button>
                                     )}
                                     {codepenUrl ? (
                                         <a 
                                            href={codepenUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors shadow-sm" 
                                            title="CodePen"
                                         >
                                             <Code size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); showToast('CodePen link not available', "info"); }}
                                            className="p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-slate-400 cursor-not-allowed" 
                                            title="No CodePen"
                                         >
                                             <Code size={14} />
                                         </button>
                                     )}
                                     <button 
                                        onClick={handleDownload}
                                        className="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-sm shadow-purple-500/25" 
                                        title="Download"
                                     >
                                         <Download size={14} />
                                     </button>
                                </div>
                            </div>

                            {/* Info Grid - Always Show */}
                            <div className="grid grid-cols-2 gap-2">
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Tag size={11}/> Category</div>
                                      <div className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate">
                                          {category || <span className="text-slate-400 italic">Uncategorized</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Code size={11}/> Type</div>
                                      <div className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate uppercase">
                                          {fileType || <span className="text-slate-400 italic">N/A</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Zap size={11}/> Size</div>
                                      <div className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate">
                                          {fileSize ? formatFileSize(fileSize) : <span className="text-slate-400 italic">N/A</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-slate-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Download size={11}/> Downloads</div>
                                      <div className="text-sm font-bold text-slate-800 dark:text-gray-200 truncate">
                                          {downloadsCount !== undefined ? downloadsCount.toLocaleString() : '0'}
                                      </div>
                                 </div>
                            </div>

                            {/* Description - Always Show */}
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</div>
                                <p className="text-sm text-slate-700 dark:text-gray-300 line-clamp-4 leading-relaxed break-words whitespace-normal">
                                    {description ? (
                                        description.length > 160 
                                            ? `${description.substring(0, 160)}...` 
                                            : description
                                    ) : (
                                        <span className="text-slate-400 italic">No description provided</span>
                                    )}
                                </p>
                            </div>

                            {/* Tech Stack - Always Show */}
                            <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Code size={11} /> Tech Stack</div>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    {Array.isArray(tech) && tech.length > 0 ? (
                                        <>
                                            {tech.slice(0, 4).map((t, idx) => (
                                                <span key={idx} className={`text-[10px] font-bold px-2 py-0.5 border rounded-md shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${getTechColor(t)}`} onClick={(e) => { e.stopPropagation(); /* Future filter action */ }}>
                                                    {t}
                                                </span>
                                            ))}
                                            {tech.length > 4 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 border border-slate-200 dark:border-white/10 rounded-md text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5">
                                                    +{tech.length - 4} more
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No tech stack</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar (Souled-Out Refactor: High-Density Discussion Intelligence) */}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100 dark:border-white/5">
                {/* Left: Discussion Intelligence Box (Fisheye "Dock" Effect) */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {(() => {
                        const stats = [
                            { id: 'comment', icon: MessageCircle, title: 'Discussions' },
                            { id: 'question', icon: HelpCircle, title: 'Questions' },
                            { id: 'answer', icon: CheckCircle, title: 'Solutions' },
                            { id: 'issue', icon: AlertCircle, title: 'Issues' },
                            { id: 'suggestion', icon: Lightbulb, title: 'Ideas' },
                            { id: 'critique', icon: Eye, title: 'Critiques' },
                            { id: 'kudos', icon: Flame, title: 'Kudos' }
                        ];

                        const counts = item.discussionStats?.types || {};

                        return stats.map((stat, idx) => {
                            const count = counts[stat.id] || (stat.id === 'comment' ? currentCommentsCount : 0);
                            const Icon = stat.icon;
                            const hasCount = count > 0;

                            const hoverColorMap = {
                                comment: 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200',
                                question: 'group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400',
                                answer: 'group-hover/btn:text-emerald-500 dark:group-hover/btn:text-emerald-400',
                                issue: 'group-hover/btn:text-rose-500 dark:group-hover/btn:text-rose-400',
                                suggestion: 'group-hover/btn:text-amber-500 dark:group-hover/btn:text-amber-400',
                                critique: 'group-hover/btn:text-violet-500 dark:group-hover/btn:text-violet-400',
                                kudos: 'group-hover/btn:text-orange-500 dark:group-hover/btn:text-orange-400'
                            };

                            const baseColor = 'text-slate-700 dark:text-slate-300';
                            
                            const hoverColor = hoverColorMap[stat.id] || 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200';

                            return (
                                <div 
                                    key={stat.id} 
                                    title={stat.title}
                                    className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const filterType = stat.id === 'total' ? 'all' : stat.id;
                                        router.push(`/artifacts/${_id}?filter=${filterType}#comments`);
                                    }}
                                >
                                    <Icon 
                                        size={16} 
                                        className={`${baseColor} ${hoverColor} group-hover/btn:opacity-100 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]`} 
                                    />
                                    {hasCount && (
                                        <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200 transition-colors duration-200 tabular-nums">
                                            {count}
                                        </span>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>

                {/* Right: Engagement & Artifact Stats */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Like */}
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 transition-colors group ${isLiked ? 'text-pink-600' : 'text-slate-700 dark:text-slate-300 hover:text-pink-600'}`}
                    >
                        <div className="transition-colors">
                            <Star size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        </div>
                        <span className="text-[11px] font-mono font-medium tabular-nums">{likesCount}</span>
                    </button>

                    {/* Share */}
                    <button 
                        className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors group"
                        onClick={handleShare}
                    >
                        <div className="transition-colors">
                            <Share2 size={18} />
                        </div>
                    </button>

                    <span className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></span>

                    {/* Download Stats */}
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors group"
                    >
                        <div className="transition-colors">
                            <Download size={18} />
                        </div>
                        <span className="font-mono font-medium text-[11px] tabular-nums">{downloadsCount || 0}</span>
                    </button>

                 </div>
            </div>
        </div>

        {/* Quick Preview Modal */}
        {showIframeModal && liveLink && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in" onClick={(e) => { e.stopPropagation(); setShowIframeModal(false); }}>
                <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title} <span className="text-slate-400 font-normal text-sm ml-2">Quick Preview</span></h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href={liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold rounded-lg transition-colors">
                                <ExternalLink size={14} /> Open in new tab
                            </a>
                            <button onClick={() => setShowIframeModal(false)} className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-black relative">
                        <iframe 
                            src={liveLink} 
                            className="absolute inset-0 w-full h-full border-0"
                            title="Artifact Preview"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default React.memo(ArtifactPostCard);


