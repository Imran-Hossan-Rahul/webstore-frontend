"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from "@/utils/api";
import { ArrowLeft, Eye, Share2, Download, Github, ExternalLink, FileText, Tag, Users, Calendar, Shield, Zap, Code, Hash, MessageCircle, Layers, MoreHorizontal, ChevronRight, Edit3, ArrowUpCircle, Star } from "lucide-react";
import AdvancedCommentSection from '@/components/dashboard/comments/AdvancedCommentSection';
import { useUser } from '@/context/UserContext';
import JsonLd, { buildSoftwareSchema, buildBreadcrumbSchema } from '@/components/seo/JsonLd';

const BASE_URL = 'https://codalina-frontend-fawn.vercel.app';

export default function ArtifactClientView({ initialArtifact }) {
    const { id } = useParams();
    const router = useRouter();
    const { user: authUser } = useUser();
    
    const [artifact, setArtifact] = useState(initialArtifact || null);
    const [loading, setLoading] = useState(!initialArtifact);

    useEffect(() => {
        if (!initialArtifact && id) fetchArtifact();
        else if (initialArtifact && id) {
            api.post(`/artifact/${id}/view`, {}).catch(() => {});
        }
    }, [id, initialArtifact]);

    const fetchArtifact = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/artifact/${id}`);
            const data = res.data || res;
            setArtifact(data);
            api.post(`/artifact/${id}/view`, {}).catch(() => {});
        } catch (err) {
            console.error("Failed to load artifact", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-5xl px-4 py-12 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded mb-10"></div>
                <div className="h-12 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-8"></div>
                <div className="h-6 w-1/2 bg-slate-200 dark:bg-white/10 rounded mb-12"></div>
                <div className="w-full aspect-video bg-slate-200 dark:bg-white/10 rounded-2xl mb-12"></div>
                <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-white/10 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (!artifact) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <Layers className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-6" />
                <h1 className="text-2xl font-bold mb-4">Artifact not found</h1>
                <p className="text-slate-500 mb-8 max-w-md">The artifact you are looking for doesn't exist or has been removed.</p>
                <button onClick={() => router.push('/artifacts')} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-all">
                    Back to Artifacts
                </button>
            </div>
        );
    }

    const { 
        title, description, coverImage, previewFile, css, html, code, user, craftsman
    } = artifact;

    const author = user || craftsman;
    const coverMedia = previewFile || coverImage;
    const canonicalUrl = `${BASE_URL}/artifacts/${id}`;

    return (
        <div className="w-full">

            {/* JSON-LD Structured Data — SoftwareApplication + Breadcrumb */}
            <JsonLd data={buildSoftwareSchema({
                title: artifact.seoTitle || artifact.title,
                description: artifact.seoDescription || description?.replace(/<[^>]+>/g, '').substring(0, 150),
                author: author?.name,
                category: artifact.category,
                price: artifact.priceType === 'free' ? 0 : artifact.price,
                url: canonicalUrl,
                image: coverMedia,
                rating: artifact.averageRating,
                ratingCount: artifact.ratingCount
            })} />
            <JsonLd data={buildBreadcrumbSchema([
                { name: 'Home', url: BASE_URL },
                { name: 'Artifacts', url: `${BASE_URL}/artifacts` },
                { name: artifact.title, url: canonicalUrl }
            ])} />
            
            {/* Top Navigation */}
            <nav className="mb-2">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to feed
                </button>
            </nav>

            {/* Header Area */}
            <header className="mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-3xl font-medium tracking-tight mb-2 leading-[1.2] text-slate-900 dark:text-white font-sans">
                    {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
                </div>
            </header>

            {/* Immersive Media */}
            <div className="mb-12">
                <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#111] shadow-2xl">
                    {coverMedia ? (
                        <Image 
                            src={coverMedia} 
                            alt={title} 
                            fill 
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                              <iframe 
                                srcDoc={`<html><style>${css || ''} body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;}</style><body>${html || code || '<h1>Preview</h1>'}</body></html>`}
                                className="w-full h-full bg-white border-none"
                                title="Preview"
                              />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Content */}
                <div className="lg:col-span-8">
                    <article className="prose dark:prose-invert max-w-none mb-24">
                        <div 
                            className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black"
                            dangerouslySetInnerHTML={{ __html: description }}
                        />
                    </article>

                    {/* Discussion Section */}
                    <section id="comments" className="pt-12 border-t border-slate-100 dark:border-white/5 scroll-mt-24">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-slate-900 dark:text-white font-sans">
                            <MessageCircle size={18} />
                            Artifact Discussion
                        </h2>
                        <AdvancedCommentSection postId={id} />
                    </section>
                </div>

                {/* Right Column: Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Owner Controls */}
                    {(authUser?._id === author?._id || authUser?.role === "admin") && (
                        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={80} />
                            </div>
                            <h3 className="text-[10px] font-mono font-medium uppercase tracking-[0.15em] text-indigo-500 mb-6 flex items-center gap-2">
                                <Shield size={14} />
                                Owner Controls
                            </h3>
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                <button 
                                    onClick={() => router.push(`/upload-artifact?mode=edit&id=${id}`)}
                                    className="flex flex-col items-center justify-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl hover:border-slate-900 dark:hover:border-white transition-all group/btn"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover/btn:scale-110 transition-opacity">
                                        <Edit3 size={18} className="text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <span className="text-[9px] font-mono font-medium uppercase tracking-wider text-slate-500 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white transition-colors">Edit Content</span>
                                </button>
                                <button 
                                    onClick={() => router.push(`/upload-artifact?mode=upgrade&id=${id}`)}
                                    className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-900 dark:bg-white border border-slate-900 dark:border-white rounded-xl hover:shadow-xl hover:shadow-indigo-500/20 transition-all group/btn"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-slate-900/10 flex items-center justify-center group-hover/btn:scale-110 transition-opacity">
                                        <ArrowUpCircle size={18} className="text-white dark:text-slate-900" />
                                    </div>
                                    <span className="text-[9px] font-mono font-medium uppercase tracking-wider text-white dark:text-slate-900">Upgrade Ver</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Author Card */}
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-6">
                        <h3 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400 mb-4">Craftsman</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-100 dark:border-white/10">
                                {author?.profilePicture ? (
                                    <Image src={author.profilePicture} alt={author.name} width={48} height={48} className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white font-bold uppercase">
                                        {author?.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-slate-900 dark:text-white leading-tight font-sans">{author?.name}</h4>
                                <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-tight">@{author?.username}</p>
                            </div>
                        </div>
                        <button 
                           onClick={() => router.push(`/u/${author?.username}`)}
                           className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-[10px] font-mono font-medium uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            View Profile
                        </button>
                    </div>

                    {/* Artifact Links */}
                    {(artifact.liveLink || artifact.githubLink) && (
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400 mb-6">Resources &amp; Links</h3>
                            <div className="space-y-3">
                                {artifact.liveLink && (
                                    <a href={artifact.liveLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <ExternalLink size={16} />
                                            </div>
                                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live Preview</span>
                                        </div>
                                        <ChevronRight size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-opacity" />
                                    </a>
                                )}
                                {artifact.githubLink && (
                                    <a href={artifact.githubLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-xl transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                                <Github size={16} />
                                            </div>
                                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Source Code</span>
                                        </div>
                                        <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 transition-opacity" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Artifact Metadata */}
                    <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl p-6">
                        <h3 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400 mb-6">Artifact Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Tag size={14} />
                                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider">Category</span>
                                </div>
                                <span className="text-[10px] font-mono font-medium text-slate-900 dark:text-white uppercase tracking-tight">{artifact.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider">Published</span>
                                </div>
                                <span className="text-[10px] font-mono font-medium text-slate-900 dark:text-white">{new Date(artifact.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Eye size={14} />
                                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider">Views</span>
                                </div>
                                <span className="text-[10px] font-mono font-medium text-slate-900 dark:text-white">{artifact.viewsCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
