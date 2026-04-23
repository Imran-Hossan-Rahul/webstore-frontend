"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Link as LinkIcon, BookOpen, Layers, Github, Eye, Heart, Code2, Users, UserCheck } from 'lucide-react';
import { api } from '@/utils/api';

const CreatorProfileModal = ({ isOpen, onClose, userId }) => {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullCreator, setIsFullCreator] = useState(false);
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

    // Fetch creator profile on open
    useEffect(() => {
        if (!isOpen || !userId) return;

        setProfile(null);
        setError(null);

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/creator/${userId}`);
                if (res.success && res.data) {
                    setProfile(res.data);
                    setIsFullCreator(res.isFullCreator || false);
                    setIsFollowing(res.isFollowing || false);
                    setFollowerCount(res.followerCount || 0);
                } else {
                    setError('Could not load this profile.');
                }
            } catch (err) {
                console.error('Fetch creator profile error:', err);
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
            const res = await api.post(`/creator/${userId}/follow`);
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

    const handleViewArticles = (e) => {
        e?.stopPropagation();
        e?.preventDefault();
        onClose();
        router.push(`/blogs?author=${userId}`);
    };

    if (!isOpen) return null;

    const coverGradient = isFullCreator && profile?.level === 'pro'
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
                className="relative w-full max-w-2xl bg-white dark:bg-[#0f0f0f] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200"
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
                        <p className="text-gray-500 font-medium animate-pulse">Loading profile...</p>
                    </div>

                /* Error */
                ) : error || !profile ? (
                    <div className="p-12 flex flex-col items-center text-center min-h-[420px] justify-center">
                        <User size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Unavailable</h3>
                        <p className="text-gray-500 max-w-sm mb-6">{error}</p>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-full font-medium transition-colors">
                            Close
                        </button>
                    </div>

                /* Profile */
                ) : (
                    <div className="flex flex-col max-h-[90vh] overflow-y-auto">
                        {/* Cover */}
                        <div className="relative h-44 md:h-52 w-full shrink-0">
                            {profile.coverPicture ? (
                                <img src={profile.coverPicture} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${coverGradient}`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            {/* Badges — only for full creator accounts */}
                            {isFullCreator && (
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
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white dark:border-[#0f0f0f] bg-white dark:bg-gray-800 overflow-hidden shadow-xl shrink-0">
                                    {(profile.profilePicture || profile.userId?.profilePicture) ? (
                                        <img
                                            src={profile.profilePicture || profile.userId?.profilePicture}
                                            alt={profile.displayName || 'Creator'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-4xl font-black">
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
                                                ? 'bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200'
                                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
                                        } ${followLoading ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isFollowing ? <UserCheck size={16} /> : <Users size={16} />}
                                        {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                                    </button>

                                    {/* View Articles button (the "code" button repurposed) */}
                                    {profile.totalBlogs > 0 && (
                                        <button
                                            onClick={handleViewArticles}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors"
                                            title="View all articles by this creator"
                                        >
                                            <BookOpen size={16} />
                                            Articles
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name & Bio */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                                        {profile.displayName}
                                    </h2>
                                    {profile.isVerified && (
                                        <span className="text-blue-500 bg-blue-500/10 p-0.5 rounded-full" title="Verified">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm font-medium mt-0.5">
                                    @{(profile.userId?.name || profile.displayName || '').replace(/\s+/g, '').toLowerCase()}
                                </p>
                                {/* Follower count */}
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{followerCount}</span> follower{followerCount !== 1 ? 's' : ''}
                                </p>
                                {profile.bio && (
                                    <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base max-w-xl">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Stats — fetched from real DB aggregation */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Eye size={18} className="text-emerald-500 mb-1.5" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{(profile.totalViews || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mt-0.5">Views</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Heart size={18} className="text-pink-500 mb-1.5" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{(profile.totalLikes || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mt-0.5">Likes</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <BookOpen size={18} className="text-blue-500 mb-1.5" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{(profile.totalBlogs || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mt-0.5">Articles</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center">
                                    <Layers size={18} className="text-purple-500 mb-1.5" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white">{(profile.totalTemplates || 0).toLocaleString()}</span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mt-0.5">Templates</span>
                                </div>
                            </div>

                            {/* Skills & Links */}
                            {((profile.skills && profile.skills.length > 0) || profile.socialLinks?.github || profile.socialLinks?.website) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Skills */}
                                    {profile.skills && profile.skills.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Core Skills</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/5">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    {(profile.socialLinks?.github || profile.socialLinks?.website) && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">On The Web</h3>
                                            <div className="flex flex-col gap-2">
                                                {profile.socialLinks?.github && (
                                                    <a href={`https://github.com/${profile.socialLinks.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
                                                            <Github size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium">github.com/{profile.socialLinks.github}</span>
                                                    </a>
                                                )}
                                                {profile.socialLinks?.website && (
                                                    <a href={profile.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-colors group">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorProfileModal;
