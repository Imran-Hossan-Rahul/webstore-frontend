"use client";
import React, { useEffect, useState } from "react";
import { api } from "@/utils/api";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import { ArrowLeft, Heart, Eye, Share2, Download, Copy, Check, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function TemplateDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
             if (!id) return;
             try {
                 const res = await api.get(`/template/${id}`); // Fixed route to match Singular
                 // Track view
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

    const handleCopyCode = () => {
        if (!template?.code) return;
        navigator.clipboard.writeText(template.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex items-center justify-center text-gray-500">Loading Template...</div>;

    if (!template) return <div className="h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex items-center justify-center text-red-500">Template Not Found</div>;

    const creator = template.user || template.creator || {};
    const creatorName = creator.name || "Unknown Creator";
    const creatorAvatar = creator.avatar || creator.profilePic;

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-white pb-20">
             <GlassNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
             
             <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1400px] mx-auto">
                <div className="hidden lg:block w-[240px] flex-shrink-0">
                    <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                        <Sidebar />
                    </div>
                </div>

                <main className="flex-1 w-full min-w-0">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black dark:hover:text-white mb-6 transition-colors font-medium">
                        <ArrowLeft size={18} /> Back to Feed
                    </button>

                    <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl">
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
                                     <button className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                         <Download size={20} /> Download Template
                                     </button>
                                     <button 
                                        onClick={handleCopyCode}
                                        className="w-full py-4 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-colors flex items-center justify-center gap-2 border border-white/10"
                                     >
                                         {copied ? <Check size={20} className="text-green-400"/> : <Copy size={20} />}
                                         {copied ? "Copied!" : "Copy Code"}
                                     </button>
                                 </div>
                             </div>
                         </div>
                    </div>

                </main>
             </div>
        </div>
    );
}
