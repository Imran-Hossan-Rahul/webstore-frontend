"use client";

// ==========================================
// TrackerPatron.jsx — ELITE TRACKING ENGINE
// Performance Optimized: Batching & Throttling
// ==========================================

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_COOKIE = "visitor_id_v4";
const SESSION_COOKIE = "session_id_v4";
const SESSION_EXPIRY_HOURS = 2;
const HEARTBEAT_INTERVAL_MS = 5000;
const FLUSH_INTERVAL_MS = 5000; // Batch send every 5s
const IDLE_THRESHOLD_MS = 30000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ==================== Helpers ====================
function getCookie(name) {
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? decodeURIComponent(match.pop()) : null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
}

// Optimized Beacon Send
async function sendBatch(events) {
  if (!events.length) return;
  const url = `${API_BASE_URL}/track/batch`;
  const blob = new Blob([JSON.stringify({ events })], { type: "application/json" });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob);
  } else {
    try {
      await fetch(url, { method: "POST", body: blob, keepalive: true });
    } catch (e) {}
  }
}

// Throttle Helper
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ==================== MAIN TRACKER COMPONENT ====================
export default function TrackerPatron({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Refs for tracking state
  const eventQueue = useRef([]);
  const visitorIdRef = useRef(null);
  const sessionIdRef = useRef(null);
  
  const pageViewsRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const pageLoadTimeRef = useRef(Date.now());
  const idleTimerRef = useRef(null);
  const isIdleRef = useRef(false);
  const idleStartRef = useRef(null);
  const totalIdleMsRef = useRef(0);
  const totalActiveMsRef = useRef(0);
  const clickCountRef = useRef(0);
  const maxScrollDepthRef = useRef(0);
  const scrollMilestonesHitRef = useRef(new Set());

  // Flush Queue logic
  const flushQueue = () => {
    if (eventQueue.current.length > 0) {
      const batch = [...eventQueue.current];
      eventQueue.current = [];
      sendBatch(batch);
    }
  };

  const queueEvent = (eventType, metadata = {}) => {
    eventQueue.current.push({
      visitorId: visitorIdRef.current,
      sessionId: sessionIdRef.current,
      eventType,
      page: pathname,
      timestamp: new Date().toISOString(),
      timeOnPage: Date.now() - pageLoadTimeRef.current,
      ...metadata
    });
    
    // If critical event (purchase, error), flush immediately
    if (["purchase", "api_error", "js_error"].includes(eventType)) {
      flushQueue();
    }
  };

  useEffect(() => {
    // 1. Initialization
    visitorIdRef.current = getCookie(VISITOR_COOKIE);
    if (!visitorIdRef.current) {
      visitorIdRef.current = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      setCookie(VISITOR_COOKIE, visitorIdRef.current);
    }

    sessionIdRef.current = getCookie(SESSION_COOKIE);
    if (!sessionIdRef.current) {
      sessionIdRef.current = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      setCookie(SESSION_COOKIE, sessionIdRef.current, SESSION_EXPIRY_HOURS / 24);
    }

    pageLoadTimeRef.current = Date.now();
    scrollMilestonesHitRef.current = new Set();
    
    // Initial Pageview
    pageViewsRef.current += 1;
    queueEvent("pageview");

    // 2. Throttled Scroll Tracking
    const handleScroll = throttle(() => {
      const scrollPct = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      const depth = Math.min(scrollPct, 100) || 0;
      if (depth > maxScrollDepthRef.current) maxScrollDepthRef.current = depth;

      [25, 50, 75, 100].forEach(milestone => {
        if (depth >= milestone && !scrollMilestonesHitRef.current.has(milestone)) {
          scrollMilestonesHitRef.current.add(milestone);
          queueEvent(`scroll_${milestone}`, { scrollDepth: milestone, scrollY: window.scrollY });
        }
      });
      resetIdleTimer();
    }, 200);

    // 3. Click Tracking
    const handleClick = (e) => {
      clickCountRef.current += 1;
      resetIdleTimer();

      const target = e.target.closest("[data-track], button, a, [role='button']");
      if (target) {
        queueEvent("click", {
          element: target.getAttribute("data-track") || target.tagName.toLowerCase(),
          elementText: target.innerText?.slice(0, 50),
          position: { x: e.clientX, y: e.clientY }
        });
      }
    };

    // 4. Idle Detection
    const resetIdleTimer = () => {
      if (isIdleRef.current) {
        const idleMs = idleStartRef.current ? Date.now() - idleStartRef.current : 0;
        totalIdleMsRef.current += idleMs;
        isIdleRef.current = false;
        queueEvent("idle_end", { idleMs });
      }
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        idleStartRef.current = Date.now();
        queueEvent("idle_start");
      }, IDLE_THRESHOLD_MS);
    };

    // 5. Periodic Flush & Heartbeat
    const flushInterval = setInterval(flushQueue, FLUSH_INTERVAL_MS);
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        totalActiveMsRef.current += HEARTBEAT_INTERVAL_MS;
        queueEvent("heartbeat", { activeTimeMs: HEARTBEAT_INTERVAL_MS });
      }
    }, HEARTBEAT_INTERVAL_MS);

    // Listeners
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick);
    window.addEventListener("beforeunload", flushQueue);

    // Cleanup
    return () => {
      clearInterval(flushInterval);
      clearInterval(heartbeatInterval);
      clearTimeout(idleTimerRef.current);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", flushQueue);
      flushQueue(); // Final attempt to send remaining events
    };
  }, [pathname]);

  return children || null;
}
