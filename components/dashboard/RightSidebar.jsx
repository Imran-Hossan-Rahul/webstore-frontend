"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Tag, Layers, ShieldCheck, Search, Bookmark, Layout, ChevronRight, Plus, Share2, Trash2, Mail, MessageCircle, Github, Linkedin, Globe, Gift, FileText, ShoppingCart, Check, Zap, Clock, Award, Facebook, Instagram, Twitter, Store } from "lucide-react";
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
import { features } from "@/constants/features";

export default function RightSidebar() {
  const pathname = usePathname();
  
  const getFirstPhoto = (photos) => {
    if (!photos) return null;
    if (typeof photos === 'string') {
      if (photos.startsWith('[')) {
        try { return JSON.parse(photos)[0]; } catch(e) {}
      }
      return photos;
    }
    if (Array.isArray(photos)) {
      if (photos.length === 0) return null;
      const first = photos[0];
      if (typeof first === 'string' && first.startsWith('[')) {
        try { return JSON.parse(first)[0]; } catch(e) {}
      }
      return first;
    }
    return null;
  };


  const [artifactCategories, setArtifactCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [artifactTags, setArtifactTags] = useState([]);
  const [artifactTagsLoading, setArtifactTagsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [marketConfig, setMarketConfig] = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [showCartSuccess, setShowCartSuccess] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

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
  const isMarket = pathname === '/' || pathname?.startsWith('/product') || pathname?.startsWith('/cart') || pathname?.startsWith('/checkout') || pathname?.startsWith('/orders') || !features.enableCommunity;

  useEffect(() => {
    if (!isMarket) return;
    const fetchRecommended = async () => {
      try {
        const [configRes, productsRes] = await Promise.all([
          api.get(`/market/config?_t=${Date.now()}`).catch(() => ({ data: null })),
          api.get('/market/products')
        ]);
        
        const actualConfig = configRes.data || (configRes.singletonKey ? configRes : null);
        if (actualConfig) {
          setMarketConfig(actualConfig);
        }
        
        const productsData = productsRes.data || [];
        let liveProducts = productsData.filter(p => p.status === 'Live');
        const currentId = pathname.startsWith('/product/') ? pathname.split('/')[2] : null;
        if (currentId) {
            liveProducts = liveProducts.filter(p => p.id.toString() !== currentId);
        }
        const shuffled = liveProducts.sort(() => 0.5 - Math.random());
        setRecommendedProducts(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setMarketLoading(false);
      }
    };
    fetchRecommended();
  }, [isMarket, pathname]);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isMarket) return;

    const updateCartCount = () => {
      try {
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          const cartIds = JSON.parse(cartStr);
          setCartCount(cartIds.length);
        } else {
          setCartCount(0);
        }
      } catch (e) {}
    };

    // Initial load
    updateCartCount();

    const handleCartUpdate = () => {
      updateCartCount();
      setShowCartSuccess(true);
      setTimeout(() => setShowCartSuccess(false), 3000);
    };
    
    window.addEventListener('addedToCart', handleCartUpdate);
    window.addEventListener('cartUpdated', updateCartCount);

    const handleOrderConfirmed = () => {
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 4000);
    };
    window.addEventListener('orderConfirmed', handleOrderConfirmed);
    
    return () => {
      window.removeEventListener('addedToCart', handleCartUpdate);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('orderConfirmed', handleOrderConfirmed);
    };
  }, [isMarket]);

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

  useEffect(() => {
    if (isArtifact) {
      fetchArtifactCategories();
      fetchArtifactTags();
    }
  }, [isArtifact]);

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

  const [activeFolder, setActiveFolder] = useState("All");
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [isPublicFolder, setIsPublicFolder] = useState(false);
  const [isOrgMode, setIsOrgMode] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isSaved) return;
    fetchFolders();
    
    const handleUpdate = () => fetchFolders();
    window.addEventListener('foldersUpdated', handleUpdate);
    return () => window.removeEventListener('foldersUpdated', handleUpdate);
  }, [isSaved]);

  if (isMsg) return null;

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
        <div className="bg-apple-parchment dark:bg-apple-surfaceDark border border-apple-hairline rounded-apple-lg p-8">
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
                <div className="p-3 bg-apple-parchment dark:bg-apple-surfaceDark border border-apple-hairline rounded-apple-sm mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
                           className={`absolute top-0.5 bg-white w-3 h-3 rounded-full transition-opacity ${
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
        <div className="bg-apple-parchment dark:bg-apple-surfaceDark border border-apple-hairline rounded-apple-lg p-6">
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
        <div className="bg-apple-parchment dark:bg-apple-surfaceDark border border-apple-hairline rounded-apple-lg p-4">
           <div className="space-y-1">
               <Link href="/proposals" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">My Applications</span>
                   <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-opacity" />
               </Link>
               <Link href="/wallet" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Payment History</span>
                   <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-opacity" />
               </Link>
           </div>
        </div>
      </aside>
    );
  }

  // --- MARKET CONTEXT SIDEBAR ---
  if (isMarket) {
    if (marketLoading) {
      return (
        <aside className="h-full flex flex-col gap-8 pb-10">
          <div className="shrink-0 bg-white dark:bg-[#1c1c1e] border border-slate-100 dark:border-[#2c2c2e] rounded-[16px] p-6 shadow-sm animate-pulse">
             <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-5"></div>
             <div className="space-y-4">
               {[1, 2].map((i) => (
                 <div key={i} className="flex gap-4 items-center">
                   <div className="w-14 h-14 rounded-[10px] bg-gray-200 dark:bg-gray-800 flex-shrink-0"></div>
                   <div className="flex-1 space-y-2">
                     <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                     <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </aside>
      );
    }

    return (
      <aside className="h-full flex flex-col gap-8 pb-10">
        {/* Today's Offer */}
        {marketConfig?.todaysOffer?.isActive !== false && (
        <div className="shrink-0 bg-white dark:bg-[#1c1c1e] border border-slate-100 dark:border-[#2c2c2e] rounded-[16px] p-6 flex flex-col items-center text-center relative overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
           <h3 className="text-[12px] font-semibold font-sans text-[#86868b] uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
             <Gift size={14} /> Grand Opening Offer
           </h3>
           {(() => {
             const rawTitle = marketConfig?.todaysOffer?.title || "Get 20% OFF\non Audio Gear";
             const parts = rawTitle.split('\n');
             const isSingleLongLine = parts.length === 1 && rawTitle.length > 35;
             return (
               <div className="mb-4 mt-1 w-full">
                 <h4 className={`${isSingleLongLine ? 'text-[16px] leading-relaxed' : 'text-[20px] leading-snug'} font-bold font-sans text-apple-ink dark:text-white tracking-tight`}>
                   {parts[0]}
                 </h4>
                 {parts.length > 1 && (
                   <p className="text-[13px] text-[#86868b] dark:text-gray-400 font-medium leading-relaxed mt-2 whitespace-pre-line">
                     {parts.slice(1).join('\n')}
                   </p>
                 )}
               </div>
             );
           })()}
           <div className="font-mono bg-[#f5f5f7] dark:bg-[#2c2c2e] text-apple-ink dark:text-white px-4 py-1.5 rounded-full text-[12px] font-medium mb-5">
             Use code: {marketConfig?.todaysOffer?.code || "AUDIO20"}
           </div>
           <Link 
             href={
               marketConfig?.todaysOffer?.applicableProducts?.length > 0 
                 ? `/shop?ids=${marketConfig.todaysOffer.applicableProducts.map(p => typeof p === 'object' ? p._id : p).join(',')}`
                 : (marketConfig?.todaysOffer?.link || "#")
             } 
             className="bg-[#0071e3] text-white text-[14px] font-medium px-4 py-2.5 rounded-full w-full hover:bg-[#0077ED] transition-colors inline-block"
           >
             Claim Offer
           </Link>
        </div>
        )}

        {/* Flash Deals Widget */}
        {marketConfig?.flashDeals?.length > 0 && (
          <div className="shrink-0 bg-white dark:bg-[#1c1c1e] border border-slate-100 dark:border-[#2c2c2e] rounded-[16px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
             <div className="flex items-center justify-between mb-5">
               <h3 className="text-[13px] font-semibold font-sans text-[#1d1d1f] dark:text-white flex items-center">
                 Flash Deals
               </h3>
               <div className="bg-slate-100 dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center">
                 12:45:00
               </div>
             </div>
             <div className="space-y-4">
               {marketConfig.flashDeals.slice(0, 2).map((product) => {
                 const photo = getFirstPhoto(product.photos);
                 const photoUrl = photo && photo.includes('cloudinary') && !photo.includes('f_auto') 
                    ? photo.replace('/upload/', '/upload/f_auto,q_auto,w_200/') 
                    : photo;
                    
                 return (
                   <Link href={`/product/${product._id}`} key={product._id} className="flex gap-4 group items-center transition-all">
                     <div className="w-14 h-14 rounded-[10px] bg-[#f5f5f7] dark:bg-black flex-shrink-0 overflow-hidden border border-slate-100 dark:border-[#2c2c2e] relative">
                       {photoUrl ? (
                         <img src={photoUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[10px] font-sans text-apple-muted">Img</div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[13px] font-medium font-sans text-apple-ink dark:text-white mb-1 truncate group-hover:text-[#0071e3] transition-colors">{product.title}</h4>
                       <div className="flex items-center gap-2">
                         <p className="text-[13px] font-semibold font-sans text-[#1d1d1f] dark:text-white">BDT {product.selling_price}</p>
                       </div>
                     </div>
                   </Link>
                 );
               })}
             </div>
          </div>
        )}

        {/* Trending Now Widget */}
        {marketConfig?.trendingNow?.length > 0 && (
          <div className="shrink-0 bg-white dark:bg-[#1c1c1e] border border-slate-100 dark:border-[#2c2c2e] rounded-[16px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
             <h3 className="text-[13px] font-semibold font-sans text-[#1d1d1f] dark:text-white mb-2 flex items-center">
               Trending Now
             </h3>
             <div className="flex flex-col">
               {marketConfig.trendingNow.slice(0, 4).map((product, idx) => {
                 const photo = getFirstPhoto(product.photos);
                 const photoUrl = photo && photo.includes('cloudinary') && !photo.includes('f_auto') 
                    ? photo.replace('/upload/', '/upload/f_auto,q_auto,w_200/') 
                    : photo;
                    
                 return (
                   <Link href={`/product/${product._id}`} key={product._id} className="flex gap-4 group items-center py-4 border-b border-slate-100 dark:border-[#2c2c2e] last:border-0 last:pb-0 transition-all">
                     <div className="w-12 h-12 rounded-[10px] bg-[#f5f5f7] dark:bg-black flex-shrink-0 overflow-hidden border border-slate-100 dark:border-[#2c2c2e] relative">
                       {photoUrl && <img src={photoUrl} alt={product.title} className="w-full h-full object-cover" />}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className="text-[12px] font-medium font-sans text-apple-ink dark:text-white truncate group-hover:text-[#0071e3] transition-colors mb-1">{product.title}</h4>
                       <p className="text-[12px] font-semibold font-sans text-[#1d1d1f] dark:text-white">BDT {product.selling_price}</p>
                     </div>
                   </Link>
                 );
               })}
             </div>
          </div>
        )}

        {/* Brand Spotlight - Hidden by request */}

        {/* Cart Success Toast */}
        {showCartSuccess && (
          <div className="sticky bottom-[120px] mt-auto z-[100] w-full bg-emerald-500/95 backdrop-blur border border-emerald-400 text-white px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-300">
            <Check size={20} strokeWidth={3} className="text-white shrink-0" /> 
            <span className="truncate">Successfully added to cart</span>
          </div>
        )}
        {showOrderSuccess && (
          <div className="sticky bottom-[120px] mt-auto z-[100] w-full bg-emerald-600/95 backdrop-blur border border-emerald-500 text-white px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-300">
            <Check size={20} strokeWidth={3} className="text-white shrink-0" /> 
            <span className="truncate">Order confirmed successfully</span>
          </div>
        )}
      </aside>
    );
  }

  // --- DEFAULT FALLBACK SIDEBAR ---
  return (
    <aside className="h-full flex flex-col gap-8 pb-20">

      {/* Community / Rewards CTA */}
      <div className="bg-indigo-600 rounded-lg p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:opacity-80 transition-opacity duration-700" />
         <h3 className="font-bold text-lg mb-2 relative z-10">Elite Rewards</h3>
         <p className="text-indigo-100 text-[11px] mb-4 leading-relaxed relative z-10">
           Complete challenges and contribute to earn exclusive tokens and badges.
         </p>
         <Link href="/achievements" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors relative z-10">
           Explore Tasks <ArrowRight size={14} />
         </Link>
      </div>

      {/* Connect with Founder CTA */}
      <div className="bg-slate-900 rounded-lg p-6 text-white shadow-xl relative overflow-hidden group border border-slate-800">
         <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors duration-700" />
         <h3 className="font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
            Let&apos;s Connect
         </h3>
         <p className="text-slate-400 text-[11px] mb-4 leading-relaxed relative z-10">
           Have questions, business inquiries, or found a bug? Reach out to the founder directly!
         </p>
         <div className="flex flex-wrap gap-2 relative z-10">
            <a 
              href="mailto:imranhossanrahul.dev@gmail.com" 
              onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText("imranhossanrahul.dev@gmail.com");
                  showToast("Email address copied to clipboard!", "success");
                  window.location.href = "mailto:imranhossanrahul.dev@gmail.com";
              }}
              className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-red-400 transition-colors cursor-pointer" 
              title="Email"
            >
                <Mail className="w-4 h-4" />
            </a>
            <a href="https://wa.me/8801951768360" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-full transition-colors shadow-sm" title="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
            </a>
            <a href="https://www.linkedin.com/in/imran-hossan-584383411/" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-blue-400 transition-colors" title="LinkedIn">
                <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://github.com/Imran-Hossan-Rahul" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="GitHub">
                <Github className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61591711877853" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-blue-500 transition-colors" title="Facebook">
                <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/codalinaglobal/" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-pink-500 transition-colors" title="Instagram">
                <Instagram className="w-4 h-4" />
            </a>
            <a href="https://x.com/codalinaglobal" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-blue-400 transition-colors" title="Twitter / X">
                <Twitter className="w-4 h-4" />
            </a>
            <a href="https://bikroy.com/sellerpage-AWv0rx64T4yTmhkp7goj4Zis" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-green-500 transition-colors" title="Bikroy">
                <Store className="w-4 h-4" />
            </a>
            <a href="https://imran-hossan-rahul-dev.vercel.app/" target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full text-slate-300 hover:text-indigo-400 transition-colors" title="Portfolio">
                <Globe className="w-4 h-4" />
            </a>
         </div>
      </div>
    </aside>
  );
}



