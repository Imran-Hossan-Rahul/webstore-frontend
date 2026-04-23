"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Camera, MapPin, Calendar, Edit2, ArrowRight, Sparkles } from "lucide-react";
import { api } from "@/utils/api";
import ImageUploadModal from "./ImageUploadModal";
import CreatorAccountModal from "./CreatorAccountModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProfileModal({ isOpen, onClose, verifiedHasCreatorAccount }) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  // Detect if we're on a creator route
  const isCreatorRoute = pathname?.startsWith("/user/creator");

  useEffect(() => {
    if (isOpen) {
      fetchUser();
      setIsEditing(false);
    }
  }, [isOpen]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
        // Fetch user profile
        const res = await api.get("/user/profile");
        if (res.success) {
            setUser(res.data);
            
            // If user has creator account and we need it, fetch it now
            if (res.data.hasCreatorAccount) {
              const creatorRes = await api.get("/creator/profile");
              if (creatorRes.success) {
                setCreatorProfile(creatorRes.data);
                setEditBio(creatorRes.data.bio || "");
                setEditSkills(creatorRes.data.skills?.join(", ") || "");
              }
            }
        }
    } catch (error) {
        console.error("Failed to fetch profile", error);
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
      } catch(err) {
          console.error(err);
          showToast("Failed to update profile. Please try again.", "error", "Error");
      }
  };

  const goToCreatorDashboard = () => {
    onClose();
    router.push("/user/creator");
  };

  const handleImageUploadSuccess = (data) => {
    // console.log("Upload success data:", data);
    
    // Optimistic update
    if (data.targetModel === "creator") {
      setCreatorProfile(prev => ({
        ...prev,
        [data.type === "profile" ? "profilePicture" : "coverPicture"]: data.url
      }));
    } else {
      setUser(prev => ({
        ...prev,
        [data.type === "profile" ? "profilePicture" : "coverPicture"]: data.url
      }));
    }

    // Also fetch fresh data to be sure
    fetchUser();
  };

  const openImageUpload = (type) => {
    setImageUploadType(type);
    setShowImageUpload(true);
  };

  // Determine which profile data to show
  const displayProfile = isCreatorRoute && creatorProfile ? creatorProfile : user;
  
  // Fix: Check if we should show creator info (even if fields are empty strings)
  const showCreatorData = isCreatorRoute && creatorProfile;
  
  // Use verified prop if available, otherwise fallback
  const isCreatorAccount = verifiedHasCreatorAccount || user?.hasCreatorAccount;

  const displayProfilePicture = showCreatorData
    ? creatorProfile.profilePicture 
    : user?.profilePicture;
    
  const displayCoverPicture = showCreatorData
    ? creatorProfile.coverPicture 
    : user?.coverPicture;

  // Determine upload endpoint based on route
  const getUploadEndpoint = (type) => {
    if (isCreatorRoute && isCreatorAccount) {
      return type === "profile" 
        ? "/upload/creator/profile-picture" 
        : "/upload/creator/cover-picture";
    }
    return type === "profile" 
      ? "/upload/user/profile-picture" 
      : "/upload/user/cover-picture";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 z-20 transition-colors"
          >
              <X size={20} />
          </button>

          {/* Cover Picture */}
          <div 
            onClick={() => openImageUpload("cover")}
            className="h-32 bg-gray-200 dark:bg-gray-800 w-full relative cursor-pointer group"
            style={displayCoverPicture ? { backgroundImage: `url(${displayCoverPicture})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Camera size={18} className="text-white" />
                <span className="text-white text-sm font-medium">Change Cover</span>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 -mt-12 relative">
              {/* Avatar */}
              <div className="relative inline-block">
                  <div 
                    onClick={() => openImageUpload("profile")}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg cursor-pointer group relative"
                  >
                      {displayProfilePicture ? (
                          <img src={displayProfilePicture} alt={displayProfile?.displayName || user?.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-3xl">
                              {(displayProfile?.displayName || user?.name || "?").charAt(0).toUpperCase()}
                          </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={20} className="text-white" />
                      </div>
                  </div>
              </div>

              {/* Main Info */}
              <div className="mt-4">
                  {isLoading ? (
                       <div className="py-10 text-center text-gray-400 flex flex-col items-center gap-3">
                         <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                         <p>Loading profile...</p>
                       </div>
                  ) : displayProfile ? (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {displayProfile.displayName || displayProfile.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                           {isCreatorAccount ? "Creator Account" : (user.email || "User")}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <span className="flex items-center gap-1"><MapPin size={14}/> Earth</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> Joined {new Date(displayProfile.createdAt || user.createdAt).getFullYear()}</span>
                        </div>

                        
                        {isCreatorAccount ? (
                          <div className="mt-4">
                            <button
                              onClick={goToCreatorDashboard}
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                            >
                              <Sparkles size={18} />
                              Go to Creator Dashboard
                              <ArrowRight size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                              Ready to share your work?
                            </p>
                            <button 
                                onClick={() => {
                                    setShowCreatorModal(true);
                                }}
                                className="w-full bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-lg font-bold hover:opacity-80 transition flex items-center justify-center gap-2"
                            >
                                <Sparkles size={16} />
                                Start Creating
                            </button>
                          </div>
                        )}
                        

                        {/* Bio Section */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">About</h3>
                                {!isEditing && user?.hasCreatorAccount && (
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
                                    {displayProfile?.bio || "No bio yet."}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {displayProfile?.skills && displayProfile.skills.length > 0 ? (
                                    displayProfile.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 dark:text-gray-500 text-sm italic">No skills added</span>
                                )}
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                             <button 
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("hasCreatorAccount");
                                    localStorage.removeItem("user");
                                    window.location.href = "/";
                                }}
                                className="w-full py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                             >
                                 Log Out
                             </button>
                        </div>
                      </>
                  ) : (
                      <div className="py-10 text-center text-gray-400">Loading profile...</div>
                  )}
              </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUploadSuccess={handleImageUploadSuccess}
        type={imageUploadType}
        uploadEndpoint={getUploadEndpoint(imageUploadType)}
        title={imageUploadType === "profile" ? "Upload Profile Picture" : "Upload Cover Picture"}
      />

      <CreatorAccountModal 
        isOpen={showCreatorModal} 
        onClose={() => setShowCreatorModal(false)}
      />
    </>
  );
}
