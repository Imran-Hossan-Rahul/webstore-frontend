"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Tag, Layers, ShieldCheck, Search, Bookmark, Layout, ChevronRight, Plus, Share2, Trash2 } from "lucide-react";
import { api } from "@/utils/api";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { DashboardContext } from "@/app/(dashboard)/layout";
import DevlogRightSidebar from "./sidebar/DevlogRightSidebar";
import DevlogsListSidebar from "./sidebar/DevlogsListSidebar";
import ArtifactRightSidebar from "./sidebar/ArtifactRightSidebar";
import ArtifactsListSidebar from "./sidebar/ArtifactsListSidebar";
import CodexRightSidebar from "./sidebar/CodexRightSidebar";
import CodexListSidebar from "./sidebar/CodexListSidebar";
import ExploreSidebar from "./sidebar/ExploreSidebar";
import ManageJobsSidebar from "./sidebar/ManageJobsSidebar";
import PostJobSidebar from "./sidebar/PostJobSidebar";
import ManageChallengesSidebar from "./sidebar/ManageChallengesSidebar";
import ChallengesSidebar from "./sidebar/ChallengesSidebar";
import AchievementsSidebar from "./sidebar/AchievementsSidebar";
import CraftsmanSidebar from "./sidebar/CraftsmanSidebar";
import JobDetailSidebar from "./sidebar/JobDetailSidebar";
import ChallengeCreateSidebar from "./sidebar/ChallengeCreateSidebar";
import ProposalsSidebar from "./sidebar/ProposalsSidebar";
import ProposalDetailSidebar from "./sidebar/ProposalDetailSidebar";
import WalletRightSidebar from "./sidebar/WalletRightSidebar";
import JobTalentRightSidebar from "./sidebar/JobTalentRightSidebar";
import WorkspaceSidebar from "./sidebar/WorkspaceSidebar";
import ChallengeDetailsSidebar from "./sidebar/ChallengeDetailsSidebar";
import ChallengeSubmitSidebar from "./sidebar/ChallengeSubmitSidebar";
import VerifySidebar from "./sidebar/VerifySidebar";
import CraftsmanHoverCard from "./cards/CraftsmanHoverCard";

