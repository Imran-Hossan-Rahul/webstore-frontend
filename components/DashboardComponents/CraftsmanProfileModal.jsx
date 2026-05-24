"use client";

import { useState, useEffect } from "react";
import { X, Camera, MapPin, Calendar, Mail, Edit2, CheckCircle, Eye, EyeOff, FileText, Layout, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { api } from "@/utils/api";
import ImageUploadModal from "./ImageUploadModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function CraftsmanProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [craftsmanProfile, setCraftsmanProfile] = useState(null);
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
      fetchCraftsmanProfile();
      setIsEditing(false);
    }
  }, [isOpen]);

  const fetchCraftsmanProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch craftsman profile
      const craftsmanRes = await api.get("/craftsman/profile");
      if (craftsmanRes.success) {
        setCraftsmanProfile(craftsmanRes.data);
        setEditBio(craftsmanRes.data.bio || "");
        setEditSkills(craftsmanRes.data.skills?.join(", ") || "");
      }

      // Fetch user data for email, etc.
      const userRes = await api.get("/user/profile");
      if (userRes.success) {
        setUser(userRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch craftsman profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const skillsArray = editSkills.split(",").map(s => s.trim()).filter(s => s);
      await api.patch("/craftsman/profile", {
        bio: editBio,
        skills: skillsArray
      });
      setCraftsmanProfile(prev => ({ ...prev, bio: editBio, skills: skillsArray }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile. Please try again.", "error", "Error");
    }
  };

  const handleImageUploadSuccess = (data) => {
    setCraftsmanProfile(prev => ({
      ...prev,
      [data.type === "profile" ? "profilePicture" : "coverPicture"]: data.url
    }));
    fetchCraftsmanProfile();
  };

  const openImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/20 relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-white/80 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 z-20 transition-all border border-slate-200 dark:border-white/10"
          >
            <X size={20} />
          </button>

          {isLoading ? (
            <div className="h-[500px] flex items-center justify-center flex-col gap-3">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-black rounded-full animate-spin"></div>
              <p className="text-slate-400">Loading craftsman profile...</p>
            </div>
          ) : (
            <>
              {/* Cover Picture */}
              <div 
                onClick={() => openImageUpload("cover")}
                className="h-40 bg-slate-900 dark:bg-white w-full relative cursor-pointer group"
                style={craftsmanProfile?.coverPicture ? { backgroundImage: `url(${craftsmanProfile.coverPicture})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                    <Camera size={18} className="text-white" />
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Update Identity Banner</span>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 -mt-16 relative">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div 
                    onClick={() => openImageUpload("profile")}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-900 dark:bg-white shadow-lg cursor-pointer group relative"
                  >
                    {craftsmanProfile?.profilePicture ? (
                      <img src={craftsmanProfile.profilePicture} alt={craftsmanProfile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white dark:text-black font-bold text-4xl">
                        {craftsmanProfile?.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  
                  {/* Verified Badge */}
                  {craftsmanProfile?.isVerified && (
                    <div className="absolute bottom-2 right-2 bg-indigo-600 rounded-full p-1.5">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Name & Level */}
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {craftsmanProfile?.displayName}
                    </h2>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-widest ${
                      craftsmanProfile?.level === 'pro' ? 'bg-slate-900 dark:bg-white text-white dark:text-black ring-1 ring-slate-900 dark:ring-white' :
                      craftsmanProfile?.level === 'expert' ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-black ring-1 ring-slate-800 dark:ring-slate-100' :
                      craftsmanProfile?.level === 'intermediate' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white ring-1 ring-slate-200' :
                      'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-gray-400 ring-1 ring-slate-100'
                    }`}>
                      {craftsmanProfile?.level?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Craftsman Account</p>
                  <Link
                    href="/user/craftsman"
                    className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                  >
                    <LayoutDashboard size={15} />
                    Craftsman Dashboard
                  </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 border-b border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                      activeTab === "profile"
                        ? "text-black dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-gray-300"
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
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-gray-300"
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
                      craftsmanProfile={craftsmanProfile}
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
                    <OverviewTab craftsmanProfile={craftsmanProfile} />
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
        uploadEndpoint={imageUploadType === "profile" ? "/upload/craftsman/profile-picture" : "/upload/craftsman/cover-picture"}
        title={imageUploadType === "profile" ? "Upload Profile Picture" : "Upload Cover Picture"}
      />
    </>
  );
}

function ProfileTab({ craftsmanProfile, user, isEditing, setIsEditing, editBio, setEditBio, editSkills, setEditSkills, handleSaveBio }) {
  return (
    <div className="space-y-8">
      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="p-2 bg-white dark:bg-black/50 rounded-lg shadow-sm">
            <Mail size={18} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="p-2 bg-white dark:bg-black/50 rounded-lg shadow-sm">
            {/* Icon removed */}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Work Type</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{craftsmanProfile?.workType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="p-2 bg-white dark:bg-black/50 rounded-lg shadow-sm">
            <MapPin size={18} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Location</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Earth</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm">
          <div className="p-2 bg-white dark:bg-black/50 rounded-lg shadow-sm">
            <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Joined</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {new Date(craftsmanProfile?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Verified Status */}
      <div className="flex items-center justify-between p-5 bg-blue-50/50 dark:bg-indigo-600/10 border border-blue-100 dark:border-indigo-600/20 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
            craftsmanProfile?.isVerified ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
          }`}>
            <CheckCircle size={24} className={craftsmanProfile?.isVerified ? 'text-white' : 'text-slate-400'} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg">Verification Status</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {craftsmanProfile?.isVerified ? 'Verified Craftsman' : 'Not Verified'}
            </p>
          </div>
        </div>
        {craftsmanProfile?.isVerified && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
            Verified on {new Date(craftsmanProfile?.verifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Bio Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">About</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
              <Edit2 size={14} />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="animate-in fade-in space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 block">Bio</label>
              <textarea 
                value={editBio} 
                onChange={(e) => setEditBio(e.target.value)} 
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 text-sm min-h-[120px] shadow-sm resize-none"
                placeholder="Write a bio..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-gray-300 mb-1.5 block">Skills (comma separated)</label>
              <input 
                type="text"
                value={editSkills} 
                onChange={(e) => setEditSkills(e.target.value)} 
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white focus:ring-1 focus:ring-slate-900 text-sm shadow-sm"
                placeholder="UI/UX, Web Dev, Design..."
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
              <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {craftsmanProfile?.bio || "No bio yet."}
          </p>
        )}
      </div>

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2.5">
          {craftsmanProfile?.skills && craftsmanProfile.skills.length > 0 ? (
            craftsmanProfile.skills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-gray-200 rounded-xl text-xs font-bold shadow-sm">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm italic">No skills added</span>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ craftsmanProfile }) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Eye size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{craftsmanProfile?.totalViews || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Views</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{craftsmanProfile?.totalCodex || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Codex</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Layout size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{craftsmanProfile?.totalArtifacts || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Artifacts</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{craftsmanProfile?.totalLikes || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Likes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      {craftsmanProfile?.rating?.count > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Rating</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(craftsmanProfile.rating.average) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {craftsmanProfile.rating.average.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({craftsmanProfile.rating.count} reviews)
            </span>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Account Status</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {craftsmanProfile?.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Craftsman Level</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize">{craftsmanProfile?.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Work Type</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize">{craftsmanProfile?.workType}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



