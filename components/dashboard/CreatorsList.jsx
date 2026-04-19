"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { Users, MapPin, Briefcase, Star, Eye, FileText, Layout, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function CreatorsList() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    setCreators([]);
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await api.get("/creator/profiles/all");
      setCreators(res.creators || []);
      
      // Get following status
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const followRes = await api.get("/user/following");
          const followingList = followRes.following || [];
          // Map to user IDs (handle both populated and non-populated)
          const followingUserIds = followingList.map(f => 
            typeof f === 'object' ? f._id : f
          );
          setFollowingIds(new Set(followingUserIds));
        } catch (err) {
          console.log("Following status not available");
        }
      }
    } catch (error) {
      console.error("Failed to fetch creators:", error);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (creator, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to follow creators.", "info", "Login Required");
      return;
    }
    
    // Extract actual user ID from creator object
    const targetUserId = creator.userId ? (typeof creator.userId === 'object' ? creator.userId._id : creator.userId) : null;
    
    if (!targetUserId) {
      console.error('Invalid creator userId:', creator);
      showToast("Unable to follow this creator. Invalid creator ID.", "error", "Error");
      return;
    }
    
    try {
      const res = await api.post(`/user/follow/${targetUserId}`);
      
      if (res.success) {
        setFollowingIds(prev => {
          const newSet = new Set(prev);
          if (res.action === "follow") {
            newSet.add(targetUserId);
          } else {
            newSet.delete(targetUserId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to follow:", error);
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        showToast("Please login to follow creators.", "info", "Login Required");
      } else {
        showToast(error.message || "Failed to follow creator. Please try again.", "error", "Error");
      }
    }
  };

  const handleMessage = (creator, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to send messages.", "info", "Login Required");
      return;
    }
    
    // Store creator info and trigger chat modal
    sessionStorage.setItem('openChatWith', JSON.stringify({
      _id: creator._id,
      username: creator.displayName,
      name: creator.displayName,
      profilePicture: creator.profilePicture
    }));
    
    // Dispatch custom event to open chat modal
    window.dispatchEvent(new CustomEvent('openChat', { 
      detail: { 
        userId: creator._id,
        user: creator 
      } 
    }));
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          Creators
          <span className="text-purple-600">.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 ml-[52px]">
          Discover talented creators and their amazing work
        </p>
      </div>

      <div className="space-y-4">
        {creators.map((creator) => {
          // Extract actual user ID for comparison
          const creatorUserId = creator.userId ? (typeof creator.userId === 'object' ? creator.userId._id : creator.userId) : null;
          const isFollowing = followingIds.has(creatorUserId);
          
          return (
            <div
              key={creator._id}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow overflow-hidden">
                    {creator.profilePicture ? (
                      <img src={creator.profilePicture} alt={creator.displayName} className="w-full h-full object-cover" />
                    ) : (
                      creator.displayName?.[0]?.toUpperCase() || "C"
                    )}
                  </div>
                  {creator.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {creator.displayName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {creator.workType && (
                          <span className="flex items-center gap-1">
                            <Briefcase size={14} />
                            <span className="capitalize">{creator.workType}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>Earth</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleFollow(creator, e)}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                          isFollowing
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/20"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck size={16} />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={16} />
                            Follow
                          </>
                        )}
                      </button>
                      <button 
                        onClick={(e) => handleMessage(creator, e)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        title="Send Message"
                      >
                        <MessageCircle size={18} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  {creator.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {creator.skills && creator.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {creator.skills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {creator.skills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-medium">
                          +{creator.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Layout size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{creator.totalTemplates || 0}</p>
                        <p className="text-xs">Templates</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{creator.totalBlogs || 0}</p>
                        <p className="text-xs">Blogs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Eye size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{creator.totalViews || 0}</p>
                        <p className="text-xs">Views</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {creators.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-purple-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No creators found</p>
          </div>
        )}
      </div>
    </div>
  );
}
