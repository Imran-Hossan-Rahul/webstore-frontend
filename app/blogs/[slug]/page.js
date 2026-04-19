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

    // Apply syntax highlighting after content is loaded. 
    // We use a ref to track if we've already highlighted to avoid DOM wipeouts on minor state changes.
    const hasHighlighted = useRef(false);

    useEffect(() => {
        if (blog?.content && !hasHighlighted.current) {
            setTimeout(() => {
                const codeBlocks = document.querySelectorAll('.code-highlight-wrapper pre code');
                if (codeBlocks.length > 0) {
                    codeBlocks.forEach((block) => {
                    // Extract the raw text from the code block, stripping all internal HTML tags
                    // like spans and inline styles that WYSIWYG editors (TipTap) might add.
                    const rawText = block.textContent || block.innerText || '';

                    // Clear the block and set only the raw text back
                    block.innerHTML = '';
                    block.textContent = rawText;
                    
                    // Remove any inline styles on the pre or code tags themselves
                    block.removeAttribute('style');
                    const preElement = block.parentElement;
                    if (preElement && preElement.tagName === 'PRE') {
                        preElement.removeAttribute('style');
                        
                        // Let highlight.js auto-detect and apply syntax colors
                        const highlightedData = hljs.highlightElement(block);
                        
                        // If we haven't already wrapped this block, let's wrap it to match the editor exactly
                        if (!preElement.parentElement.classList.contains('code-block-wrapper')) {
                            // Highlight.js puts the detected language on the block class
                            const detectedLanguage = block.result?.language || block.className.match(/language-([a-zA-Z0-9]+)/)?.[1] || 'text';

                            // Create wrapper
                            const wrapper = document.createElement('div');
                            wrapper.className = 'not-prose code-block-wrapper my-8 rounded-xl overflow-hidden border border-[#30363d] shadow-2xl bg-[#0d1117] font-mono text-[14px] leading-normal';
                            
                            // Create top bar
                            const topBar = document.createElement('div');
                            topBar.className = 'flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none';
                            
                            // Language label
                            const languageLabel = document.createElement('div');
                            languageLabel.className = 'text-[#8b949e] text-xs font-semibold uppercase tracking-wider';
                            languageLabel.innerText = detectedLanguage;

                            // Copy button
                            const copyBtn = document.createElement('button');
                            copyBtn.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d] transition-colors border border-transparent hover:border-[#8b949e]/20';
                            copyBtn.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                <span>Copy</span>
                            `;
                            
                            // Use native event listener
                            copyBtn.onclick = () => {
                                navigator.clipboard.writeText(rawText);
                                copyBtn.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span style="color: #34d399">Copied!</span>
                                `;
                                setTimeout(() => {
                                    copyBtn.innerHTML = `
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                        <span>Copy</span>
                                    `;
                                }, 2000);
                            };

                            topBar.appendChild(languageLabel);
                            topBar.appendChild(copyBtn);

                            // Insert wrapper around PRE
                            preElement.parentNode.insertBefore(wrapper, preElement);
                            wrapper.appendChild(topBar);
                            wrapper.appendChild(preElement);
                            
                            // Fix pre padding and margin to match editor component perfectly
                            preElement.style.margin = '0';
                            preElement.style.padding = '1.25rem';
                            preElement.style.backgroundColor = '#0d1117'; // Match editor entirely
                            preElement.style.border = 'none';
                            preElement.style.borderRadius = '0';
                            preElement.style.boxShadow = 'none';
                            
                            // Ensure text is light
                            preElement.style.color = '#d4d4d4';
                            block.style.color = '#d4d4d4';
                            block.style.backgroundColor = 'transparent';
                        }
                    } else {
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
                setBlog(res); // getSingleBlog returns the blog directly in res
                setLikesCount(res.likesCount || 0);
                
                // Track view implicitly
                api.post(`/blog/${slug}/view`).catch(() => {});
            }
        } catch (err) {
            console.error("Failed to load blog", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!currentUser) return; // Add auth prompt here if needed
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
            // Replace with toast later
            alert("Link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Crafting your reading experience...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white dark:bg-black/50 p-12 rounded-3xl border border-gray-100 dark:border-white/5 text-center max-w-md">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-500 mb-8">The story you're looking for has drifted into the void.</p>
                    <button 
                        onClick={() => router.push('/')} 
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
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
        <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-emerald-500/30">
            
            {/* Reading Progress Bar */}
            <ReadingProgressBar />

            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 flex justify-center">
                <div className="absolute top-[-10%] w-[80%] h-[50%] bg-emerald-400/20 rounded-full blur-[150px]" />
                <div className="absolute bottom-[10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[150px]" />
            </div>

            <GlassNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isGuest={!currentUser} />

            <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1600px] mx-auto">
                {/* Left Sidebar */}
                <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 z-40 lg:block w-[240px] flex-shrink-0 bg-white dark:bg-transparent`}>
                    <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto hidden lg:block">
                        <Sidebar isGuest={!currentUser} />
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 w-full min-w-0 pb-32">
                    <article className="max-w-4xl mx-auto bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg overflow-hidden relative">
                        
                        {/* Go Back Button (Absolute over Cover) */}
                        <button 
                            onClick={() => router.back()}
                            className="absolute top-6 left-6 z-20 p-3 bg-white/20 hover:bg-white/40 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-md rounded-full transition-all text-white border border-white/20 group hover:scale-105"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>

                        {/* Hero Header Region */}
                        <header className="relative w-full">
                            {coverImage ? (
                                <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
                                    <Image 
                                        src={coverImage} 
                                        alt={title} 
                                        fill 
                                        priority
                                        className="object-cover"
                                    />
                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
                                        <div className="max-w-3xl">
                                            {category && (
                                                <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tracking-wider text-xs uppercase border border-emerald-500/30 backdrop-blur-md">
                                                    {category}
                                                </span>
                                            )}
                                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6" style={{textWrap: 'balance'}}>
                                                {title}
                                            </h1>
                                            
                                            {/* Meta Info */}
                                            <div className="flex flex-wrap items-center gap-6 text-gray-300 font-medium text-sm md:text-base">
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                    onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}
                                                >
                                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 relative">
                                                        <img 
                                                            src={author?.profilePicture || author?.avatar || `https://ui-avatars.com/api/?name=${author?.name}&background=10B981&color=fff`} 
                                                            alt={author?.name} 
                                                            className="w-full h-full object-cover relative z-10" 
                                                        />
                                                    </div>
                                                    <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {author?.name || 'Anonymous'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-emerald-400" />
                                                    {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-emerald-400" />
                                                    {readTime}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // No Cover Image Header
                                <div className="px-8 pt-20 pb-10 md:px-16 md:pt-28 md:pb-14 border-b border-gray-100 dark:border-white/[0.06]">
                                    {category && (
                                        <span className="inline-block px-3 py-1 mb-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider text-xs uppercase" style={{fontFamily: 'Inter, sans-serif'}}>
                                            {category}
                                        </span>
                                    )}
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-snug mb-6" style={{fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', textWrap: 'balance'}}>
                                        {title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-6 text-gray-500 font-medium">
                                        <div 
                                            className="flex items-center gap-3 cursor-pointer group"
                                            onClick={(e) => { e.stopPropagation(); setIsCreatorModalOpen(true); }}
                                        >
                                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                                <img 
                                                    src={author?.profilePicture || author?.avatar || `https://ui-avatars.com/api/?name=${author?.name}&background=10B981&color=fff`} 
                                                    alt={author?.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                                {author?.name || 'Anonymous'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            {new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            {readTime}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </header>

                        <div className="flex flex-col md:flex-row relative">
                            {/* Floating Social Actions (Sticky Sidebar) */}
                            <div className="hidden md:block w-24 flex-shrink-0 border-r border-gray-100 dark:border-white/5">
                                <div className="sticky top-32 flex flex-col items-center gap-6 py-12">
                                    <button 
                                        onClick={handleLike}
                                        className={`group flex flex-col items-center gap-2 transition-all hover:-translate-y-1 ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-black/50 group-hover:border-pink-500/30 group-hover:bg-pink-500/10 transition-colors shadow-sm">
                                            <Heart size={22} className={isLiked ? 'fill-current' : ''} />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{likesCount}</span>
                                    </button>

                                    <button 
                                        onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })}
                                        className="group flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-all hover:-translate-y-1"
                                    >
                                        <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-black/50 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors shadow-sm">
                                            <MessageCircle size={22} />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">{blog.comments?.length || 0}</span>
                                    </button>

                                    <div className="w-8 h-px bg-gray-200 dark:bg-white/10 my-2"></div>

                                    <button 
                                        onClick={() => setIsSaved(!isSaved)}
                                        className={`group flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 transition-all hover:-translate-y-1 shadow-sm ${isSaved ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-gray-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:bg-emerald-500/10'}`}
                                    >
                                        <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
                                    </button>

                                    <button 
                                        onClick={shareBlog}
                                        className="group flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black/50 text-gray-400 hover:text-purple-500 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all hover:-translate-y-1 shadow-sm"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Body */}
                            <div className="flex-1 px-6 py-12 md:px-14 md:py-16 max-w-[780px]">
                                {/* Simulated markdown/html rendering with highly polished typography */}
                                <div 
                                    className="blog-prose code-highlight-wrapper [&_pre]:!bg-transparent [&_pre]:!text-[#d4d4d4] [&_pre]:!p-0 [&_pre]:!m-0 [&_pre_code]:!bg-transparent [&_pre_code]:!text-[#d4d4d4] [&_pre_code_span]:!leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: blog.content }}
                                />

                                {/* Tags Section */}
                                {tags && tags.length > 0 && (
                                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag, idx) => (
                                                <span key={idx} className="px-4 py-1.5 bg-gray-100 dark:bg-white/[0.03] text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent dark:border-white/5">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom Author Card */}
                                <div className="mt-16 bg-gray-50 dark:bg-white/[0.02] rounded-3xl p-8 border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-6 md:items-center">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl relative flex-shrink-0">
                                        <Image 
                                            src={author?.profilePicture || author?.avatar || `https://ui-avatars.com/api/?name=${author?.name}&background=10B981&color=fff`} 
                                            alt={author?.name} 
                                            fill 
                                            className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold tracking-widest text-emerald-500 uppercase mb-1">Written By</div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{author?.name || 'Anonymous Creator'}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mb-4 leading-relaxed line-clamp-2">
                                            {author?.bio || "A passionate writer and creator building amazing experiences. They haven't provided a full bio yet, but their words speak for themselves."}
                                        </p>
                                        <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Bottom Action Bar (visible only on md:hidden) */}
                        <div className="md:hidden sticky bottom-0 left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 p-4 flex justify-around items-center z-50">
                            <button onClick={handleLike} className={`flex flex-col items-center gap-1 ${isLiked ? 'text-pink-500' : 'text-gray-500'}`}>
                                <Heart size={24} className={isLiked ? 'fill-current' : ''} />
                                <span className="text-[10px] font-bold">{likesCount}</span>
                            </button>
                            <button onClick={() => document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 text-gray-500">
                                <MessageCircle size={24} />
                                <span className="text-[10px] font-bold">{blog.comments?.length || 0}</span>
                            </button>
                            <button onClick={() => setIsSaved(!isSaved)} className={`flex flex-col items-center gap-1 ${isSaved ? 'text-emerald-500' : 'text-gray-500'}`}>
                                <Bookmark size={24} className={isSaved ? 'fill-current' : ''} />
                                <span className="text-[10px] font-bold">Save</span>
                            </button>
                            <button onClick={shareBlog} className="flex flex-col items-center gap-1 text-gray-500">
                                <Share2 size={24} />
                                <span className="text-[10px] font-bold">Share</span>
                            </button>
                        </div>
                    </article>

                    {/* Comments Section */}
                    <div id="comments" className="max-w-4xl mx-auto mt-12 bg-white dark:bg-[#0f0f0f] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl">
                        <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <MessageCircle className="text-emerald-500" /> 
                                Discussion <span className="text-gray-400 font-medium text-lg">({blog.comments?.length || 0})</span>
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm">Join the conversation and share your thoughts.</p>
                        </div>
                        <div className="p-4 md:p-8">
                            <AdvancedCommentSection 
                                postId={blog._id} 
                                postAuthorId={blog.author?._id} 
                                initialComments={blog.comments || []} 
                            />
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (Optional, but gives it a Platform feel) */}
                <div className="hidden xl:block w-[320px] flex-shrink-0">
                     <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                         <ProjectRightSidebar 
                            author={author} 
                            category={category}
                         />
                     </div>
                </div>

            </div>

            {/* Creator Profile Modal */}
            <CreatorProfileModal 
                isOpen={isCreatorModalOpen}
                onClose={() => setIsCreatorModalOpen(false)}
                userId={author?._id}
            />
        </div>
    );
}
