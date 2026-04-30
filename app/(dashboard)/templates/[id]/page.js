"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/utils/api";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { ArrowLeft, Heart, Eye, Share2, Download, User, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';

import ProjectRightSidebar from '@/components/dashboard/sidebar/ProjectRightSidebar';

export default function TemplateDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTemplate = async () => {
             if (!id) return;
             try {
                 const res = await api.get(`/template/${id}`);
                 api.post(`/template/${id}/view`, {}).catch(err => console.error("View track err", err));
                 setTemplate(res.data || res); 
             } catch (e) {
                 console.error("Failed to fetch template", e);
             } finally {
                 setLoading(false);
             }
        };
        fetchTemplate();
    }, [id]);

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            const response = await api.post(`/template/${id}/download`);
            if (response.success && response.url) {
                const link = document.createElement('a');
                link.href = response.url;
                link.download = `${template.title || 'template'}.zip`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (response.requiresPurchase) {
                alert('Please purchase this template first');
            } else if (response.requiresAuth) {
                alert('Please login to download');
            }
        } catch (error) {
            console.error("Download error:", error);
            alert('Download failed. Please try again.');
        }
    };

    if (loading) return <div className="h-[80vh] flex items-center justify-center text-gray-500">Loading Template...</div>;

    if (!template) return <div className="h-[80vh] flex items-center justify-center text-red-500">Template Not Found</div>;

    const creator = template.user || template.creator || {};
    const creatorName = creator.name || "Unknown Creator";
    const creatorAvatar = creator.avatar || creator.profilePic;

    return (
        <div className="flex gap-6 w-full relative pb-20">
            <div className="flex-1 w-full min-w-0 max-w-6xl pt-8">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors font-medium">
                    <ArrowLeft size={18} /> Back to Feed
                </button>

                <div className="w-full bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl">
                     {/* Header / Preview */}
                     <div className="grid grid-cols-1 lg:grid-cols-2">
                         {/* Preview Section */}
                         <div className="p-8 bg-gray-100 dark:bg-[#000] flex items-center justify-center min-h-[400px] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 relative">
                              {template.previewFile || template.coverImage ? (
                                  <img src={template.previewFile || template.coverImage} className="max-h-[400px] w-full object-contain rounded-lg shadow-lg" alt={template.title} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                      <iframe 
                                        srcDoc={`<html><style>${template.css || ''} body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;}</style><body>${template.html || template.code || '<h1>Preview</h1>'}</body></html>`}
                                        className="w-full h-[400px] bg-white rounded-lg border-none shadow-lg overflow-hidden"
                                        title="Preview"
                                      />
                                </div>
                              )}
                         </div>

                         {/* Info Section */}
                         <div className="p-8 lg:p-12 flex flex-col justify-center">
                             <div className="flex items-center gap-4 mb-8">
                                 <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden ring-2 ring-purple-500/20 shrink-0">
                                     {creatorAvatar ? (
                                         <img src={creatorAvatar} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                                             {creatorName[0]}
                                         </div>
                                     )}
                                 </div>
                                 <div>
                                     <h1 className="font-bold text-2xl lg:text-3xl mb-1">{template.title}</h1>
                                     <div className="text-sm text-gray-500 font-medium">by <span className="text-purple-600 dark:text-purple-400">{creatorName}</span></div>
                                 </div>
                             </div>

                             <div className="flex gap-4 mb-8">
                                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full">
                                     <Eye size={18} className="text-blue-400" />
                                     <span className="font-mono font-bold">{template.viewsCount || 0}</span>
                                 </div>
                                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full">
                                     <Heart size={18} className="text-pink-500" />
                                     <span className="font-mono font-bold">{template.likes?.length || 0}</span>
                                 </div>
                                 <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full">
                                     <Download size={18} className="text-green-400" />
                                     <span className="font-mono font-bold">{template.downloadsCount || 0}</span>
                                 </div>
                             </div>

                             <div className="space-y-4">
                                 <button 
                                    onClick={handleDownload}
                                    className="w-full py-4 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-colors flex items-center justify-center gap-2 border border-white/10"
                                 >
                                     <Download size={20} /> Download Template
                                 </button>
                             </div>
                         </div>
                     </div>

                     {/* Description & Details Section */}
                     <div className="p-8 lg:p-12 border-t border-gray-200 dark:border-white/10">
                         {/* Description */}
                         {template.description && (
                             <div className="mb-8">
                                 <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                     <FileText size={20} className="text-purple-500" />
                                     About this template
                                 </h2>
                                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base whitespace-pre-wrap break-words">
                                     {template.description}
                                 </p>
                             </div>
                         )}

                         {/* Tech Stack */}
                         {template.tech && template.tech.length > 0 && (
                             <div className="mb-8">
                                 <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tech Stack</h3>
                                 <div className="flex flex-wrap gap-2">
                                     {template.tech.map((tech, idx) => (
                                         <span 
                                             key={idx}
                                             className="px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium border border-purple-500/20"
                                         >
                                             {tech}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {/* Tags */}
                         {template.tags && template.tags.length > 0 && (
                             <div className="mb-8">
                                 <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                                 <div className="flex flex-wrap gap-2">
                                     {template.tags.map((tag, idx) => (
                                         <span 
                                             key={idx}
                                             className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                                         >
                                             #{tag}
                                         </span>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {/* Links */}
                         <div className="flex flex-wrap gap-3">
                             {template.liveLink && (
                                 <a 
                                     href={template.liveLink} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                                 >
                                     <Eye size={16} /> Live Preview
                                 </a>
                             )}
                             {template.githubLink && (
                                 <a 
                                     href={template.githubLink} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                 >
                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                         <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                     </svg>
                                     GitHub
                                 </a>
                             )}
                         </div>
                     </div>
                     {/* Discussion Section */}
                     <div id="comments" className="w-full mt-8 bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl">
                         <div className="p-8 lg:p-12">
                             <AdvancedCommentSection 
                                 postId={template._id} 
                                 postAuthorId={creator?._id} 
                                 initialComments={template.comments || []} 
                             />
                         </div>
                     </div>
                </div>
            </div>
            
            {/* Right Sidebar - Keeps the layout stable! */}
            <div className="hidden xl:block w-[320px] flex-shrink-0">
                 <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                     <ProjectRightSidebar 
                         author={creator} 
                         category={template.category}
                         currentPostId={template._id}
                     />
                 </div>
            </div>
        </div>
    );
}
