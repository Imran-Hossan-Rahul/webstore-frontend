"use client";
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, MapPin, Calendar, Share2, MessageSquare, Users, UserCheck, Verified, Globe, ExternalLink, ChevronRight, Bookmark, Camera, Edit2, LogOut, Settings as SettingsIcon, LayoutGrid, Info, Clock, ArrowLeft, Shield, Link as LinkIcon, CreditCard, Plus, X, Check, Mail, Lock, Building, Github, Linkedin, Twitter, Trophy, Layers, Zap, Palette, Code, FileText, CheckCircle, Chrome, // For Google Badge
  ShieldCheck } from "lucide-react";
import { api } from '@/utils/api';
import { DashboardContext } from '@/app/(dashboard)/layout';
import { useToast } from '@/components/ui/ToastProvider';
import { formatDistanceToNow } from "date-fns";
import dynamic from 'next/dynamic';
import AppleSpinner from "@/components/ui/AppleSpinner";

const ImageUploadModal = dynamic(() => import('../DashboardComponents/ImageUploadModal'), { ssr: false });
const CraftsmanAccountModal = dynamic(() => import('../DashboardComponents/CraftsmanAccountModal'), { ssr: false });
const BecomePatronModal = dynamic(() => import('../DashboardComponents/BecomePatronModal'), { ssr: false });
const ClassicExploreCard = dynamic(() => import('../dashboard/cards/ClassicExploreCard'), { ssr: false });

