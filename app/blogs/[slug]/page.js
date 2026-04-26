"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from "@/utils/api";
import { 
    ArrowLeft, Heart, MessageCircle, Share2, Bookmark, 
    MoreHorizontal, Clock, Calendar, Eye, Linkedin, Twitter, Link as LinkIcon,
    Copy, Check
} from 'lucide-react';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import GlassNavbar from '@/components/dashboard/GlassNavbar';
import Sidebar from '@/components/dashboard/Sidebar';
import ProjectRightSidebar from '@/components/dashboard/sidebar/ProjectRightSidebar';
import CreatorProfileModal from '@/components/dashboard/modals/CreatorProfileModal';

// Syntax Highlighting
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

const ReadingProgressBar = () => {
    const [readingProgress, setReadingProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            setReadingProgress(progress);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-800">
            <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-150 ease-out"
                style={{ width: `${readingProgress}%` }}
            />
        </div>
    );
};

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params || {};
    
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Interactions state
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    const [currentUser, setCurrentUser] = useState(null);
    const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

    // Fetch User for Auth checks
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/user/profile');
                if (res.success) {
                    setCurrentUser(res.data);
                }
            } catch (err) {
                // Not authenticated
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (slug) fetchBlog();
    }, [slug]);

    const hasHighlighted = useRef(false);

    useEffect(() => {
        if (blog?.content && !hasHighlighted.current) {
            setTimeout(() => {
                const codeBlocks = document.querySelectorAll('.code-highlight-wrapper pre code');
                if (codeBlocks.length > 0) {
                    codeBlocks.forEach((block) => {
                    const rawText = block.textContent || block.innerText || '';
                    block.innerHTML = '';
                    block.textContent = rawText;
                    block.removeAttribute('style');
                    const preElement = block.parentElement;
                    if (preElement && preElement.tagName === 'PRE') {
                        preElement.removeAttribute('style');
                        hljs.highlightElement(block);
                    }
                });
                hasHighlighted.current = true;
                }
            }, 100);
        }
    }, [blog?.content]);


    const fetchBlog = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/blog/${slug}`);
            if (res) {
                setBlog(res);
                setLikesCount(res.likesCount || 0);
                api.post(`/blog/${slug}/view`).catch(() => {});
            }
        } catch (err) {
            console.error("Failed to load blog", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) return;
        const prevLiked = isLiked;
        const prevCount = likesCount;
        
        setIsLiked(!prevLiked);
        setLikesCount(prev => prevLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            const res = await api.post(`/blog/${slug}/like`);
            if (res.success) {
                setIsLiked(res.isLiked);
                setLikesCount(res.likesCount);
            } else {
                setIsLiked(prevLiked);
                setLikesCount(prevCount);
            }
        } catch (error) {
            setIsLiked(prevLiked);
            setLikesCount(prevCount);
        }
    };

    const shareBlog = () => {
        if (navigator.share) {
            navigator.share({
                title: blog?.title,
                text: 'Check out this amazing article!',
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white dark:bg-black/50 p-12 rounded-3xl border border-gray-100 dark:border-white/5 text-center max-w-md">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-500 mb-8">Blog not found</p>
                    <button 
                        onClick={() => router.push('/')} 
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const {
        title, content, coverImage, author, createdAt, readTime, views, tags, category
    } = blog;

    return (
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100">
            
            <ReadingProgressBar />

            <GlassNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isGuest={!currentUser} />

            <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1600px] mx-auto">
                <div className="hidden lg:block w-[240px] flex-shrink-0">
                    <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                        <Sidebar isGuest={!currentUser} />
                    </div>
                </div>

                <main className="flex-1 w-full min-w-0 pb-32">
                    <article className="max-w-4xl mx-auto bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg overflow-hidden">
                        
                        <button 
                            onClick={() => router.back()}
                            className="absolute top-6 left-6 z-20 p-3 bg-white/20 hover:bg-white/40 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md rounded-full transition-all text-white border border-white/20"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <header className="relative w-full">
                            {coverImage && (
                                <div className="relative w-full h-[400px] sm:h-[500px]">
                                    <Image 
                                        src={coverImage} 
                                        alt={title} 
                                        fill 
                                        priority
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                                        <div className="max-w-3xl">
                                            {category && (
                                                <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase">
                                                    {category}
                                                </span>
                                            )}
                                            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                                                {title}
                                            </h1>
                                            
                                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        <img 
                                                            src={author?.profilePicture || author?.avatar || `https://ui-avatars.com/api/?name=${author?.name}`} 
                                                            alt={author?.name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    </div>
                                                    <span className="font-bold text-white">
                                                        {author?.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {new Date(createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    {readTime}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </header>

                        <div className="px-6 py-12 md:px-14 md:py-16 max-w-[780px] mx-auto">
                            <div 
                                className="blog-prose"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />

                            {tags && tags.length > 0 && (
                                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, idx) => (
                                            <span key={idx} className="px-4 py-1.5 bg-gray-100 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>

                    <div id="comments" className="max-w-4xl mx-auto mt-12 bg-white dark:bg-[#0f0f0f] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="p-8">
                            <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
                                <MessageCircle className="text-emerald-500" /> 
                                Comments ({blog.comments?.length || 0})
                            </h2>
                            <AdvancedCommentSection 
                                postId={blog._id} 
                                postAuthorId={blog.author?._id} 
                                initialComments={blog.comments || []} 
                            />
                        </div>
                    </div>
                </main>

                <div className="hidden xl:block w-[320px] flex-shrink-0">
                     <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                         <ProjectRightSidebar 
                            author={author} 
                            category={category}
                         />
                     </div>
                </div>
            </div>

            <CreatorProfileModal 
                isOpen={isCreatorModalOpen}
                onClose={() => setIsCreatorModalOpen(false)}
                userId={author?._id}
            />
        </div>
    );
}
