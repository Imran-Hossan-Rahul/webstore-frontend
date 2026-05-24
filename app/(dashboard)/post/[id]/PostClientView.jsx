"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from "@/utils/api";
import { 
  ArrowLeft, MessageCircle, Layers, Flag, CheckCircle2, Clock, Circle, ChevronDown, ChevronUp, Calendar
} from 'lucide-react';
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import JsonLd, { buildTechArticleSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';

// Expandable milestone card
function MilestoneCard({ milestone, index }) {
    const [expanded, setExpanded] = useState(false);

    const statusIcon = milestone.status === 'Completed'
        ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
        : milestone.status === 'In Progress'
        ? <Clock size={16} className="text-blue-500 shrink-0 animate-pulse" />
        : <Circle size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />;

    const statusColor = milestone.status === 'Completed'
        ? 'border-l-emerald-400'
        : milestone.status === 'In Progress'
        ? 'border-l-blue-400'
        : 'border-l-slate-200 dark:border-l-white/10';

    const hasLongDesc = milestone.description && milestone.description.length > 80;

    return (
        <div className={`border border-slate-100 dark:border-white/5 border-l-4 ${statusColor} rounded-xl bg-white dark:bg-white/[0.02] transition-all hover:border-slate-200 dark:hover:border-white/10`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-start gap-4 p-4 text-left"
            >
                {/* Index */}
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 mt-0.5 shrink-0 w-4 text-right">
                    {String(index + 1).padStart(2, '0')}
                </span>

                {/* Status Icon */}
                <div className="mt-0.5">{statusIcon}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white leading-snug">
                            {milestone.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                            {milestone.date && (
                                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
                                    <Calendar size={10} />
                                    {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                            {hasLongDesc && (
                                <span className="text-slate-400">
                                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </span>
                            )}
                        </div>
                    </div>

                    {milestone.description && (
                        <p className={`text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 transition-all ${
                            expanded || !hasLongDesc ? 'line-clamp-none' : 'line-clamp-2'
                        }`}>
                            {milestone.description}
                        </p>
                    )}
                </div>
            </button>

            {/* Status Badge */}
            {milestone.status && (
                <div className="px-4 pb-3 pl-12 flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        milestone.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        milestone.status === 'In Progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-slate-100 dark:bg-white/5 text-slate-400'
                    }`}>
                        {milestone.status}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function PostClientView({ initialPost }) {
    const { id } = useParams();
    const router = useRouter();
    
    const [post, setPost] = useState(initialPost || null);
    const [loading, setLoading] = useState(!initialPost);
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (!initialPost && id) fetchPost();
        
        // Fetch current user to check if they are the author
        api.get('/user/profile')
            .then(res => setCurrentUser(res.user || res.data))
            .catch(() => {});
    }, [id, initialPost]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/${id}`);
            if (res.success) {
                setPost(res.data);
                api.post(`/posts/${id}/view`, {}).catch(() => {});
            }
        } catch (err) {
            console.error("Failed to load post", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!post?.user?._id) return;
        if (!currentUser) {
            alert("Please login to connect with the developer.");
            router.push('/login');
            return;
        }

        try {
            setIsConnecting(true);
            // Open the global chat modal instead of redirecting
            window.dispatchEvent(new CustomEvent("open-chat", { detail: { userId: post.user._id } }));
        } catch (err) {
            console.error("Failed to connect:", err);
            alert("Failed to connect with the developer.");
        } finally {
            setIsConnecting(false);
        }
    };

    const isAuthor = currentUser && post?.user?._id === currentUser._id;

    if (loading) {
        return (
            <div className="w-full max-w-5xl px-4 py-12 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded mb-10"></div>
                <div className="h-12 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-8"></div>
                <div className="w-full aspect-video bg-slate-200 dark:bg-white/10 rounded-2xl mb-12"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4">Devlog not found</h1>
                <p className="text-slate-500 mb-8 max-w-md">The devlog you are looking for doesn&apos;t exist or has been removed.</p>
                <button onClick={() => router.push('/')} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all">
                    Back to Discover
                </button>
            </div>
        );
    }

    const { title, content, images = [], devlogStats = {} } = post;
    const milestones = devlogStats.milestones || [];
    const coverImage = images[0] || null;
    const completedCount = milestones.filter(m => m.status === 'Completed').length;

    return (
        <div className="w-full">

            {/* JSON-LD Structured Data — TechArticle + Breadcrumb */}
            <JsonLd data={buildTechArticleSchema({
                title: post.seoTitle || post.title,
                description: post.seoDescription || post.content?.replace(/<[^>]+>/g, '').substring(0, 150),
                author: post.user?.name,
                publishedAt: post.createdAt,
                updatedAt: post.updatedAt,
                image: post.images?.[0],
                url: `https://codalina-frontend-fawn.vercel.app/post/${id}`,
                tools: post.devlogStats?.tools,
                difficulty: post.devlogStats?.difficulty
            })} />
            <JsonLd data={buildBreadcrumbSchema([
                { name: 'Home', url: 'https://codalina-frontend-fawn.vercel.app' },
                { name: 'Devlogs', url: 'https://codalina-frontend-fawn.vercel.app/devlogs' },
                { name: post.title, url: `https://codalina-frontend-fawn.vercel.app/post/${id}` }
            ])} />
            
            {/* Back Navigation */}
            <nav className="mb-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to feed
                </button>
            </nav>

            {/* Title */}
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] text-slate-900 dark:text-white">
                    {title}
                </h1>
            </header>

            {/* Cover Image */}
            <div className="mb-12">
                {/* Author & Connect Header */}
                <div className="flex items-center justify-between mb-6 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
                            {post.user?.avatar ? (
                                <Image src={post.user.avatar} alt={post.user.name || "User"} width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">{post.user?.name?.[0] || "?"}</div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{post.user?.name || "Unknown Developer"}</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{post.postType === 'devlog' ? 'Craftsman / Developer' : 'Author'}</p>
                        </div>
                    </div>
                    
                    {!isAuthor && (
                        <button 
                            onClick={handleConnect}
                            disabled={isConnecting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70"
                        >
                            <MessageCircle size={18} />
                            {isConnecting ? "Connecting..." : "Connect / Hire Me"}
                        </button>
                    )}
                </div>

                <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111] shadow-2xl">
                    {coverImage ? (
                        <Image 
                            src={coverImage} 
                            alt={title} 
                            fill 
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                            <Layers size={48} className="mb-4 opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-widest">No Cover Image</span>
                        </div>
                    )}
                </div>

                {/* Additional gallery — only if 2+ images */}
                {images.length > 1 && (
                    <div className="mt-6 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {images.slice(1).map((img, idx) => (
                            <div key={idx} className="relative w-48 aspect-video rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/10 group cursor-pointer">
                                <Image src={img} alt={`Gallery ${idx + 1}`} fill className="object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Layers className="text-white" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Body */}
            <div style={{ maxWidth: 'calc(56rem - 40px)' }} className="mb-20">
                <div className="prose dark:prose-invert max-w-none codex-prose">
                    <div 
                        className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>

            {/* Milestones — above Discussion */}
            {milestones.length > 0 && (
                <section className="mb-16 pt-12 border-t border-slate-100 dark:border-white/5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-slate-900 dark:text-white">
                            <Flag size={16} className="text-indigo-500" />
                            Milestones
                        </h2>
                        <div className="flex items-center gap-3">
                            {/* Progress bar */}
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                        style={{ width: milestones.length > 0 ? `${(completedCount / milestones.length) * 100}%` : '0%' }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400">
                                    {completedCount}/{milestones.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Cards */}
                    <div className="space-y-3">
                        {milestones.map((milestone, idx) => (
                            <MilestoneCard key={idx} milestone={milestone} index={idx} />
                        ))}
                    </div>
                </section>
            )}

            {/* Discussion Section */}
            <div id="comments" className="pt-12 border-t border-slate-100 dark:border-white/5 scroll-mt-24">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-slate-900 dark:text-white">
                    <MessageCircle size={18} />
                    Devlog Discussion
                </h2>
                <AdvancedCommentSection postId={id} />
            </div>
        </div>
    );
}
