"use client";

import { useState, useEffect } from "react";
import { X, Camera, MapPin, Calendar, Mail, Briefcase, Edit2, CheckCircle, Eye, EyeOff, FileText, Layout, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import ImageUploadModal from "./ImageUploadModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function CreatorProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState("profile");
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCreatorProfile();
      setIsEditing(false);
    }
  }, [isOpen]);

  const fetchCreatorProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch creator profile
      const creatorRes = await api.get("/creator/profile");
      if (creatorRes.success) {
        setCreatorProfile(creatorRes.data);
        setEditBio(creatorRes.data.bio || "");
        setEditSkills(creatorRes.data.skills?.join(", ") || "");
      }

      // Fetch user data for email, etc.
      const userRes = await api.get("/user/profile");
      if (userRes.success) {
        setUser(userRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch creator profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const skillsArray = editSkills.split(",").map(s => s.trim()).filter(s => s);
      await api.patch("/creator/profile", {
        bio: editBio,
        skills: skillsArray
      });
      setCreatorProfile(prev => ({ ...prev, bio: editBio, skills: skillsArray }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile. Please try again.", "error", "Error");
    }
  };

  const handleImageUploadSuccess = (data) => {
    setCreatorProfile(prev => ({
      ...prev,
      [data.type === "profile" ? "profilePicture" : "coverPicture"]: data.url
    }));
    fetchCreatorProfile();
  };

  const openImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 z-20 transition-colors"
          >
            <X size={20} />
          </button>

          {isLoading ? (
            <div className="h-[500px] flex items-center justify-center flex-col gap-3">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading creator profile...</p>
            </div>
          ) : (
            <>
              {/* Cover Picture */}
              <div 
                onClick={() => openImageUpload("cover")}
                className="h-40 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 w-full relative cursor-pointer group"
                style={creatorProfile?.coverPicture ? { backgroundImage: `url(${creatorProfile.coverPicture})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                    <Camera size={18} className="text-white" />
                    <span className="text-white text-sm font-medium">Change Cover</span>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 -mt-16 relative">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div 
                    onClick={() => openImageUpload("profile")}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gradient-to-br from-purple-400 to-blue-500 shadow-lg cursor-pointer group relative"
                  >
                    {creatorProfile?.profilePicture ? (
                      <img src={creatorProfile.profilePicture} alt={creatorProfile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                        {creatorProfile?.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  {creatorProfile?.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1.5">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Name & Level */}
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {creatorProfile?.displayName}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      creatorProfile?.level === 'pro' ? 'bg-purple-100 text-purple-700' :
                      creatorProfile?.level === 'expert' ? 'bg-blue-100 text-blue-700' :
                      creatorProfile?.level === 'intermediate' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {creatorProfile?.level?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Creator Account</p>
                  <Link
                    href="/user/creator"
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-80 transition-opacity"
                  >
                    <LayoutDashboard size={15} />
                    Creator Dashboard
                  </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                      activeTab === "profile"
                        ? "text-black dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Profile
                    {activeTab === "profile" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                      activeTab === "overview"
                        ? "text-black dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    Overview
                    {activeTab === "overview" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white"></div>
                    )}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === "profile" ? (
                    <ProfileTab 
                      creatorProfile={creatorProfile}
                      user={user}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                      editBio={editBio}
                      setEditBio={setEditBio}
                      editSkills={editSkills}
                      setEditSkills={setEditSkills}
                      handleSaveBio={handleSaveBio}
                    />
                  ) : (
                    <OverviewTab creatorProfile={creatorProfile} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUploadSuccess={handleImageUploadSuccess}
        type={imageUploadType}
        uploadEndpoint={imageUploadType === "profile" ? "/upload/creator/profile-picture" : "/upload/creator/cover-picture"}
        title={imageUploadType === "profile" ? "Upload Profile Picture" : "Upload Cover Picture"}
      />
    </>
  );
}

function ProfileTab({ creatorProfile, user, isEditing, setIsEditing, editBio, setEditBio, editSkills, setEditSkills, handleSaveBio }) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Mail size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Briefcase size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Work Type</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{creatorProfile?.workType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <MapPin size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Earth</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <Calendar size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(creatorProfile?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Status */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            creatorProfile?.isVerified ? 'bg-blue-100' : 'bg-gray-200'
          }`}>
            <CheckCircle size={20} className={creatorProfile?.isVerified ? 'text-blue-600' : 'text-gray-400'} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Verification Status</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {creatorProfile?.isVerified ? 'Verified Creator' : 'Not Verified'}
            </p>
          </div>
        </div>
        {creatorProfile?.isVerified && (
          <span className="text-xs text-blue-600 font-medium">
            Verified on {new Date(creatorProfile?.verifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Bio Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">About</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="animate-in fade-in space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Bio</label>
              <textarea 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)} 
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-purple-500 text-sm min-h-[100px]"
                placeholder="Write a bio..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Skills (comma separated)</label>
              <input 
                type="text"
                value={editSkills} 
                onChange={(e) => setEditSkills(e.target.value)} 
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-purple-500 text-sm"
                placeholder="UI/UX, Web Dev, Design..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Cancel</button>
              <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
            {creatorProfile?.bio || "No bio yet."}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {creatorProfile?.skills && creatorProfile.skills.length > 0 ? (
            creatorProfile.skills.map(skill => (
              <span key={skill} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-sm italic">No skills added</span>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ creatorProfile }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Eye size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{creatorProfile?.totalViews || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{creatorProfile?.totalBlogs || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Blogs</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Layout size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{creatorProfile?.totalTemplates || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Templates</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">❤️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{creatorProfile?.totalLikes || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      {creatorProfile?.rating?.count > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rating</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(creatorProfile.rating.average) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {creatorProfile.rating.average.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({creatorProfile.rating.count} reviews)
            </span>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Account Status</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {creatorProfile?.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Creator Level</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{creatorProfile?.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Work Type</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">{creatorProfile?.workType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
