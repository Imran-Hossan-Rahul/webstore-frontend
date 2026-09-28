"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { X, Search, MapPin, Star, MessageCircle, UserPlus, Filter, TrendingUp, Award, Zap, CheckCircle } from "lucide-react";

export default function CraftsmanDiscovery({ isOpen, onClose }) {
  const [craftsmen, setCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("popular"); // popular, recent, devlogs

  useEffect(() => {
    if (isOpen) {
      fetchCraftsmen();
    }
  }, [isOpen, selectedSkill]);

  const fetchCraftsmen = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/featured-craftsmen?limit=100");
      if (res.success) {
        setCraftsmen(res.data);
      }
    } catch (err) {
      console.error(err);
      setCraftsmen([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCraftsmen = craftsmen.filter(craftsman => {
    if (!searchTerm && selectedSkill === "all") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      craftsman.name?.toLowerCase().includes(searchLower) ||
      craftsman.bio?.toLowerCase().includes(searchLower) ||
      craftsman.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      craftsman.location?.toLowerCase().includes(searchLower);
    
    const matchesSkill = selectedSkill === "all" || 
      craftsman.skills?.some(skill => skill.toLowerCase() === selectedSkill.toLowerCase());
    
    return matchesSearch && matchesSkill;
  });

  const allSkills = [...new Set(craftsmen.flatMap(c => c.skills || []))].sort();
  
  const suggestedCraftsmen = craftsmen
    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
    .slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface dark:bg-brand-dark rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-sm border border-white/10">
        {/* Header */}
        <div className="relative p-8 border-b border-brand-navy/[0.08] dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Discover Craftsmen
              </h2>
              <p className="text-brand-slate dark:text-slate-400">
                Find talented craftsmen to collaborate with
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="relative mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-brand-surface dark:bg-black/40 border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="px-6 py-4 bg-brand-surface dark:bg-black/40 border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-4 bg-brand-surface dark:bg-black/40 border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Joined</option>
                <option value="devlogs">Most Devlogs</option>
              </select>
            </div>
            
            {/* Results Count & Quick Filters */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-brand-slate dark:text-slate-400">
                {filteredCraftsmen.length} craftsman{filteredCraftsmen.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex items-center gap-2">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
            
            {/* Suggested Skills */}
            {!searchTerm && allSkills.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">Popular skills:</span>
                {allSkills.slice(0, 8).map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSelectedSkill(skill)}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-320px)]">
          {loading ? (
            <LoadingGrid />
          ) : filteredCraftsmen.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCraftsmen
                .sort((a, b) => {
                  if (sortBy === "devlogs") return (b.postCount || 0) - (a.postCount || 0);
                  if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
                  return (b.postCount || 0) - (a.postCount || 0); // default popular
                })
                .map((craftsman) => (
                  <CraftsmanCard key={craftsman._id} craftsman={craftsman} />
                ))}
            </div>
          ) : (
            <EmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm("")} />
          )}
        </div>
      </div>
    </div>
  );
}

const CraftsmanCard = ({ craftsman }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await api.post(`/user/follow/${craftsman._id}`);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    window.dispatchEvent(new CustomEvent('openChat', { 
      detail: { userId: craftsman._id, userName: craftsman.name } 
    }));
  };

  return (
    <div className="group relative bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl p-6 hover:shadow-sm hover:opacity-80 transition-all duration-300">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-300" />
      
      <div className="relative">
        {/* Avatar & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-brand-surface dark:bg-black flex items-center justify-center overflow-hidden">
                {craftsman.avatar ? (
                  <img src={getOptimizedUrl(craftsman.avatar)} alt={craftsman.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">
                    {craftsman.name?.[0]}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white dark:border-black">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Star className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-current" />
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Top Craftsman
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {craftsman.name}
          </h3>
          <p className="text-sm text-brand-slate dark:text-slate-400 line-clamp-2 mb-3">
            {craftsman.bio || "Creative professional"}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <div className="flex items-center gap-1">
               {/* Icon removed */}
              <span>{craftsman.postCount || 0} devlogs</span>
            </div>
            {craftsman.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{craftsman.location}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {craftsman.skills && craftsman.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {craftsman.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-100 dark:bg-brand-surface/5 text-brand-slate dark:text-slate-300 text-xs rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
              {craftsman.skills.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-brand-surface/5 text-slate-500 dark:text-slate-400 text-xs rounded-lg">
                  +{craftsman.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleConnect}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isFollowing
                ? "bg-slate-100 dark:bg-brand-surface/10 text-brand-slate dark:text-slate-300"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-sm hover:shadow-purple-500/30"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "..." : isFollowing ? "Following" : "Connect"}
          </button>
          <button 
            onClick={handleMessage}
            className="p-2.5 bg-slate-100 dark:bg-brand-surface/10 hover:bg-slate-200 dark:bg-brand-surface/[0.1] dark:hover:bg-brand-surface/20 rounded-xl transition-all"
            title="Send message"
          >
            <MessageCircle className="w-4 h-4 text-brand-slate dark:text-slate-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-brand-surface dark:bg-black/40 backdrop-blur-xl border border-brand-navy/[0.08] dark:border-white/10 rounded-2xl p-6 animate-pulse"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-slate-200 dark:bg-brand-surface rounded-2xl" />
          <div className="w-20 h-6 bg-slate-200 dark:bg-brand-surface rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-slate-200 dark:bg-brand-surface rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-brand-surface rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-brand-surface rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 dark:bg-brand-surface rounded w-16" />
            <div className="h-6 bg-slate-200 dark:bg-brand-surface rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ searchTerm, onClearSearch }) => (
  <div className="text-center py-20">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
      <Search className="w-10 h-10 text-slate-400" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
      No craftsmen found
    </h3>
    <p className="text-brand-slate dark:text-slate-400 mb-6">
      {searchTerm
        ? `No results for "${searchTerm}". Try different keywords.`
        : "No craftsmen available at the moment."}
    </p>
    {searchTerm && (
      <button
        onClick={onClearSearch}
        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
      >
        Clear Search
      </button>
    )}
  </div>
);


