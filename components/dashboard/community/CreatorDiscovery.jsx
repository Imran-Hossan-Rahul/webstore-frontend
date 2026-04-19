"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import {
  X,
  Search,
  MapPin,
  Briefcase,
  Star,
  MessageCircle,
  UserPlus,
  Filter,
  TrendingUp,
  Award,
  Zap,
  CheckCircle
} from "lucide-react";

export default function CreatorDiscovery({ isOpen, onClose }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [sortBy, setSortBy] = useState("popular"); // popular, recent, projects

  useEffect(() => {
    if (isOpen) {
      fetchCreators();
    }
  }, [isOpen, selectedSkill]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/featured-creators?limit=100");
      if (res.success) {
        setCreators(res.data);
      }
    } catch (err) {
      console.error(err);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    if (!searchTerm && selectedSkill === "all") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      creator.name?.toLowerCase().includes(searchLower) ||
      creator.bio?.toLowerCase().includes(searchLower) ||
      creator.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      creator.location?.toLowerCase().includes(searchLower);
    
    const matchesSkill = selectedSkill === "all" || 
      creator.skills?.some(skill => skill.toLowerCase() === selectedSkill.toLowerCase());
    
    return matchesSearch && matchesSkill;
  });

  const allSkills = [...new Set(creators.flatMap(c => c.skills || []))].sort();
  
  const suggestedCreators = creators
    .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
    .slice(0, 6);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="relative p-8 border-b border-gray-200 dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Discover Creators
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Find talented creators to collaborate with
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="relative mt-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="px-6 py-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-4 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Joined</option>
                <option value="projects">Most Projects</option>
              </select>
            </div>
            
            {/* Results Count & Quick Filters */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
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
                <span className="text-xs text-gray-500 dark:text-gray-400">Popular skills:</span>
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
          ) : filteredCreators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators
                .sort((a, b) => {
                  if (sortBy === "projects") return (b.postCount || 0) - (a.postCount || 0);
                  if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
                  return (b.postCount || 0) - (a.postCount || 0); // default popular
                })
                .map((creator) => (
                  <CreatorCard key={creator._id} creator={creator} />
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

const CreatorCard = ({ creator }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await api.post(`/user/follow/${creator._id}`);
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    window.dispatchEvent(new CustomEvent('openChat', { 
      detail: { userId: creator._id, userName: creator.name } 
    }));
  };

  return (
    <div className="group relative bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-300" />
      
      <div className="relative">
        {/* Avatar & Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-black flex items-center justify-center overflow-hidden">
                {creator.avatar ? (
                  <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-400">
                    {creator.name?.[0]}
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
              Top Creator
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {creator.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {creator.bio || "Creative professional"}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              <span>{creator.postCount || 0} projects</span>
            </div>
            {creator.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{creator.location}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          {creator.skills && creator.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {creator.skills.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
              {creator.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs rounded-lg">
                  +{creator.skills.length - 3}
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
                ? "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "..." : isFollowing ? "Following" : "Connect"}
          </button>
          <button 
            onClick={handleMessage}
            className="p-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl transition-all"
            title="Send message"
          >
            <MessageCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
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
        className="bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 animate-pulse"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16" />
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ searchTerm, onClearSearch }) => (
  <div className="text-center py-20">
    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
      <Search className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      No creators found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6">
      {searchTerm
        ? `No results for "${searchTerm}". Try different keywords.`
        : "No creators available at the moment."}
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
