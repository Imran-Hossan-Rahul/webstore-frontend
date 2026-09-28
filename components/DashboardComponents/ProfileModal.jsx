"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Camera, MapPin, Calendar, Edit2, ArrowRight, User } from "lucide-react";
import { api } from "@/utils/api";
import ImageUploadModal from "./ImageUploadModal";
import CraftsmanAccountModal from "./CraftsmanAccountModal";
import { useToast } from "@/components/ui/ToastProvider";

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function ProfileModal({ isOpen, onClose, verifiedHasCraftsmanAccount }) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [craftsmanProfile, setCraftsmanProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageUploadType, setImageUploadType] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [showCraftsmanModal, setShowCraftsmanModal] = useState(false);

  // Detect if we're on a craftsman route
  const isCraftsmanRoute = pathname?.startsWith("/user/craftsman");

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
            
            // If user has craftsman account and we need it, fetch it now
            if (res.data.hasCraftsmanAccount) {
              const craftsmanRes = await api.get("/craftsman/profile");
              if (craftsmanRes.success) {
                setCraftsmanProfile(craftsmanRes.data);
                setEditBio(craftsmanRes.data.bio || "");
                setEditSkills(craftsmanRes.data.skills?.join(", ") || "");
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
          await api.patch("/craftsman/profile", { 
            bio: editBio,
            skills: skillsArray 
          });
          setCraftsmanProfile(prev => ({ ...prev, bio: editBio, skills: skillsArray }));
          setIsEditing(false);
      } catch(err) {
          console.error(err);
          showToast("Failed to update profile. Please try again.", "error", "Error");
      }
  };

  const goToCraftsmanDashboard = () => {
    onClose();
    router.push("/user/craftsman");
  };

  const handleImageUploadSuccess = (data) => {
    // console.log("Upload success data:", data);
    
    // Optimistic update
    if (data.targetModel === "craftsman") {
      setCraftsmanProfile(prev => ({
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
  const displayProfile = isCraftsmanRoute && craftsmanProfile ? craftsmanProfile : user;
  
  // Fix: Check if we should show craftsman info (even if fields are empty strings)
  const showCraftsmanData = isCraftsmanRoute && craftsmanProfile;
  
  // Use verified prop if available, otherwise fallback
  const isCraftsmanAccount = verifiedHasCraftsmanAccount || user?.hasCraftsmanAccount;

  const displayProfilePicture = showCraftsmanData
    ? craftsmanProfile.profilePicture 
    : user?.profilePicture;
    
  const displayCoverPicture = showCraftsmanData
    ? craftsmanProfile.coverPicture 
    : user?.coverPicture;

  // Determine upload endpoint based on route
  const getUploadEndpoint = (type) => {
    if (isCraftsmanRoute && isCraftsmanAccount) {
      return type === "profile" 
        ? "/upload/craftsman/profile-picture" 
        : "/upload/craftsman/cover-picture";
    }
    return type === "profile" 
      ? "/upload/user/profile-picture" 
      : "/upload/user/cover-picture";
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-brand-surface dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-sm relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
          
          {/* Close Button */}
          <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-brand-surface hover:bg-slate-200 dark:bg-brand-surface/[0.1] dark:hover:bg-slate-700 text-brand-slate dark:text-slate-300 z-20 transition-colors"
          >
              <X size={20} />
          </button>

          {/* Cover Picture */}
          <div 
            onClick={() => openImageUpload("cover")}
            className="h-32 bg-slate-200 dark:bg-brand-surface w-full relative cursor-pointer group"
            style={displayCoverPicture ? { backgroundImage: `url(${displayCoverPicture})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-brand-surface/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
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
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-200 dark:bg-brand-surface shadow-sm cursor-pointer group relative"
                  >
                      {displayProfilePicture ? (
                          <img src={getOptimizedUrl(displayProfilePicture)} alt={displayProfile?.displayName || user?.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-3xl">
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
                       <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-3">
                         <AppleSpinner />
                         <p>Loading profile...</p>
                       </div>
                  ) : displayProfile ? (
                      <>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          {displayProfile.displayName || displayProfile.name}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                           {isCraftsmanAccount ? "Craftsman Account" : (user.email || "User")}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-2">
                            <span className="flex items-center gap-1"><MapPin size={14}/> Earth</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> Joined {new Date(displayProfile.createdAt || user.createdAt).getFullYear()}</span>
                        </div>

                        
                        {isCraftsmanAccount ? (
                          <div className="mt-4">
                            <button
                              onClick={goToCraftsmanDashboard}
                              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition shadow-sm shadow-orange-500/20 flex items-center justify-center gap-2"
                            >
                              <User size={18} />
                              Go to Craftsman Dashboard
                              <ArrowRight size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-brand-surface dark:bg-brand-surface rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-sm text-brand-slate dark:text-slate-400 text-center mb-3">
                              Ready to share your work?
                            </p>
                            <button 
                                onClick={() => {
                                    setShowCraftsmanModal(true);
                                }}
                                className="w-full bg-black dark:bg-brand-surface text-white dark:text-black px-4 py-2.5 rounded-lg font-bold hover:opacity-80 transition flex items-center justify-center gap-2"
                            >
                                <User size={16} />
                                Start Crafting
                            </button>
                          </div>
                        )}
                        

                        {/* Bio Section */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white">About</h3>
                                {!isEditing && user?.hasCraftsmanAccount && (
                                    <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-slate-900 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                                        <Edit2 size={14} />
                                    </button>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <div className="animate-in fade-in space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-brand-slate dark:text-slate-300 mb-1 block">Bio</label>
                                      <textarea 
                                          value={editBio} 
                                          onChange={(e) => setEditBio(e.target.value)} 
                                          className="w-full p-3 rounded-xl border border-brand-navy/[0.10] dark:border-slate-700 bg-brand-surface dark:bg-brand-surface text-slate-900 dark:text-white outline-none focus:border-purple-500 text-sm min-h-[100px]"
                                          placeholder="Write a bio..."
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-brand-slate dark:text-slate-300 mb-1 block">Skills (comma separated)</label>
                                      <input 
                                          type="text"
                                          value={editSkills} 
                                          onChange={(e) => setEditSkills(e.target.value)} 
                                          className="w-full p-3 rounded-xl border border-brand-navy/[0.10] dark:border-slate-700 bg-brand-surface dark:bg-brand-surface text-slate-900 dark:text-white outline-none focus:border-purple-500 text-sm"
                                          placeholder="UI/UX, Web Dev, Design..."
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white dark:hover:text-white">Cancel</button>
                                        <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-medium bg-black dark:bg-brand-surface text-white dark:text-black rounded-lg hover:opacity-90">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-brand-slate dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {displayProfile?.bio || "No bio yet."}
                                </p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="mt-6">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {displayProfile?.skills && displayProfile.skills.length > 0 ? (
                                    displayProfile.skills.map((skill, index) => (
                                        <span key={`${skill}-${index}`} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm italic">No skills added</span>
                                )}
                            </div>
                        </div>

                        {/* Logout Section */}
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                             <button 
                                onClick={async () => {
                                    try {
                                        await api.post("/auth/logout");
                                    } catch(e) {
                                        console.error("Logout error", e);
                                    }
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("hasCraftsmanAccount");
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
                      <div className="py-10 text-center text-slate-400">Loading profile...</div>
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

      <CraftsmanAccountModal 
        isOpen={showCraftsmanModal} 
        onClose={() => setShowCraftsmanModal(false)}
      />
    </>
  );
}
