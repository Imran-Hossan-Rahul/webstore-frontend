"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  BookOpen,
  Layers,
  Users,
  UserCheck,
  Github,
  Globe,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/utils/api";

// ─── Module-level cache ───────────────────────────────────────────────────────
const CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;
const inflight = new Map();

async function fetchCraftsmanData(userId) {
  const cached = CACHE.get(userId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.data;
  if (inflight.has(userId)) return inflight.get(userId);

  const promise = api
    .get(`/craftsman/${userId}`)
    .then((res) => {
      if (res.success && res.data) {
        const payload = {
          profile: res.data,
          isFullCraftsman: res.isFullCraftsman || false,
          isFollowing: res.isFollowing || false,
          followerCount: res.followerCount || 0,
        };
        CACHE.set(userId, { data: payload, ts: Date.now() });
        inflight.delete(userId);
        return payload;
      }
      inflight.delete(userId);
      return null;
    })
    .catch(() => { inflight.delete(userId); return null; });

  inflight.set(userId, promise);
  return promise;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CraftsmanHoverCard({
  userId,
  username,
  avatarUrl,
  displayName,
  children,
  wrapperDisplay = "inline-block",
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);   
  const [isRendered, setIsRendered] = useState(false); // Controls entry animation
  const [isClosing, setIsClosing] = useState(false); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const triggerRef  = useRef(null);
  const cardRef     = useRef(null);
  const showTimer   = useRef(null);
  const hideTimer   = useRef(null);
  const closingTimer = useRef(null);
  const rafId       = useRef(null);
  const isInsideCard = useRef(false);

  // ── Position compute ─────────────────────────────────────────────────────
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const CARD_W = 320;
    const GAP    = 8;
    
    // Get actual height if card is already rendered, otherwise use a safe default
    const actualHeight = cardRef.current ? cardRef.current.offsetHeight : 360;

    let left = rect.left;
    let top  = rect.bottom + GAP;

    // Horizontal boundaries
    if (left + CARD_W > window.innerWidth - 16) {
      left = window.innerWidth - CARD_W - 16;
    }
    if (left < 16) left = 16;

    // Vertical boundaries & Flip logic
    if (top + actualHeight > window.innerHeight - 16) {
      // Not enough space below, show above
      top = rect.top - actualHeight - GAP;
      
      // If it still overflows the top of the viewport
      if (top < 16) {
        // If there's more space below than above, stick to below even with overflow
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow > spaceAbove) {
          top = rect.bottom + GAP;
        } else {
          top = 16; // Pin to top
        }
      }
    }

    setPosition({ top, left });
  }, []);

  // Re-calculate position whenever the card visibility or content changes
  useLayoutEffect(() => {
    if (visible && !isClosing) {
      computePosition();
    }
  }, [visible, isClosing, computePosition, data, loading]);

  // ── Scroll/Resize: update position ───────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(computePosition);
  }, [computePosition]);

  useEffect(() => {
    if (!visible || isClosing) return;
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    
    const scrollParents = getScrollParents(triggerRef.current);
    scrollParents.forEach((el) =>
      el.addEventListener("scroll", handleScroll, { passive: true })
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      scrollParents.forEach((el) =>
        el.removeEventListener("scroll", handleScroll)
      );
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [visible, isClosing, handleScroll]);

  // Handle entry animation trigger
  useEffect(() => {
    if (visible && !isClosing) {
      const frame = requestAnimationFrame(() => setIsRendered(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setIsRendered(false);
    }
  }, [visible, isClosing]);

  // ── Data fetch ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId || data) return;
    setLoading(true);
    const result = await fetchCraftsmanData(userId);
    if (result) {
      setData(result);
      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount);
    }
    setLoading(false);
  }, [userId, data]);

  // ── Show / Hide logic ────────────────────────────────────────────────────
  const openCard = useCallback(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(closingTimer.current);
    setIsClosing(false);
    computePosition();
    setVisible(true);
    loadData();
  }, [computePosition, loadData]);

  const closeCard = useCallback(() => {
    clearTimeout(showTimer.current);
    setIsClosing(true);
    closingTimer.current = setTimeout(() => {
      setVisible(false);
      setIsClosing(false);
      setIsRendered(false);
    }, 150); 
  }, []);

  const handleTriggerEnter = useCallback(() => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(openCard, 200);
  }, [openCard]);

  const handleTriggerLeave = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isInsideCard.current) closeCard();
    }, 150);
  }, [closeCard]);

  const handleCardEnter = useCallback(() => {
    isInsideCard.current = true;
    clearTimeout(hideTimer.current);
    clearTimeout(showTimer.current);
    setIsClosing(false);
    clearTimeout(closingTimer.current);
  }, []);

  const handleCardLeave = useCallback(() => {
    isInsideCard.current = false;
    hideTimer.current = setTimeout(closeCard, 200);
  }, [closeCard]);

  const handleTriggerClick = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Fallback username if not provided
    const finalUsername = username || (data?.profile?.userId?.username) || (displayName || "").replace(/\s+/g, "").toLowerCase();
    
    if (finalUsername) {
      router.push(`/u/${finalUsername}`);
    } else if (userId) {
      router.push(`/u/${userId}`); 
    }
    
    // Close the card immediately on click
    closeCard();
  }, [username, data, displayName, userId, router, closeCard]);

  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
    clearTimeout(closingTimer.current);
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, []);

  // ── Follow action ────────────────────────────────────────────────────────
  const handleFollow = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!userId || followLoading) return;
    setFollowLoading(true);
    try {
      const res = await api.post(`/craftsman/${userId}/follow`);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowerCount(res.followerCount);
        CACHE.delete(userId);
      }
    } catch (_) {}
    setFollowLoading(false);
  };

  const profile     = data?.profile;
  const finalAvatar =
    avatarUrl || profile?.profilePicture || profile?.userId?.profilePicture || null;

  const cardStyle = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 9999,
    width: 320,
    opacity: (isRendered && !isClosing) ? 1 : 0,
    transform: (isRendered && !isClosing) ? "translateY(0)" : "translateY(-8px)",
    transition: isClosing
      ? "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)"
      : "opacity 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
    pointerEvents: isClosing ? "none" : "auto",
    willChange: "transform, opacity"
  };

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
      onClick={handleTriggerClick}
      style={{ display: wrapperDisplay, verticalAlign: "top" }}
      className="cursor-pointer"
    >
      {children}


      {visible && createPortal(
        <div
          ref={cardRef}
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
          style={cardStyle}
          className="bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {loading && !profile && (
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full shrink-0 shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 rounded-md w-2/3 shimmer" />
                  <div className="h-3 rounded-md w-1/3 shimmer" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 rounded-md w-full shimmer" />
                <div className="h-3 rounded-md w-4/5 shimmer" />
              </div>
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl shimmer" />
                ))}
              </div>
            </div>
          )}

          {profile && (
            <div>
              <div className="h-[2px] w-full" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm shrink-0 bg-slate-50 dark:bg-white/5">
                    {finalAvatar ? (
                      <Image
                        src={finalAvatar}
                        fill
                        className="object-cover"
                        alt={profile.displayName || "Craftsman"}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white font-bold text-xl">
                        {(profile.displayName || displayName || "C")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
                        {profile.displayName || displayName}
                      </span>
                      {profile.isVerified && (
                        <CheckCircle2 size={14} className="text-indigo-600 shrink-0" strokeWidth={1.5} />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">
                      @{username}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                      <span className="font-bold text-slate-800 dark:text-gray-100">
                        {followerCount.toLocaleString()}
                      </span>{" "}
                      follower{followerCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isFollowing
                        ? "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-white/10"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    } ${followLoading ? "opacity-60 cursor-wait" : ""}`}
                  >
                    {isFollowing
                      ? <UserCheck size={13} strokeWidth={1.5} />
                      : <Users size={13} strokeWidth={1.5} />
                    }
                    {followLoading ? "" : isFollowing ? "Following" : "Follow"}
                  </button>
                </div>

                {profile.bio && (
                  <p className="text-slate-600 dark:text-gray-300 text-[13px] leading-relaxed mb-4 line-clamp-2">
                    {profile.bio}
                  </p>
                )}

                {(profile.location || profile.socialLinks?.website || profile.socialLinks?.github) && (
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-4">
                    {profile.location && (
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <MapPin size={12} strokeWidth={1.5} className="text-slate-400" />
                        {profile.location}
                      </span>
                    )}
                    {profile.socialLinks?.github && (
                      <a
                        href={`https://github.com/${profile.socialLinks.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-500 font-medium transition-colors"
                      >
                        <Github size={12} strokeWidth={1.5} className="text-slate-400" />
                        {profile.socialLinks.github}
                      </a>
                    )}
                    {profile.socialLinks?.website && (
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-emerald-500 font-medium transition-colors truncate max-w-[140px]"
                      >
                        <Globe size={12} strokeWidth={1.5} className="text-slate-400" />
                        {profile.socialLinks.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: <Eye size={14} strokeWidth={1.5} className="text-emerald-500" />, val: profile.totalViews || 0, label: "Views" },
                    { icon: <Heart size={14} strokeWidth={1.5} className="text-pink-500" />, val: profile.totalLikes || 0, label: "Likes" },
                    { icon: <BookOpen size={14} strokeWidth={1.5} className="text-indigo-600" />, val: profile.totalCodex || 0, label: "Codex" },
                    { icon: <Layers size={14} strokeWidth={1.5} className="text-purple-500" />, val: profile.totalArtifacts || 0, label: "Assets" },
                  ].map(({ icon, val, label }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center justify-center bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl py-3 px-1"
                    >
                      {icon}
                      <span className="text-[13px] font-bold text-slate-900 dark:text-white mt-1.5 tabular-nums">
                        {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg border border-slate-100 dark:border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      , document.body)}

      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg, 
            rgba(0,0,0,0.03) 25%, 
            rgba(0,0,0,0.08) 50%, 
            rgba(0,0,0,0.03) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-sweep 1.5s infinite;
        }
        .dark .shimmer {
          background: linear-gradient(
            90deg, 
            rgba(255,255,255,0.03) 25%, 
            rgba(255,255,255,0.08) 50%, 
            rgba(255,255,255,0.03) 75%
          );
        }
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </span>
  );
}

function getScrollParents(el) {
  const parents = [];
  if (!el) return parents;
  let node = el.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflow = style.overflow + style.overflowY + style.overflowX;
    if (/auto|scroll/.test(overflow)) parents.push(node);
    node = node.parentElement;
  }
  return parents;
}



