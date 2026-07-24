"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Link as LinkIcon, BookOpen, Layers, Github, Eye, Code2, Users, UserCheck, Zap, Star } from "lucide-react";
import { api } from '@/utils/api';

const CraftsmanProfileModal = ({ isOpen, onClose, userId }) => {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullCraftsman, setIsFullCraftsman] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followLoading, setFollowLoading] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = '';
            };
        }
    }, [isOpen]);

    // Fetch craftsman profile on open
    useEffect(() => {
        if (!isOpen || !userId) return;

        setProfile(null);
        setError(null);

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/craftsman/${userId}`);
                if (res.success && res.data) {
                    setProfile(res.data);
                    setIsFullCraftsman(res.isFullCraftsman || false);
                    setIsFollowing(res.isFollowing || false);
                    setFollowerCount(res.followerCount || 0);
                } else {
                    setError('Could not load this profile.');
                }
            } catch (err) {
                console.error('Fetch craftsman profile error:', err);
                setError('Could not load this profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isOpen, userId]);

    const handleFollow = async (e) => {
        e?.stopPropagation();
        e?.preventDefault();
        if (followLoading) return;
        setFollowLoading(true);
        try {
            const res = await api.post(`/craftsman/${userId}/follow`);
            if (res.success) {
                setIsFollowing(res.isFollowing);
                setFollowerCount(res.followerCount);
            }
        } catch (err) {
            console.error('Follow error:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleViewCodex = (e) => {
        e?.stopPropagation();
        e?.preventDefault();
        onClose();
        router.push(`/codex?author=${userId}`);
    };

    if (!isOpen) return null;

    const coverGradient = isFullCraftsman && profile?.level === 'pro'
        ? 'from-purple-600 to-indigo-600'
        : 'from-emerald-500 to-teal-600';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClose();
                }}
            />

            {/* Modal */}
            <div 
                className="relative w-full max-w-2xl bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
            >
                {/* Close */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onClose();
                    }}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Loading */}
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center min-h-[420px]">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium animate-pulse">Loading profile...</p>
                    </div>

                /* Error */
                ) : error || !profile ? (
                    <div className="p-12 flex flex-col items-center text-center min-h-[420px] justify-center">
                        <User size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Unavailable</h3>
                        <p className="text-slate-500 max-w-sm mb-6">{error.message || error}</p>
                        <button onClick={onClose} className="px-6 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-full font-medium transition-colors">
                            Close
                        </button>
                    </div>

                /* Profile */
                ) : (
                    <div className="flex flex-col max-h-[90vh] overflow-y-auto">
                        {/* Cover */}
                        <div className="relative h-44 md:h-52 w-full shrink-0">
                            {profile.coverPicture ? (
                                <img src={getOptimizedUrl(profile.coverPicture)} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${coverGradient}`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            {/* Badges — only for full craftsman accounts */}
                            {isFullCraftsman && (
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {profile.level && (
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                                            {profile.level}
                                        </span>
                                    )}
                                    {profile.workType && (
                                        <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-gray-200 text-xs font-bold uppercase tracking-wider rounded-full">
                                            {profile.workType}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="px-6 md:px-8 pb-8 -mt-14 md:-mt-16 relative z-10">

                            {/* Avatar row */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                                {/* Avatar */}
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-[#0f0f0f] bg-white dark:bg-slate-800 overflow-hidden shadow-xl shrink-0">
                                    {(profile.profilePicture || profile.userId?.profilePicture) ? (
                                        <img
                                            src={profile.profilePicture || profile.userId?.profilePicture}
                                            alt={profile.displayName || 'Craftsman'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-4xl font-bold">
                                            {(profile.displayName || 'C')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 sm:mt-14">
                                    {/* Follow button */}
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm ${
                                            isFollowing
                                                ? 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200'
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                                        } ${followLoading ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isFollowing ? <UserCheck size={16} /> : <Users size={16} />}
                                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                                    </button>

                                    {/* View Codex button (the "code" button repurposed) */}
                                    {profile.totalCodex > 0 && (
                                        <button
                                            onClick={handleViewCodex}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors"
                                            title="View all codex by this craftsman"
                                        >
                                            <BookOpen size={16} />
                                            Codex
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name & Bio */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                        {profile.displayName}
                                    </h2>
                                    {profile.isVerified && (
                                        <span className="text-indigo-600 bg-indigo-600/10 p-0.5 rounded-full" title="Verified">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm font-medium mt-0.5">
                                    @{(profile.userId?.name || profile.displayName || '').replace(/\s+/g, '').toLowerCase()}
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        <span className="font-bold text-slate-800 dark:text-gray-100">{followerCount}</span> follower{followerCount !== 1 ? 's' : ''}
                                    </p>
                                    {profile.rating?.count > 0 && (
                                        <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                            <Zap size={14} fill="currentColor" />
                                            <span>{profile.rating.average.toFixed(1)}</span>
                                            <span className="text-slate-400 font-medium">({profile.rating.count})</span>
                                        </div>
                                    )}
                                </div>
                                {profile.bio && (
                                    <p className="mt-3 text-slate-700 dark:text-gray-300 leading-relaxed text-sm md:text-base max-w-xl">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Stats — fetched from real DB aggregation */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Eye size={18} className="text-emerald-500 mb-1.5" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{(profile.totalViews || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">Views</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Star size={18} className="text-pink-500 mb-1.5" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{(profile.totalLikes || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">Stars</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <BookOpen size={18} className="text-indigo-600 mb-1.5" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{(profile.totalCodex || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">Codex</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Layers size={18} className="text-purple-500 mb-1.5" />
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">{(profile.totalArtifacts || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">Artifacts</span>
                                </div>
                            </div>

                            {/* Skills & Links */}
                            {((profile.skills && profile.skills.length > 0) || profile.socialLinks?.github || profile.socialLinks?.website) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Skills */}
                                    {profile.skills && profile.skills.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/5">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    {(profile.socialLinks?.github || profile.socialLinks?.website) && (
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">On The Web</h3>
                                            <div className="flex flex-col gap-2">
                                                {profile.socialLinks?.github && (
                                                    <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                                                            <Github size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium">github.com/{profile.socialLinks.github}</span>
                                                    </a>
                                                )}
                                                {profile.socialLinks?.website && (
                                                    <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors group">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                                                            <LinkIcon size={14} className="group-hover:text-emerald-500" />
                                                        </div>
                                                        <span className="text-sm font-medium truncate">{profile.socialLinks.website.replace(/^https?:\/\//, '')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Section */}
                            {profile.latestReviews?.length > 0 && (
                                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        Recent Feedback <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    </h3>
                                    <div className="space-y-4">
                                        {profile.latestReviews.map((review, i) => (
                                            <div key={i} className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                                            {review.reviewerId?.profilePicture ? (
                                                                <img src={getOptimizedUrl(review.reviewerId.profilePicture)} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                                    {review.reviewerId?.name?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{review.reviewerId?.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">patron</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-0.5 text-amber-500">
                                                        {[...Array(5)].map((_, idx) => (
                                                            <Zap 
                                                                key={idx} 
                                                                size={10} 
                                                                fill={idx < review.rating ? "currentColor" : "none"} 
                                                                className={idx < review.rating ? "" : "text-slate-200 dark:text-white/5"}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                    "{review.comment}"
                                                </p>
                                                <p className="text-[9px] text-slate-300 dark:text-slate-500 font-bold uppercase tracking-tighter mt-3">
                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CraftsmanProfileModal;