const ActivityIcon = ({ type }) => {
  const iconProps = { className: "w-5 h-5" };
  switch (type) {
    case "working_on_devlog": return <Palette {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "sharing_task": return <CheckCircle {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "solving_problem": return <Code {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "joined_collaboration": return <Users {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "completed_task": return <CheckCircle {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "started_chatting": return <MessageSquare {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "created_post": return <FileText {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    case "updated_profile": return <UserCheck {...iconProps} className="text-slate-400 dark:text-slate-500 dark:text-slate-400" />;
    default: return <Zap {...iconProps} className="text-slate-500 dark:text-slate-400" />;
  }
};

const getActivityText = (activity) => {
  switch (activity.type) {
    case "working_on_devlog": return `is working on "${activity.title}"`;
    case "sharing_task": return `shared a task: "${activity.title}"`;
    case "solving_problem": return `is solving: "${activity.title}"`;
    case "joined_collaboration": return `joined collaboration room "${activity.title}"`;
    case "completed_task": return `completed task: "${activity.title}"`;
    case "started_chatting": return `started a conversation`;
    case "created_post": return `created a new post: "${activity.title}"`;
    case "updated_profile": return `updated their profile`;
    default: return activity.title;
  }
};

const PublicProfile = ({ username }) => {
  const router = useRouter();
  const { user: currentUser, openChatWithUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Owner States
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState("profile");
  const [showCraftsmanModal, setShowCraftsmanModal] = useState(false);
  const [showPatronModal, setShowPatronModal] = useState(false);
  const [activeTab, setActiveTab] = useState("creations");
  const [editingField, setEditingField] = useState(null); // { section: '', field: '', value: '' }
  const [isSaving, setIsSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | available | taken

  // Creations States
  const [devlogs, setDevlogs] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [codex, setCodex] = useState([]);
  // Activity States
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [creationsLoading, setCreationsLoading] = useState(false);
  const [creationsTab, setCreationsTab] = useState("devlogs"); // devlogs, artifacts, codex
  const [githubRepos, setGithubRepos] = useState([]);
  const [githubLoading, setGithubLoading] = useState(false);
  
  // Public Favorites (Highlights & Folders)
  const [publicFavorites, setPublicFavorites] = useState({ folders: [], notes: [] });
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const isOwner = currentUser?.username === username || (profile && currentUser?._id === profile._id);

  const fetchActivities = async (userId) => {
    try {
      setActivitiesLoading(true);
      const res = await api.get(`/community/activities?userId=${userId}`);
      if (res.success) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If viewing own profile, use the private endpoint to get full info (balance, etc.)
        const isOwnProfile = currentUser?.username === username;
        const endpoint = isOwnProfile ? "/user/profile" : `/user/profile/${username}`;
        
        const res = await api.get(endpoint);
        if (res.success) {
          setProfile(res.data);
          setFollowerCount(res.data.followersCount || 0);
          setEditBio(res.data.bio || "");
          setEditSkills(res.data.skills?.join(", ") || "");
          
          // Fetch activity feed for this user
          fetchActivities(res.data._id);
          
          // Check if following if logged in
          if (currentUser && currentUser._id !== res.data._id) {
             const followRes = await api.get(`/user/follow-status/${res.data._id}`);
             if (followRes.success) {
                 setIsFollowing(followRes.isFollowing);
             }
          }
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  useEffect(() => {
    const fetchCreations = async () => {
      if (!profile?._id) return;
      setCreationsLoading(true);
      
      try {
        // Use Promise.allSettled to ensure one failure doesn't block the others
        const results = await Promise.allSettled([
          api.get(`/posts?userId=${profile._id}&type=devlog&limit=20`),
          api.get(`/artifact?userId=${profile._id}&limit=20`), // Fixed endpoint: was /button-artifacts
          api.get(`/codex?author=${profile._id}&limit=20`)     // Fixed endpoint: was /codex
        ]);

        // Process Devlogs
        if (results[0].status === 'fulfilled') {
          const res = results[0].value;
          if (res.success) setDevlogs(res.data || []);
        } else {
          console.error("Devlogs Fetch Error:", results[0].reason);
        }

        // Process Artifacts
        if (results[1].status === 'fulfilled') {
          const res = results[1].value;
          if (res.success) setArtifacts(res.data || []);
        } else {
          console.error("Artifacts Fetch Error:", results[1].reason);
        }

        // Process Codex
        if (results[2].status === 'fulfilled') {
          const res = results[2].value;
          if (res.success) setCodex(res.codex || []); // Backend returns { codex: [...] }
        } else {
          console.error("Codex Fetch Error:", results[2].reason);
        }
        
      } catch (err) {
        console.error('Fetch creations overall error:', err);
      } finally {
        setCreationsLoading(false);
      }
    };

    if (profile?._id) {
      fetchCreations();
      
      // Fetch GitHub Repos if connected
      if (profile.connectedAccounts?.github?.connected && profile.connectedAccounts.github.username) {
        const fetchGithub = async () => {
          setGithubLoading(true);
          try {
            const res = await api.get(`/oauth/github/repos/${profile.connectedAccounts.github.username}`);
            if (res.success) setGithubRepos(res.data);
          } catch (err) { console.error("GH fetch error:", err); }
          finally { setGithubLoading(false); }
        };
        fetchGithub();
      }

      // Fetch Public Favorites
      const fetchPublicFavorites = async () => {
        setFavoritesLoading(true);
        try {
          const res = await api.get(`/favorites/user/${profile.username}/public`);
          if (res.success) {
            setPublicFavorites(res.data);
          }
        } catch (err) {
          console.error("Fetch public favorites error:", err);
        } finally {
          setFavoritesLoading(false);
        }
      };
      fetchPublicFavorites();
    }
  }, [profile?._id]);

  // Debounced username availability check for PublicProfile
  useEffect(() => {
    if (editingField?.field !== "username" || !editingField.value || editingField.value === profile?.username) {
      setUsernameStatus("idle");
      return;
    }
    
    if (editingField.value.length < 3) {
      setUsernameStatus("idle");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/user/check-username?username=${editingField.value}`);
        setUsernameStatus(res.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [editingField?.value, editingField?.field, profile?.username]);

  const handleFollow = async () => {
    if (!currentUser) {
      showToast('Please login to follow users', 'info');
      return;
    }
    if (followLoading) return;
    
    setFollowLoading(true);
    try {
      const res = await api.post(`/user/follow/${profile._id}`);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowerCount(prev => res.isFollowing ? prev + 1 : prev - 1);
        showToast(res.isFollowing ? `Following ${profile.name}` : `Unfollowed ${profile.name}`, 'success');
      }
    } catch (err) {
      console.error('Follow error:', err);
      showToast('Failed to update follow status', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied to clipboard', 'success');
  };

  const handleSaveProfile = async () => {
      try {
          const skillsArray = editSkills.split(",").map(s => s.trim()).filter(s => s);
          const res = await api.patch("/user/profile", { 
            bio: editBio,
            skills: skillsArray 
          });
          if (res.success) {
              setProfile(prev => ({ ...prev, bio: editBio, skills: skillsArray }));
              setIsEditing(false);
              showToast("Profile updated successfully", "success");
          }
      } catch(err) {
          console.error(err);
          showToast("Failed to update profile", "error");
      }
  };

  const validateUrl = (url) => {
    if (!url) return true;
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return regex.test(url);
  };

  const handleUpdateField = async (section, field, value) => {
    // Basic Validation
    if (field === 'name' && !value) {
        showToast("Name is required", "error");
        return;
    }

    if (['portfolio', 'github', 'linkedin', 'twitter'].includes(field)) {
        if (value && !validateUrl(value)) {
            showToast(`Invalid ${field} URL`, "error");
            return;
        }
    }

    setIsSaving(true);
    try {
      let payload = {};
      let finalValue = value;

      // Handle specific field types
      if (['skills', 'interests'].includes(field)) {
        finalValue = typeof value === 'string' ? value.split(",").map(s => s.trim()).filter(s => s) : value;
      }

      // Build payload based on section
      if (section === 'location') {
        payload.location = { ...profile.location, [field]: finalValue };
      } else if (section === 'professionalLinks') {
        payload.professionalLinks = { ...profile.professionalLinks, [field]: finalValue };
      } else if (section === 'companyDetails') {
        payload.companyDetails = { ...profile.companyDetails, [field]: finalValue };
      } else {
        payload[field] = finalValue;
      }

      const res = await api.patch("/user/profile", payload);
      if (res.success) {
        setProfile(res.data);
        setEditingField(null);
        showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`, "success");
      }
    } catch (error) {
      console.error("Update error:", error);
      showToast("Failed to update field", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e, section, field, value) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateField(section, field, value);
    }
  };

  const handleImageUploadSuccess = (data) => {
    setProfile(prev => ({
      ...prev,
      [data.type === "profile" ? "profilePicture" : "coverPicture"]: data.url
    }));
    showToast(`${data.type === "profile" ? "Avatar" : "Cover"} updated`, "success");
  };

  const openImageUpload = (type) => {
    if (!isOwner) return;
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("hasCraftsmanAccount");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <AppleSpinner className="mb-4" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Profile</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 bg-brand-cloud dark:bg-brand-surface/5 rounded-full flex items-center justify-center mb-6">
          <User size={32} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">This account may have been removed or the link might be broken.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-2.5 bg-slate-900 text-white dark:text-black rounded-full font-bold text-sm hover:opacity-80 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  if (profile?.privacy?.isRestricted && !isOwner) {
    return (
      <div className="w-full pr-[30px] left-[15px] pt-9 pb-20 relative">
        <div className="relative h-48 md:h-72 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden mb-12">
            <div className="w-full h-full bg-brand-cloud dark:bg-brand-surface/5 flex items-center justify-center">
               <Lock size={48} className="text-slate-200 dark:text-white/10" />
            </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center -mt-24 relative z-10">
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl border-4 border-slate-50 dark:border-slate-950 bg-brand-cloud dark:bg-slate-900 overflow-hidden shadow-sm mb-6">
            {profile.profilePicture ? (
              <img src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover grayscale opacity-50" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-brand-surface text-slate-400 text-4xl font-bold uppercase">
                {profile.name[0]}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-medium text-slate-900 dark:text-white mb-2 font-sans">{profile.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium uppercase tracking-[0.2em] mb-8">@{profile.username}</p>
          
          <div className="max-w-md p-8 border border-slate-100 dark:border-white/5 rounded-3xl bg-brand-surface/50 dark:bg-brand-surface/[0.02] backdrop-blur-sm">
             <div className="w-12 h-12 bg-slate-100 dark:bg-brand-surface/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={20} className="text-slate-400" />
             </div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">This Profile is Private</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
               {profile.privacy?.visibility === 'connections' 
                 ? "You need to be a connection to view this profile's full details and creations."
                 : "This user has set their profile to private. Only they can see their content."}
             </p>
             {!currentUser && (
               <button onClick={() => router.push('/auth/login')} className="mt-6 px-6 py-2 bg-slate-900 text-white dark:bg-brand-surface dark:text-black rounded-full font-bold text-[10px] uppercase tracking-widest">
                  Login to Connect
               </button>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pr-[30px] left-[15px] pt-9 pb-20 relative">
      {/* Header Navigation (Mobile) */}
      <div className="flex items-center gap-4 px-4 py-3 sticky top-0 bg-brand-surface/80 dark:bg-slate-900/80 backdrop-blur-md z-40 lg:hidden border-b border-slate-100 dark:border-white/5">
         <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/5 rounded-full transition-colors">
            <ArrowLeft size={20} />
         </button>
         <div>
            <h2 className="font-medium text-sm leading-tight text-slate-900 dark:text-white font-sans">{profile.name}</h2>
            <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-tight">{followerCount} Followers</p>
         </div>
      </div>

      {/* Profile Header Card */}
      <div className="relative group/profile">
        {/* Cover Section */}
        <div className="relative h-48 md:h-72 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-2xl">
          {profile.coverPicture ? (
            <img src={getOptimizedUrl(profile.coverPicture)} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-cloud dark:bg-brand-surface/5" />
          )}
          
          {isOwner && (
            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/profile:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <button 
                  onClick={() => openImageUpload("cover")}
                  className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-brand-surface/20 backdrop-blur-md border border-white/30 text-white rounded-lg text-[10px] font-mono font-medium uppercase tracking-[0.2em] hover:bg-brand-surface/30 transition-all shadow-sm"
                >
                  <Camera size={14} />
                  Change Cover
                </button>
            </div>
          )}

        </div>

        {/* Profile Info Section */}
        <div className="px-0 relative">
          <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-4">
            {/* Avatar */}
            <div className="relative group/avatar">
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl border-4 border-slate-50 dark:border-slate-950 bg-brand-cloud dark:bg-slate-900 overflow-hidden shadow-sm relative">
                {profile.profilePicture ? (
                  <img src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-brand-surface text-slate-400 text-4xl font-bold uppercase">
                    {profile.name[0]}
                  </div>
                )}
                
                {isOwner && (
                  <button 
                    onClick={() => openImageUpload("profile")}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pb-2">
              {isOwner ? (
                <>
                  {profile?.hasCraftsmanAccount && (
                    <button 
                      onClick={() => router.push('/user/craftsman')}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-brand-surface dark:text-black rounded-lg font-mono font-medium text-[10px] uppercase tracking-[0.15em] hover:opacity-90 transition-all border border-slate-900 dark:border-white"
                    >
                      <UserCheck size={14} />
                      Craftsman Dashboard
                    </button>
                  )}
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-brand-surface text-brand-slate dark:text-slate-300 rounded-lg font-mono font-medium text-[10px] uppercase tracking-[0.15em] hover:bg-slate-200 dark:bg-brand-surface/[0.1] dark:hover:bg-slate-700 transition-all border border-brand-navy/[0.08] dark:border-slate-700"
                  >
                    <LayoutGrid size={14} />
                    Platform Dashboard
                  </button>
                  <button 
                    onClick={handleLogout}
                    className={`flex items-center gap-2 p-2.5 rounded-full transition-all border border-transparent ${
                      confirmLogout 
                        ? 'bg-red-500 text-white hover:bg-red-600 px-4 shadow-sm shadow-red-500/20' 
                        : 'text-red-500 hover:bg-red-500/10 hover:border-red-500/20'
                    }`}
                  >
                    <LogOut size={18} />
                    {confirmLogout && <span className="text-[10px] font-mono font-medium uppercase tracking-wider whitespace-nowrap">Confirm?</span>}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-8 py-2.5 rounded-lg font-mono font-medium text-[10px] uppercase tracking-[0.2em] transition-all ${
                      isFollowing
                        ? 'border border-brand-navy/[0.08] dark:border-white/10 text-slate-900 dark:text-white hover:bg-brand-cloud'
                        : 'bg-slate-900 text-white dark:bg-brand-surface dark:text-black'
                    }`}
                  >
                    {followLoading ? (
                      <AppleSpinner size={16} className="mx-auto" />
                    ) : isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={() => {
                      if (!currentUser) return showToast('Please login to message', 'info');
                      openChatWithUser?.(profile._id);
                    }}
                    className="p-2.5 border border-brand-navy/[0.08] dark:border-white/10 rounded-full hover:bg-brand-cloud dark:hover:bg-brand-surface/5 transition-all"
                  >
                    <MessageSquare size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-900 dark:text-white font-sans">{profile.name}</h1>
                {profile.pronouns && <span className="text-slate-400 text-[10px] font-mono font-medium tracking-tight uppercase">({profile.pronouns})</span>}
                {profile.isVerified && <Verified size={20} className="text-slate-900 dark:text-white" />}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-mono font-medium uppercase tracking-[0.2em]">@{profile.username}</p>
            </div>

            <p className="text-brand-slate dark:text-slate-300 text-base leading-relaxed max-w-2xl whitespace-pre-wrap break-words font-normal font-sans">
              {profile.bio || "Crafting digital experiences and building the future."}
            </p>

            {/* Metadata Grid */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">
                {profile.location && (profile.location.city || profile.location.country) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="tracking-tight lowercase">
                      {profile.location.city}{profile.location.city && profile.location.country ? ', ' : ''}{profile.location.country}
                    </span>
                  </div>
                )}
                
                {/* Enhanced Social Links - Responsive Grid */}
                <div className="flex items-center gap-4 border-l border-slate-100 dark:border-white/5 pl-6 ml-0">
                  {profile.professionalLinks?.github && (
                    <a href={profile.professionalLinks.github.startsWith('http') ? profile.professionalLinks.github : `https://${profile.professionalLinks.github}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors" title="GitHub">
                      <Github size={16} />
                    </a>
                  )}
                  {profile.professionalLinks?.linkedin && (
                    <a href={profile.professionalLinks.linkedin.startsWith('http') ? profile.professionalLinks.linkedin : `https://${profile.professionalLinks.linkedin}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors" title="LinkedIn">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {profile.professionalLinks?.twitter && (
                    <a href={profile.professionalLinks.twitter.startsWith('http') ? profile.professionalLinks.twitter : `https://${profile.professionalLinks.twitter}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors" title="Twitter / X">
                      <Twitter size={16} />
                    </a>
                  )}
                  {profile.professionalLinks?.portfolio && (
                    <a href={profile.professionalLinks.portfolio.startsWith('http') ? profile.professionalLinks.portfolio : `https://${profile.professionalLinks.portfolio}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white transition-colors" title="Portfolio / Website">
                      <Globe size={16} />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-100 dark:border-white/5 pl-6">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="tracking-tight lowercase">Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="mt-8 px-0 border border-slate-100 dark:border-white/5 rounded-2xl sticky top-14 lg:top-16 bg-brand-surface/80 dark:bg-slate-900/80 backdrop-blur-md z-30 overflow-hidden shadow-sm">
         <div className="flex justify-center gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'creations', label: 'Creations', icon: <LayoutGrid size={16} /> },
              { id: 'highlights', label: 'Highlights', icon: <Bookmark size={16} /> },
              { id: 'about', label: 'Personal Info', icon: <User size={16} /> },
              ...(profile.connectedAccounts?.github?.connected ? [{ id: 'github', label: 'GitHub', icon: <Github size={16} /> }] : []),
              { id: 'activity', label: 'Activity', icon: <Clock size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 text-[10px] font-mono font-medium uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-brand-slate dark:text-slate-300 dark:hover:text-slate-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-brand-surface rounded-t-sm" />
                )}
              </button>
            ))}
         </div>
      </div>

      {/* Tab Content Areas */}
      <div className="px-0 py-8">
        {activeTab === 'creations' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Category Toggle */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
              {[
                { id: 'devlogs', label: 'Devlogs', count: devlogs.length },
                { id: 'artifacts', label: 'Artifacts', count: artifacts.length },
                { id: 'codex', label: 'Codex', count: codex.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCreationsTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-mono font-medium uppercase tracking-[0.2em] transition-all ${
                    creationsTab === tab.id 
                      ? 'bg-slate-900 text-white dark:bg-brand-surface dark:text-black' 
                      : 'text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white'
                  }`}
                >
                  {tab.label} <span className="opacity-40 ml-1">[{tab.count}]</span>
                </button>
              ))}
            </div>

            {creationsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AppleSpinner className="mb-4" />
                <p className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-[0.3em]">Indexing Workspace</p>
              </div>
            ) : (
              <>
                {creationsTab === 'devlogs' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {devlogs.length > 0 ? (
                      devlogs.map(devlog => (
                        <ClassicExploreCard key={devlog._id} item={{...devlog, type: 'devlog'}} gridCols={2} />
                      ))
                    ) : (
                      <EmptyCreations 
                        title="No Devlogs Launched" 
                        desc="This craftsman hasn't published any high-fidelity devlogs yet." 
                      />
                    )}
                  </div>
                )}

                {creationsTab === 'artifacts' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {artifacts.length > 0 ? (
                      artifacts.map(artifact => (
                        <ClassicExploreCard key={artifact._id} item={{...artifact, type: 'artifact'}} gridCols={2} />
                      ))
                    ) : (
                      <EmptyCreations 
                        title="No Artifacts Shared" 
                        desc="Open-source assets and premium artifacts will appear here." 
                      />
                    )}
                  </div>
                )}

                {creationsTab === 'codex' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {codex.length > 0 ? (
                      codex.map(codex => (
                        <ClassicExploreCard key={codex._id} item={{...codex, type: 'codex'}} gridCols={2} />
                      ))
                    ) : (
                      <EmptyCreations 
                        title="No Codex Published" 
                        desc="Thoughts, tutorials, and case studies haven't been written yet." 
                      />
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {activeTab === 'highlights' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {favoritesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <AppleSpinner className="animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Highlights...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Public Folders */}
                {publicFavorites.folders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Layers className="text-brand-blue" size={20} /> Public Folders
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {publicFavorites.folders.map(folder => (
                        <div key={folder._id} className="p-6 bg-brand-surface dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-brand-blue/50 transition-colors">
                           <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-xl bg-brand-cloud dark:bg-brand-surface flex items-center justify-center" style={{ color: folder.color || '#4f46e5' }}>
                               <Bookmark size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{folder.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{folder.items?.length || 0} items</p>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Standalone Notes */}
                {publicFavorites.notes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <FileText className="text-brand-amber" size={20} /> Standalone Highlights
                    </h3>
                    <div className="space-y-4">
                      {publicFavorites.notes.map(note => (
                        <div 
                          key={note._id} 
                          onClick={() => {
                            if (note.codex?.slug) {
                              router.push(`/codex/${note.codex.slug}?noteId=${note._id}`);
                            }
                          }}
                          className="p-6 bg-amber-50 dark:bg-brand-amber/5 border-l-4 border-amber-400 rounded-r-2xl cursor-pointer hover:bg-amber-100 dark:hover:bg-brand-amber/10 transition-colors"
                        >
                           <p className="text-sm font-medium italic text-brand-slate dark:text-slate-300 mb-4">
                             &quot;{note.highlightedText}&quot;
                           </p>
                           {note.noteContent && (
                             <p className="text-sm text-brand-slate dark:text-slate-400 mb-4">
                               <span className="font-bold text-slate-800 dark:text-slate-200">Note: </span>
                               {note.noteContent}
                             </p>
                           )}
                           <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><FileText size={12} /> {note.codex?.title || "Unknown Source"}</span>
                              <span>{formatDistanceToNow(new Date(note.createdAt))} ago</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {publicFavorites.folders.length === 0 && publicFavorites.notes.length === 0 && (
                  <div className="text-center py-20 opacity-50">
                    <Bookmark size={48} className="mx-auto mb-4 stroke-[1px]" />
                    <h4 className="text-lg font-bold">No Public Highlights</h4>
                    <p className="text-sm">This craftsman hasn&apos;t shared any highlights or folders publicly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'github' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
               <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white font-sans">GitHub Portfolio</h3>
                  <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.2em] mt-1">Live from @{profile.connectedAccounts?.github?.username}</p>
               </div>
               <a href={`https://github.com/${profile.connectedAccounts?.github?.username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-brand-surface/5 hover:bg-slate-200 dark:bg-brand-surface/[0.1] dark:hover:bg-brand-surface/10 rounded-lg text-[9px] font-mono font-medium uppercase tracking-[0.2em] transition-all">
                  View All Repos <ExternalLink size={14} />
               </a>
            </div>

            {githubLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-brand-cloud dark:bg-brand-surface/[0.02] rounded-2xl animate-pulse border border-slate-100 dark:border-white/5" />
                ))}
              </div>
            ) : githubRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {githubRepos.map(repo => (
                  <a 
                    key={repo.id} 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-6 bg-brand-surface dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl hover:border-brand-navy/[0.08] dark:hover:border-white/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-brand-slate dark:text-slate-300 dark:group-hover:text-white transition-colors">{repo.name}</h4>
                       {repo.language && (
                         <span className="px-2 py-0.5 bg-slate-100 dark:bg-brand-surface/10 text-slate-900 dark:text-white text-[9px] font-black uppercase rounded-md">
                           {repo.language}
                         </span>
                       )}
                    </div>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">{repo.description || "No description provided."}</p>
                    <div className="flex items-center gap-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-tighter">
                       <div className="flex items-center gap-1">
                          <Trophy size={12} className="text-brand-amber" />
                          {repo.stargazers_count}
                       </div>
                       <div className="flex items-center gap-1">
                          <Layers size={12} className="text-indigo-400" />
                          {repo.forks_count}
                       </div>
                       <div className="ml-auto opacity-50">
                          Updated {formatDistanceToNow(new Date(repo.updated_at))} ago
                       </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                 <p className="text-sm text-slate-500 dark:text-slate-400">No public repositories found.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="animate-in fade-in duration-500 pb-20">
            {isOwner && (
              <div className="flex justify-end mb-6">
                <Link 
                  href="/settings"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-brand-surface dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-80 active:opacity-60 transition-all shadow-sm shadow-slate-900/10 dark:shadow-white/10"
                >
                  <SettingsIcon size={14} />
                  Edit Profile Settings
                </Link>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              

              {/* 1. Identity & Bio Card */}
              <div className="bg-brand-surface dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-8 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-brand-surface/10 text-slate-900 dark:text-white rounded-xl flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Identity</h3>
                      <p className="text-[9px] font-bold text-slate-400 opacity-60 uppercase tracking-tighter">Public details</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Display Name', field: 'name', value: profile.name },
                    { label: 'Username', field: 'username', value: profile.username, prefix: '@' },
                    { label: 'Work Story / Bio', field: 'bio', value: profile.bio, isTextArea: true },
                    { label: 'Work Type', field: 'workType', value: profile.workType || 'solo' },
                    { label: 'Skills', field: 'skills', value: profile.skills?.join(", "), isTags: true, tags: profile.skills },
                    { label: 'Interests', field: 'interests', value: profile.interests?.join(", "), isTags: true, tags: profile.interests },
                    { label: 'Company', field: 'companyName', value: profile.companyDetails?.name },
                    { label: 'Company Website', field: 'companyWebsite', value: profile.companyDetails?.website },
                  ].map((item) => (
                    <div key={item.field} className="group/item">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">{item.label}</label>
                      <div className="flex flex-wrap gap-2">
                        {item.isTags ? (
                          item.tags?.length > 0 ? (
                            item.tags.map((tag, i) => (
                              <span key={i} className="px-3 py-1 rounded-full text-[10px] font-bold border border-slate-100 dark:border-white/10 bg-brand-cloud dark:bg-brand-surface/5 text-brand-slate dark:text-slate-300 uppercase tracking-tight">
                                {tag}
                              </span>
                            ))
                          ) : <span className="text-[11px] font-bold text-slate-300 italic">Not specified</span>
                        ) : (
                          <span className={`text-[13px] font-bold ${item.isTextArea ? 'text-brand-slate dark:text-slate-400 leading-relaxed' : 'text-slate-900 dark:text-white'}`}>
                            {item.prefix}{item.value || 'Not set'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            {/* 2. Professional & Contact Card */}
            <div className="bg-brand-surface dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-8 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-blue/10 text-brand-blue rounded-xl flex items-center justify-center">
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional</h3>
                    <p className="text-[9px] font-bold text-slate-400 opacity-60 uppercase tracking-tighter">Presence & contact</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Portfolio Website', field: 'portfolio', value: profile.professionalLinks?.portfolio, icon: <Globe size={14} /> },
                  { label: 'GitHub Profile', field: 'github', value: profile.professionalLinks?.github, icon: <Github size={14} /> },
                  { label: 'LinkedIn Profile', field: 'linkedin', value: profile.professionalLinks?.linkedin, icon: <Linkedin size={14} /> },
                  { label: 'Twitter / X', field: 'twitter', value: profile.professionalLinks?.twitter, icon: <Twitter size={14} /> },
                  { label: 'City', field: 'city', value: profile.location?.city, icon: <MapPin size={14} /> },
                  { label: 'Country', field: 'country', value: profile.location?.country, icon: <MapPin size={14} /> },
                ].map((item) => (
                  <div key={item.field} className="group/item">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                         {item.icon && <span className="text-slate-400">{item.icon}</span>}
                         {['portfolio', 'github', 'linkedin', 'twitter'].includes(item.field) && item.value ? (
                           <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noreferrer" className="text-[13px] font-bold text-brand-blue hover:underline flex items-center gap-1">
                             {item.value.replace(/^https?:\/\/(www\.)?/, '')}
                             <ExternalLink size={10} />
                           </a>
                         ) : (
                           <span className="text-[13px] font-bold text-slate-900 dark:text-white">{item.value || 'Not set'}</span>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </div>
        </div>
      )}

        {activeTab === 'activity' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {activitiesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <AppleSpinner className="animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading Activity...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="p-6 bg-brand-surface dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:shadow-sm transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-12 h-12 rounded-2xl bg-brand-cloud dark:bg-brand-surface/5 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                          <ActivityIcon type={activity.type} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {getActivityText(activity)}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                            {activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                           {activity.devlogId && (
                             <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-bold uppercase tracking-widest">Devlog</span>
                           )}
                           {activity.taskId && (
                             <span className="px-2.5 py-1 bg-brand-teal/10 text-brand-teal rounded-lg text-[9px] font-bold uppercase tracking-widest">Task</span>
                           )}
                           {activity.roomId && (
                             <span className="px-2.5 py-1 bg-brand-amber/10 text-brand-amber rounded-lg text-[9px] font-bold uppercase tracking-widest">Collab</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Clock size={48} className="mb-4 stroke-[1px]" />
                <h4 className="text-lg font-bold">Activity Feed</h4>
                <p className="text-sm">No recent activity found for this user.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUploadSuccess={handleImageUploadSuccess}
        type={imageUploadType}
        uploadEndpoint={
          profile?.hasCraftsmanAccount 
            ? (imageUploadType === "profile" ? "/upload/craftsman/profile-picture" : "/upload/craftsman/cover-picture")
            : (imageUploadType === "profile" ? "/upload/user/profile-picture" : "/upload/user/cover-picture")
        }
        title={imageUploadType === "profile" ? "Upload Profile Picture" : "Upload Cover Picture"}
      />

      <CraftsmanAccountModal isOpen={showCraftsmanModal} onClose={() => setShowCraftsmanModal(false)} />
      <BecomePatronModal isOpen={showPatronModal} onClose={() => setShowPatronModal(false)} />
    </div>
  );
};

const EmptyCreations = ({ title, desc }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center opacity-40 bg-brand-cloud/50 dark:bg-brand-surface/[0.01] border border-dashed border-brand-navy/[0.08] dark:border-white/10 rounded-3xl">
    <LayoutGrid size={32} className="mb-4 stroke-[1px]" />
    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{title}</h4>
    <p className="text-[10px] font-medium max-w-[200px]">{desc}</p>
  </div>
);

export default PublicProfile;