import BecomePatronModal from "../DashboardComponents/BecomePatronModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function RightSidebar() {
  const pathname = usePathname();
  const [featuredCraftsmen, setFeaturedCraftsmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingTags, setTrendingTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [artifactCategories, setArtifactCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [artifactTags, setArtifactTags] = useState([]);
  const [artifactTagsLoading, setArtifactTagsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Determine Context
  const isMsg = pathname?.includes('/messages');
  const isCodex = pathname?.startsWith('/codex');
  const isCodexDetail = isCodex && pathname.split('/').length > 2;
  const isArtifact = pathname?.startsWith('/artifacts');
  const isArtifactDetail = isArtifact && pathname.split('/').length > 2;
  const isJob = pathname?.startsWith('/jobs/');
  const isPost = pathname?.startsWith('/post/');
  const isDevlogsList = pathname === '/devlogs';
  const isDevlogDetail = pathname?.startsWith('/devlogs/') && pathname.split('/').filter(Boolean).length > 1;
  const isWallet = pathname === '/wallet';
  const searchParams = useSearchParams();
  const isSaved = pathname === '/' && searchParams?.get('view') === 'saved';
  const isSearch = pathname === '/search';
  const isManageJobDetail = pathname?.startsWith('/manage-jobs/') && pathname.split('/').filter(Boolean).length > 1;
  const isProposalDetail = pathname?.startsWith('/proposals/') && pathname.split('/').filter(Boolean).length > 1;
  const isProposals = pathname?.startsWith('/proposals') && !isProposalDetail;
  const isExplore = pathname === '/explore';
  const isVerify = pathname === '/verify';

  const [jobTips] = useState([
    { title: "Personalized Pitch", desc: "Tailor your cover letter to the patron's specific needs." },
    { title: "Portfolio Matters", desc: "Attach links to devlogs similar to this job's requirements." },
    { title: "Safety First", desc: "Never share personal contact info before a contract is started." }
  ]);

  // Wallet / Achievements Hooks (Moved to top for Rules of Hooks)
  const { user, isGuest, requireAuth, openCreatePost } = useContext(DashboardContext) || {};
  const [isBecomePatronOpen, setIsBecomePatronOpen] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [tokenRewards, setTokenRewards] = useState([]);
  const [walletStats, setWalletStats] = useState(null);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isWallet) return;
    const fetchAchievements = async () => {
      try {
        setAchievementsLoading(true);
        const res = await api.get("/user/achievements");
        if (res.success) {
          setAchievements(res.data.achievements);
          setTokenRewards(res.data.tokenRewards);
          setWalletStats({
            totalTokens: res.data.totalTokens,
            totalXP: res.data.totalXP,
            level: res.data.level
          });
        }
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setAchievementsLoading(false);
      }
    };
    fetchAchievements();
  }, [isWallet]);

  useEffect(() => {
    if (!isSaved) return;
    const fetchSavedItems = async () => {
      try {
        setItemsLoading(true);
        const res = await api.get('/favorites');
        if (res.success) {
          setItems(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch saved items:", err);
      } finally {
        setItemsLoading(false);
      }
    };
    fetchSavedItems();
  }, [isSaved]);

  // Fetch featured craftsman (Shared logic)
  const fetchFeaturedCraftsman = async () => {
    try {
      const response = await api.get("/user/featured-craftsmen?limit=4");
      if (response.success && response.data.length > 0) {
        setFeaturedCraftsmen(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch featured craftsman:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCraftsman();
    if (isArtifact) {
      fetchArtifactCategories();
      fetchArtifactTags();
    } else {
      fetchTrendingTags();
    }
  }, [isArtifact]);

  // Fetch trending tags
  const fetchTrendingTags = async () => {
    try {
      const response = await api.get("/feed/trending-tags?limit=6");
      if (response.success && response.data.length > 0) {
        setTrendingTags(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch trending tags:", error);
    } finally {
      setTagsLoading(false);
    }
  };

  // Fetch artifact categories
  const fetchArtifactCategories = async () => {
    try {
      const response = await api.get("/artifact/popular-categories?limit=8");
      if (response.success && response.data.length > 0) {
        setArtifactCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch artifact categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch artifact trending tags
  const fetchArtifactTags = async () => {
    try {
      const response = await api.get("/artifact/trending-tags?limit=6");
      if (response.success && response.data.length > 0) {
        setArtifactTags(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch artifact tags:", error);
    } finally {
      setArtifactTagsLoading(false);
    }
  };

  // Fetch real popular topics for codex context
  const [popularTopics, setPopularTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState(false);

  useEffect(() => {
    if (!isCodex) return;
    let cancelled = false;
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        setTopicsError(false);
        const res = await api.get("/codex/popular-topics?limit=8");
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setPopularTopics(res.data);
        } else if (!cancelled) {
          setTopicsError(true);
        }
      } catch {
        if (!cancelled) setTopicsError(true);
      } finally {
        if (!cancelled) setTopicsLoading(false);
      }
    };
    fetchTopics();
    return () => { cancelled = true; };
  }, [isCodex]);

  // Capitalise first letter of each word in a tag
  const formatTag = (tag) =>
    tag.replace(/\b\w/g, (c) => c.toUpperCase());

  if (isMsg) return null;
  
  const [activeFolder, setActiveFolder] = useState("All");
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [isPublicFolder, setIsPublicFolder] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isSaved) return;
    fetchFolders();
    
    const handleUpdate = () => fetchFolders();
    window.addEventListener('foldersUpdated', handleUpdate);
    return () => window.removeEventListener('foldersUpdated', handleUpdate);
  }, [isSaved]);

  const fetchFolders = async () => {
    try {
        setFoldersLoading(true);
        const res = await api.get('/favorites/folders');
        if (res.success) setFolders(res.data);
    } catch (err) {
        console.error("Failed to fetch folders:", err);
    } finally {
        setFoldersLoading(false);
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
        const res = await api.patch(`/favorites/folders/${folderId}/rename`, { name: newName });
        if (res.success) {
            setFolders(prev => prev.map(f => f._id === folderId ? { ...f, name: res.data.name } : f));
            showToast("Folder renamed", "success");
            setRenamingFolderId(null);
            setRenameValue("");
        }
    } catch (err) {
        showToast("Failed to rename folder", "error");
    }
  };

  const handleCreateFolderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
        const res = await api.post('/favorites/folders', { 
            name: newFolderName.trim(),
            isPublic: isPublicFolder 
        });
        if (res.success) {
            setFolders([...folders, res.data]);
            showToast("Folder created", "success");
            setIsCreateFolderModalOpen(false);
            setNewFolderName("");
            setIsPublicFolder(false);
            window.dispatchEvent(new Event('foldersUpdated'));
        }
    } catch (err) {
        showToast(err.message || "Failed to create folder", "error");
    }
  };

  const handleToggleFolderVisibility = async (id, currentVisibility, e) => {
    e.stopPropagation();
    try {
        const res = await api.patch(`/favorites/folders/${id}/visibility`, { isPublic: !currentVisibility });
        if (res.success) {
            setFolders(folders.map(f => f._id === id ? { ...f, isPublic: !currentVisibility } : f));
            showToast(`Folder made ${!currentVisibility ? 'Public' : 'Private'}`, "success");
        }
    } catch (err) {
        showToast(err.message || "Failed to update visibility", "error");
    }
  };

  const handleDeleteFolder = async (id, e) => {
    e.stopPropagation();
    if (deleteConfirmId !== id) {
        setDeleteConfirmId(id);
        return;
    }
    try {
        const res = await api.delete(`/favorites/folders/${id}`);
        if (res.success) {
            setFolders(folders.filter(f => f._id !== id));
            showToast("Folder deleted", "success");
            if (activeFolder === id) setActiveFolder("All");
            window.dispatchEvent(new Event('foldersUpdated'));
        }
    } catch (err) {
        showToast("Failed to delete folder", "error");
    } finally {
        setDeleteConfirmId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire collection? This cannot be undone.")) return;
    try {
        const res = await api.delete('/favorites/clear');
        if (res.success) {
            showToast("Collection cleared", "success");
            window.location.reload(); // Refresh to clear feed
        }
    } catch (err) {
        showToast("Failed to clear collection", "error");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast("Collection link copied to clipboard", "success");
  };

  const [isOrgMode, setIsOrgMode] = useState(false);

  // --- CONTEXTUAL ROUTING ---
  if (isSaved) {
    // Calculate folder stats
    const categorizedCount = folders.reduce((acc, f) => acc + (f.items?.length || 0), 0);
    const healthPercent = items.length > 0 ? Math.min(100, Math.round((categorizedCount / items.length) * 100)) : 0;

    return (
      <aside className="h-full flex flex-col gap-6 pb-10">
        {/* Collection Overview */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-12 -mb-12 group-hover:bg-blue-500/20 transition-colors duration-700" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Bookmark size={16} className="text-emerald-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Library Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-3xl font-black mb-1">{items.length}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Saves</span>
                    </div>
                    <div>
                        <span className="block text-3xl font-black mb-1">{folders.length + 1}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Folders</span>
                    </div>
                </div>

            </div>
        </div>

        {/* Collections Manager */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-lg p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" /> My Folders
              </h3>
              <button 
                onClick={() => setIsCreateFolderModalOpen(true)}
                className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"
              >
                <Plus size={14} />
              </button>
           </div>
           
           <div className="space-y-1.5">
              {isCreateFolderModalOpen && (
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <form onSubmit={handleCreateFolderSubmit} className="flex flex-col gap-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="submit"
                        disabled={!newFolderName.trim()}
                        className="flex-1 py-1.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                           setIsCreateFolderModalOpen(false);
                           setNewFolderName("");
                           setIsPublicFolder(false);
                        }}
                        className="flex-1 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-1 mt-1">
                       <span className="text-[9px] font-bold text-slate-500 uppercase">Make Public</span>
                       <button
                         type="button"
                         onClick={() => setIsPublicFolder(!isPublicFolder)}
                         className={`relative w-8 h-4 rounded-full transition-colors ${
                           isPublicFolder ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
                         }`}
                       >
                         <div
                           className={`absolute top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${
                             isPublicFolder ? "left-4.5" : "left-0.5"
                           }`}
                           style={{ transform: isPublicFolder ? 'translateX(14px)' : 'translateX(0px)' }}
                         />
                       </button>
                    </div>
                  </form>
                </div>
              )}
              <button 
                onClick={() => {
                  setActiveFolder("All");
                  router.push(pathname + "?view=saved");
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-all group ${
                    activeFolder === "All" 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-none" 
                    : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                }`}
              >
                  <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${activeFolder === "All" ? 'bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <span className="text-[13px] font-bold tracking-tight">All Items</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeFolder === "All" ? "bg-white/10 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                    {items.length}
                  </span>
              </button>

              {folders.map((folder, idx) => (
                  <div key={folder._id || `folder-${idx}`}>
                    {renamingFolderId === folder._id ? (
                      /* Inline rename input */
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleRenameFolder(folder._id, renameValue); }}
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 px-2 py-1 text-[12px] font-bold bg-slate-50 dark:bg-white/5 border border-indigo-300 dark:border-indigo-500/50 rounded-md outline-none text-slate-900 dark:text-white"
                        />
                        <button type="submit" className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">OK</button>
                        <button type="button" onClick={() => { setRenamingFolderId(null); setRenameValue(""); }} className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-500 rounded text-[10px] font-bold">✕</button>
                      </form>
                    ) : (
                    <button 
                      onClick={() => {
                        setActiveFolder(folder._id);
                        router.push(pathname + `?view=saved&folder=${folder._id}`);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-lg transition-all group ${
                          activeFolder === folder._id 
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-none" 
                          : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color || '#4f46e5' }} />
                            <span className="text-[13px] font-bold tracking-tight">{folder.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${activeFolder === folder._id ? "bg-white/10 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-white/5 text-slate-400"}`}>
                            {folder.items?.length || 0}
                          </span>
                          {isOrgMode && (
                            <>
                              <button
                                onClick={(e) => handleToggleFolderVisibility(folder._id, folder.isPublic, e)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  folder.isPublic 
                                    ? "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" 
                                    : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                                }`}
                                title={folder.isPublic ? "Make Private" : "Make Public"}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  {folder.isPublic 
                                    ? <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /> 
                                    : <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                                  }
                                  {folder.isPublic && <circle cx="12" cy="12" r="3" />}
                                </svg>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setRenamingFolderId(folder._id); setRenameValue(folder.name); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
                                title="Rename"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button 
                                onClick={(e) => handleDeleteFolder(folder._id, e)}
                                className={`transition-colors flex items-center justify-center ${
                                   deleteConfirmId === folder._id 
                                   ? "px-2 py-1 bg-rose-500 text-white rounded text-[9px] font-bold tracking-widest shadow-sm" 
                                   : "p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md"
                                }`}
                              >
                                {deleteConfirmId === folder._id ? "SURE?" : <Trash2 size={12} />}
                              </button>
                            </>
                          )}
                        </div>
                    </button>
                    )}
                  </div>
              ))}

              {folders.length === 0 && !foldersLoading && (
                <p className="text-[10px] text-center text-slate-400 py-4 italic">No folders created yet</p>
              )}
           </div>

           <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setIsOrgMode(!isOrgMode)}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isOrgMode 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  }`}
                >
                    <Layout size={14} /> {isOrgMode ? "Exit Org Mode" : "Organization Mode"}
                </button>
           </div>
        </div>

        {/* Global Actions */}
        <div className="mt-2">
            <button 
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-xl group hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all shadow-sm"
            >
                <Share2 size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Share Collection</span>
            </button>
        </div>

      </aside>
    );
  }

  if (isProposalDetail) {
    return <ProposalDetailSidebar />;
  }

  if (isProposals) {
    return <ProposalsSidebar />;
  }

  if (pathname === '/manage-jobs') {
    return <ManageJobsSidebar />;
  }
  if (isManageJobDetail) {
    const jobId = pathname.split('/').filter(Boolean)[1];
    return <JobDetailSidebar jobId={jobId} />;
  }
  if (pathname === '/post-job') {
    return <PostJobSidebar />;
  }
  if (pathname === '/manage-challenges') {
    return <ManageChallengesSidebar />;
  }
  if (pathname === '/challenges/create') {
    return <ChallengeCreateSidebar />;
  }
  if (pathname === '/challenges') {
    return <ChallengesSidebar />;
  }
  if (pathname?.startsWith('/challenges/')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 2) {
      return <ChallengeDetailsSidebar challengeId={segments[1]} />;
    }
    if (segments.length === 3 && segments[2] === 'submit') {
      return <ChallengeSubmitSidebar challengeId={segments[1]} />;
    }
  }

  if (pathname === '/achievements') {
    return <AchievementsSidebar />;
  }
  if (pathname?.startsWith('/u/')) {
    return <CraftsmanSidebar />;
  }

  if (isWallet) {
    return <WalletRightSidebar />;
  }

  if (isVerify) {
    return <VerifySidebar />;
  }

  if (pathname === '/workspace') {
    return <WorkspaceSidebar />;
  }

  // --- DEVLOG CONTEXT SIDEBAR ---
  if (isDevlogDetail) {
      const postId = pathname.split('/').filter(Boolean)[1];
      return <DevlogRightSidebar currentPostId={postId} />;
  }
  if (isPost) {
      const postId = pathname.split('/')[2];
      return <DevlogRightSidebar currentPostId={postId} />;
  }
  if (isDevlogsList) {
      return <DevlogsListSidebar />;
  }

  // --- ARTIFACT CONTEXT SIDEBAR ---
  if (isArtifactDetail) {
      const artifactId = pathname.split('/')[2];
      return <ArtifactRightSidebar currentArtifactId={artifactId} />;
  }

  if (isArtifact) {
      return <ArtifactsListSidebar />;
  }

  // --- CODEX CONTEXT SIDEBAR ---
  if (isCodexDetail) {
      const codexSlug = pathname.split('/')[2];
      return <CodexRightSidebar currentCodexSlug={codexSlug} />;
  }

  if (isCodex) {
    return <CodexListSidebar />;
  }

  // --- EXPLORE CONTEXT SIDEBAR ---
  if (isExplore) {
      return <ExploreSidebar />;
  }

  // --- JOB CONTEXT SIDEBAR ---
  const isJobPage = pathname === '/jobs' || pathname?.startsWith('/jobs/');
  if (isJobPage) {
    // If it's a specific job ID page
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1 && segments[0] === 'jobs' && segments[1] !== 'my-proposals') {
        return <JobTalentRightSidebar jobId={segments[1]} />;
    }

    return (
      <aside className="h-full flex flex-col gap-6 pb-10">
        {/* Post a Job CTA - Refined */}
        <div className="bg-slate-900 dark:bg-white rounded-2xl p-6 text-white dark:text-slate-900 shadow-xl shadow-black/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/30 transition-colors" />
           <h3 className="font-bold text-xl mb-2 relative z-10">Hire Professionals</h3>
           <p className="text-white/70 dark:text-slate-600 text-[11px] mb-5 leading-relaxed font-medium relative z-10">
             Access a global pool of elite craftsmen and developers ready to scale your devlog.
           </p>
           <button 
              onClick={() => {
                if (isGuest) {
                  requireAuth("engage");
                  return;
                }
                if (user?.role === "patron" || user?.role === "admin" || user?.role === "superadmin") {
                  router.push('/post-job');
                } else {
                  setIsBecomePatronOpen(true);
                }
              }}
              className="w-full py-3 bg-indigo-600 text-white dark:bg-slate-900 dark:text-white rounded-xl font-bold text-xs hover:shadow-lg transition-all relative z-10 flex items-center justify-center gap-2"
           >
              Post a Job <ArrowRight size={14} />
           </button>
        </div>

        <BecomePatronModal 
          isOpen={isBecomePatronOpen} 
          onClose={() => setIsBecomePatronOpen(false)} 
        />

        {/* Professional Success Guide */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Success Guide
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs">
                <TrendingUp size={14} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">Perfect Your Pitch</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">patrons value specific solutions over generic introductions.</p>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs">
                <Layout size={14} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1">Linked Devlogs</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Showcase similar work from your portfolio in your application.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
           <div className="space-y-1">
               <Link href="/proposals" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">My Applications</span>
                   <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link href="/wallet" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment History</span>
                   <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
               </Link>
           </div>
        </div>
      </aside>
    );
  }

  // --- DEFAULT FALLBACK SIDEBAR ---
  return (
    <aside className="h-full flex flex-col gap-8 pb-20">
      {/* Featured Craftsmen */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="text-amber-500" size={18} /> Elite Talents
          </h3>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5" />
                <div className="space-y-1">
                  <div className="w-24 h-3 bg-slate-100 dark:bg-white/5 rounded" />
                  <div className="w-16 h-2 bg-slate-100 dark:bg-white/5 rounded" />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-5">
            {featuredCraftsmen.map((craftsman, idx) => (
              <CraftsmanHoverCard
                key={craftsman._id || `craftsman-${idx}`}
                userId={craftsman._id}
                username={craftsman.username}
                avatarUrl={craftsman.avatar}
                displayName={craftsman.name}
                wrapperDisplay="block"
              >
                <Link href={`/u/${craftsman.username}`} className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-all">
                      <Image 
                        src={craftsman.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${craftsman.username || craftsman.name || 'Craftsman'}`} 
                        alt={craftsman.name} 
                        width={40} 
                        height={40} 
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm">
                      <ShieldCheck size={12} className="text-emerald-500" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white transition-colors leading-tight">{craftsman.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Level {craftsman.gamification?.level || 1} Craftsman</p>
                  </div>
                </Link>
              </CraftsmanHoverCard>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Trending Community Tags */}
      <section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-indigo-500" size={18} /> Trending Now
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {tagsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
            ))
          ) : trendingTags.length > 0 ? (
            trendingTags.map((t, idx) => {
              const tagName = t.name || t.tag || 'unknown';
              return (
                <Link 
                  key={tagName + idx} 
                  href={`/search?q=${tagName}`}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
                >
                  #{tagName}
                </Link>
              );
            })
          ) : (
            <span className="text-xs text-slate-400 italic">No trending tags found</span>
          )}
        </div>
      </section>

      {/* Community / Rewards CTA */}
      <div className="bg-indigo-600 rounded-lg p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700" />
         <h3 className="font-bold text-lg mb-2 relative z-10">Elite Rewards</h3>
         <p className="text-indigo-100 text-[11px] mb-4 leading-relaxed relative z-10">
           Complete challenges and contribute to earn exclusive tokens and badges.
         </p>
         <Link href="/achievements" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors relative z-10">
           Explore Tasks <ArrowRight size={14} />
         </Link>
      </div>
    </aside>
  );
}



