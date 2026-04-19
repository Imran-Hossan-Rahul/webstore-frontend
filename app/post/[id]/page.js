
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from "@/utils/api";
import { ArrowLeft } from 'lucide-react';
import ProjectPostCard from '@/components/dashboard/cards/ProjectPostCard';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import GlassNavbar from '@/components/dashboard/GlassNavbar';
import Sidebar from '@/components/dashboard/Sidebar';
import ProjectRightSidebar from '@/components/dashboard/sidebar/ProjectRightSidebar';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${id}`);
            if (res.success) {
                setPost(res.data);
            }
        } catch (err) {
            console.error("Failed to load post", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-400">
                <h1 className="text-xl font-bold mb-2">Post not found</h1>
                <button onClick={() => router.back()} className="text-purple-500 hover:underline">Go back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-x-hidden selection:bg-pink-500/30">
            {/* Background Mesh (consistent with Dashboard) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-400/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[120px]" />
            </div>

            <GlassNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">
                 {/* Left Sidebar */}
                <div className="hidden lg:block w-[240px] flex-shrink-0">
                     <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                        <Sidebar />
                     </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full min-w-0">
                    <div className="pb-20 max-w-4xl mx-auto">
                        {/* Back Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <button 
                                onClick={() => router.back()}
                                className="p-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors border border-gray-200 dark:border-white/5"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-xl font-bold">Thread</h1>
                        </div>

                         <div className="cursor-default mb-6">
                             <ProjectPostCard 
                                item={post} 
                                onClick={() => {}} 
                                isDetailPage={true} 
                             />
                         </div>

                         <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                             <AdvancedCommentSection postId={id} postAuthorId={post.user?._id} />
                         </div>
                    </div>
                </main>

                {/* Right Sidebar */}
                <div className="hidden xl:block w-[320px] flex-shrink-0">
                     <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                         <ProjectRightSidebar 
                            author={post.user} 
                            category={post.projectStats?.category}
                            currentPostId={id}
                         />
                     </div>
                </div>
            </div>
        </div>
    );
}
