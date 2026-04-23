import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, 
  Download, ExternalLink, Eye, Tag, DollarSign, Globe, Github,
  FileText, Shield, Layers, Clock, Code, Zap
} from 'lucide-react';
import { api } from "@/utils/api";
import { useRouter } from 'next/navigation';
import CreatorProfileModal from '../modals/CreatorProfileModal';

const TemplatePostCard = ({ 
  item, 
  onClick,
  isDetailPage = false,
  isGuest = false,
  onRequireAuth
}) => {
  const router = useRouter();
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
  const [likesCount, setLikesCount] = useState(initialLikes || initialLikeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [currentCommentsCount, setCurrentCommentsCount] = useState(initialCommentsCount);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  
  const isFree = priceType === 'free' || !price || price === 0;
  const imageSrc = previewFile || thumbnail;

  const handleNavigation = (e) => {
      if (isDetailPage) return;
      router.push(`/templates/${_id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('like'); return; }
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      const response = await api.post(`/template/${_id}/like`);
      if (response.queued !== undefined) {
        setIsLiked(response.liked);
        setLikesCount(prev => response.liked ? prev + 1 : prev - 1);
      }
    } catch (err) {
       console.error("Like failed", err);
    } finally {
      setTimeout(() => setIsLiking(false), 600);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isGuest) { onRequireAuth?.('download'); return; }
    try {
      const response = await api.post(`/template/${_id}/download`);
      if (response.success && response.url) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.url;
        link.download = `${title || 'template'}.zip`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (response.requiresPurchase) {
        alert('Please purchase this template first');
      }
    } catch (error) {
      console.error("Download error:", error);
      alert('Download failed. Please try again.');
    }
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

  return (
    <div 
        className="group relative bg-white dark:bg-black border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer p-4 flex gap-6"
        onClick={handleNavigation}
    >
        {/* Left Column: Avatar */}
        <div className="flex-shrink-0">
             <div 
                className="relative group/avatar cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault();
                    setIsCreatorModalOpen(true); 
                }}
             >
                 <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white dark:bg-black border border-gray-200 dark:border-white/10">
                     {(() => {
                       const avatarUrl = user?.profilePicture || user?.avatar || user?.profilePic || 
                                        item?.creator?.profilePicture || item?.creator?.avatar ||
                                        item?.owner?.profilePicture || item?.owner?.avatar ||
                                        item?.user?.profilePicture || item?.user?.avatar;
                       const userName = user?.name || item?.creator?.name || item?.owner?.name || item?.user?.name || 'Creator';
                       
                       return avatarUrl ? (
                         <Image 
                            src={avatarUrl} 
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
                       );
                     })()}
                 </div>
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
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault();
                                setIsCreatorModalOpen(true); 
                            }}
                        >
                            {user?.name || item?.creator?.name || item?.owner?.name || 'Creator'}
                        </h3>
                         {/* TYPE BADGE: TEMPLATE */}
                         <span className="bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                            <Layers size={10} className="stroke-[3]" /> Template
                        </span>
                     </div>
                     <span className="text-gray-400 text-sm">·</span>
                     <span className="text-gray-500 dark:text-gray-400 text-sm">
                         {formatDate(createdAt)}
                     </span>
                 </div>
                 <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                     <MoreHorizontal size={18} />
                 </button>
            </div>

            {/* Template Title */}
            <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {title}
                </h2>
            </div>

            {/* Main Content Grid: Image + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-3">
                
                {/* Left: Preview Image */}
                <div className="lg:col-span-7 h-full">
                    {previewFile ? (
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5 group/media h-full min-h-[300px] lg:min-h-[450px] shadow-inner">
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
                                    alt={title || 'Template preview'} 
                                    className="object-cover"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 h-[300px] bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                            <Layers size={48} className="opacity-20 mb-2" />
                            <span className="text-xs font-medium">No preview available</span>
                        </div>
                    )}
                </div>

                {/* Right: Details Section */}
                <div className="lg:col-span-5">
                    <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4 border border-gray-100 dark:border-white/10 h-full flex flex-col shadow-sm">
                        <div className="space-y-3">
                            
                            {/* Header: Links & Download */}
                            <div className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-white/10">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                    <FileText size={14}/> Details
                                </span>
                                <div className="flex gap-2">
                                     {githubLink ? (
                                         <a 
                                            href={githubLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-colors shadow-sm" 
                                            title="GitHub"
                                         >
                                             <Github size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); alert('GitHub link not available'); }}
                                            className="p-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 cursor-not-allowed" 
                                            title="No GitHub link"
                                         >
                                             <Github size={14} />
                                         </button>
                                     )}
                                     {liveLink ? (
                                         <a 
                                            href={liveLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors shadow-sm" 
                                            title="Live Demo"
                                         >
                                             <ExternalLink size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); alert('Live demo not available'); }}
                                            className="p-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 cursor-not-allowed" 
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
                                            className="p-1.5 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm" 
                                            title="CodePen"
                                         >
                                             <Code size={14} />
                                         </a>
                                     ) : (
                                         <button 
                                            onClick={(e) => { e.stopPropagation(); alert('CodePen link not available'); }}
                                            className="p-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 cursor-not-allowed" 
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
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Tag size={11}/> Category</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                          {category || <span className="text-gray-400 italic">Uncategorized</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Code size={11}/> Type</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate uppercase">
                                          {fileType || <span className="text-gray-400 italic">N/A</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Zap size={11}/> Size</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                          {fileSize ? formatFileSize(fileSize) : <span className="text-gray-400 italic">N/A</span>}
                                      </div>
                                 </div>
                                 <div className="bg-white dark:bg-black p-2 rounded-lg border border-gray-100 dark:border-white/5">
                                      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Download size={11}/> Downloads</div>
                                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                          {downloadsCount !== undefined ? downloadsCount.toLocaleString() : '0'}
                                      </div>
                                 </div>
                            </div>

                            {/* Description - Always Show */}
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 leading-relaxed break-words whitespace-normal">
                                    {description ? (
                                        description.length > 160 
                                            ? `${description.substring(0, 160)}...` 
                                            : description
                                    ) : (
                                        <span className="text-gray-400 italic">No description provided</span>
                                    )}
                                </p>
                            </div>

                            {/* Tech Stack - Always Show */}
                            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Code size={11} /> Tech Stack</div>
                                <div className="flex flex-wrap gap-1">
                                    {Array.isArray(tech) && tech.length > 0 ? (
                                        tech.map((t, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                                                {t}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No tech stack</span>
                                    )}
                                </div>
                            </div>

                            {/* Tags - Always Show */}
                            <div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Tag size={11} /> Tags</div>
                                <div className="flex flex-wrap gap-1">
                                    {tags && tags.length > 0 ? (
                                        tags.slice(0, 6).map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                                                #{tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No tags</span>
                                    )}
                                </div>
                            </div>

                            {/* Version Info - Always Show */}
                            <div className="pt-2 border-t border-gray-200 dark:border-white/10">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock size={11} /> Version</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {versions && versions.length > 0 ? (
                                        <>v{versions[versions.length - 1].version} · {formatDate(versions[versions.length - 1].updatedAt)}</>
                                    ) : (
                                        <span className="italic">v1.0.0 · {formatDate(createdAt)}</span>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-6">
                    {/* Like */}
                    <button 
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center gap-2 text-sm group transition-all ${
                            isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
                        }`}
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-pink-500/10 transition-colors">
                            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiking ? 'animate-bounce' : ''} />
                        </div>
                        <span className="text-xs font-bold tabular-nums">{likesCount}</span>
                    </button>

                    {/* Comment */}
                    <button 
                        onClick={handleNavigation}
                        className="flex items-center gap-2 text-sm group transition-all text-gray-500 hover:text-blue-500"
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-blue-500/10 transition-colors">
                            <MessageCircle size={18} />
                        </div>
                        <span className="text-xs font-bold tabular-nums">{currentCommentsCount}</span>
                    </button>

                    {/* Share */}
                    <button 
                        className="flex items-center gap-2 text-sm group transition-all text-gray-500 hover:text-green-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-1.5 rounded-full group-hover:bg-green-500/10 transition-colors">
                            <Share2 size={18} />
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Download */}
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Download</span>
                    </button>

                    {/* Bookmark */}
                    <button className="text-gray-400 hover:text-purple-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <Bookmark size={18} />
                    </button>
                 </div>
            </div>
        </div>

        {/* Creator Profile Modal */}
        <CreatorProfileModal 
            isOpen={isCreatorModalOpen}
            onClose={() => setIsCreatorModalOpen(false)}
            userId={user?._id || item?.creator?._id || item?.owner?._id}
        />
    </div>
  );
};

export default TemplatePostCard;
