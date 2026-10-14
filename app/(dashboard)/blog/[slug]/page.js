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
import GlassNavbar from '@/components/dashboard/GlassNavbar';
import Sidebar from '@/components/dashboard/Sidebar';
import CreatorProfileModal from '@/components/dashboard/modals/CreatorProfileModal';

// Syntax Highlighting
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

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


const RenderedContent = React.memo(({ content }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!content || !contentRef.current) return;
        
        const codeBlocks = contentRef.current.querySelectorAll('pre code');
        if (codeBlocks.length > 0) {
            codeBlocks.forEach((block) => {
                const rawText = block.textContent || block.innerText || '';
                block.innerHTML = '';
                block.textContent = rawText;
                block.removeAttribute('style');
                
                const preElement = block.parentElement;
                if (preElement && preElement.tagName === 'PRE') {
                    preElement.removeAttribute('style');
                }
                
                try {
                    const classes = Array.from(block.classList);
                    let langClass = classes.find(c => c.startsWith('language-'));
                    
                    if (langClass) {
                        let lang = langClass.replace('language-', '');
                        const langMap = { react: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', html: 'xml', vue: 'xml' };
                        if (langMap[lang]) {
                            block.classList.remove(langClass);
                            langClass = 'language-' + langMap[lang];
                            block.classList.add(langClass);
                        }
                        if (!hljs.getLanguage(langClass.replace('language-', ''))) {
                            block.classList.remove(langClass);
                        }
                    }
                    hljs.highlightElement(block);
                } catch(e) {
                    console.error(e);
                }
                
                if (!block.classList.contains('hljs') && !block.querySelector('.hljs-keyword')) {
                    const res = hljs.highlightAuto(rawText);
                    block.innerHTML = res.value;
                    block.classList.add('hljs');
                }
            });
        }
    }, [content]);

    return (
        <div 
            ref={contentRef}
            className="codex-prose w-full max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
});

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

    useEffect(() => {
        if (blog) {
            const userId = currentUser?._id?.toString() || currentUser?._id;
            const initialIsLiked = blog.isLiked === true || (userId && blog.likedBy?.includes(userId)) || false;
            const initialLikesCount = blog.likesCount !== undefined ? blog.likesCount : (typeof blog.likes === 'number' ? blog.likes : (Array.isArray(blog.likes) ? blog.likes.length : 0));
            
            setIsLiked(initialIsLiked);
            setLikesCount(initialLikesCount);
        }
    }, [blog, currentUser]);

    


    const fetchBlog = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/blogs/${slug}?lang=en`);
            const blogData = res.data || res;
            if (blogData) {
                // Map multilingual data for the old UI
                const mappedBlog = {
                    ...blogData,
                    title: blogData.en?.title || blogData.title,
                    content: blogData.en?.content || blogData.content,
                    excerpt: blogData.en?.excerpt || blogData.excerpt,
                };
                setBlog(mappedBlog);
                api.post(`/blogs/${slug}/view`).catch(() => {});
            }
        } catch (err) {
            console.error("Failed to load blog", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) return;
        const currentIsLiked = isLiked;
        
        setIsLiked(!currentIsLiked);
        setLikesCount(prev => currentIsLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            const res = await api.post(`/blogs/${slug}/like`);
            if (res.success) {
                setIsLiked(res.isLiked);
                setLikesCount(res.likesCount);
            } else {
                setIsLiked(currentIsLiked);
                setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
            }
        } catch (error) {
            setIsLiked(currentIsLiked);
            setLikesCount(prev => !currentIsLiked ? Math.max(0, prev - 1) : prev + 1);
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
                    <h1 className="text-4xl font-black text-gray-900 mb-4">404</h1>
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
        <div className="flex justify-center w-full relative">
            <ReadingProgressBar />

            <main className="w-full min-w-0 max-w-4xl pt-8 pb-32 mx-auto">
                <article className="w-full overflow-hidden">
                    
                    <button 
                        onClick={() => router.back()}
                        className="absolute top-10 left-4 z-20 p-3 bg-white/20 hover:bg-white/40 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md rounded-full transition-all text-white border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <header className="relative w-full">
                        {coverImage && (
                            <div className="relative w-full h-[400px] sm:h-[450px] rounded-2xl overflow-hidden mb-8">
                                <Image 
                                    src={coverImage} 
                                    alt={title} 
                                    fill 
                                    priority
                                    className="object-cover"
                                />
                                {/* Reading Time Badge - Top Right */}
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-bold flex items-center gap-2">
                                    <Clock size={14} />
                                    {readTime}
                                </div>
                            </div>
                        )}
                        
                        <div className="px-6 py-8 md:px-10">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                                {title}
                            </h1>
                            
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                                    <Calendar size={16} />
                                    {new Date(createdAt).toLocaleDateString()}
                                </div>
                                
                                {tags && tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    <div className="px-6 py-8 md:px-10 w-full">
                        <RenderedContent content={content} />

                        {tags && tags.length > 3 && (
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                                <div className="flex flex-wrap gap-2">
                                    {tags.slice(3).map((tag, idx) => (
                                        <span key={idx} className="px-4 py-1.5 bg-gray-100 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 rounded-full text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                </main>

            

            <CreatorProfileModal 
                isOpen={isCreatorModalOpen}
                onClose={() => setIsCreatorModalOpen(false)}
                userId={author?._id}
            />
        </div>
    );
}
