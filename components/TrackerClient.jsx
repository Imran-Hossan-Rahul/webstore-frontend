"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_COOKIE = "visitor_id_v4";
const SESSION_COOKIE = "session_id_v4";
const SESSION_EXPIRY_HOURS = 2;
const ENGAGEMENT_INTERVAL_MS = 15000;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// -------------------- Cookie Helpers --------------------
function getCookie(name) {
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? decodeURIComponent(match.pop()) : null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// -------------------- Send Helper --------------------
async function send(url, payload) {
  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, blob);
    } else {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (e) {
    console.warn("Tracker send error:", e);
  }
}

// -------------------- Duplicate Prevention --------------------
const recentEvents = new Map();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// -------------------- Main Tracker Component --------------------
export default function TrackerClient({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageViewsRef = useRef(0);

  // 👉 Real full session start time (never resets)
  const sessionStartRef = useRef(Date.now());

  // 👉 Engagement timer (resets only every 15s)
  const lastEngagementRef = useRef(Date.now());

  const activeTabKey = "active_tab_tracker";

  useEffect(() => {
    // -------------------- Visitor ID --------------------
    let visitorId = getCookie(VISITOR_COOKIE);
    if (!visitorId) {
      visitorId =
        "visitor_" +
        Math.random().toString(36).slice(2) +
        Date.now().toString(36);
      setCookie(VISITOR_COOKIE, visitorId);
    }

    // -------------------- Session ID --------------------
    let sessionId = getCookie(SESSION_COOKIE);

    const now = () => new Date().toISOString();

    if (!sessionId) {
      sessionId =
        "session_" +
        Math.random().toString(36).slice(2) +
        Date.now().toString(36);

      setCookie(SESSION_COOKIE, sessionId, SESSION_EXPIRY_HOURS / 24);

      // Reset real session start when new session
      sessionStartRef.current = Date.now();
    }

    // -------------------- UTM --------------------
    const utm = {
      utm_source: searchParams.get("utm_source") || null,
      utm_medium: searchParams.get("utm_medium") || null,
      utm_campaign: searchParams.get("utm_campaign") || null,
      utm_term: searchParams.get("utm_term") || null,
      utm_content: searchParams.get("utm_content") || null,
    };
    const referrer = document.referrer || "Direct";

    // -------------------- 1️⃣ Visit (SPA + First Visit) --------------------
    const sendVisit = () => {
      send(`${API_BASE_URL}/track/visit`, {
        visitorId,
        sessionId,
        landingPath: pathname + window.location.search,
        referrer,
        utm,
        userAgent: navigator.userAgent,
        timestamp: now(),
      });
    };
    sendVisit();

    // -------------------- 2️⃣ Pageview --------------------
    const sendPageview = () => {
      pageViewsRef.current += 1;

      const key = `pageview_${pathname}_${now()}`;
      if (recentEvents.has(key)) return;
      recentEvents.set(key, true);

      send(`${API_BASE_URL}/track/event`, {
        visitorId,
        sessionId,
        eventType: "pageview",
        page: pathname,
        element: null,
        value: null,
        timestamp: now(),
      });
    };
    sendPageview();

    // -------------------- 3️⃣ Click Tracking --------------------
    const clickHandler = (e) => {
      const target = e.target.closest("[data-track]");
      if (!target) return;

      const key = `click_${target.getAttribute("data-track")}_${now()}`;
      if (recentEvents.has(key)) return;
      recentEvents.set(key, true);

      send(`${API_BASE_URL}/track/event`, {
        visitorId,
        sessionId,
        eventType: "click",
        page: pathname,
        element: target.getAttribute("data-track") || "unknown",
        value: target.innerText?.slice(0, 200) || null,
        timestamp: now(),
      });
    };
    document.addEventListener("click", clickHandler);

    // -------------------- 4️⃣ Engagement Every 15 Seconds --------------------
    const sendEngagement = () => {
      const elapsed = Date.now() - lastEngagementRef.current;

      send(`${API_BASE_URL}/track/event`, {
        visitorId,
        sessionId,
        eventType: "custom",
        page: pathname,
        element: "time_on_page",
        value: elapsed,
        timestamp: now(),
      });

      lastEngagementRef.current = Date.now();
    };

    const engagementInterval = setInterval(() => {
      if (document.visibilityState === "visible") sendEngagement();
    }, ENGAGEMENT_INTERVAL_MS);

    // -------------------- 5️⃣ Session End (Real Duration) --------------------
    const endSession = () => {
      const fullDuration = Date.now() - sessionStartRef.current;

      send(`${API_BASE_URL}/track/session`, {
        visitorId,
        sessionId,
        endedAt: now(),
        duration: fullDuration,
        pageViews: pageViewsRef.current,
      });

      deleteCookie(SESSION_COOKIE);
    };

    window.addEventListener("beforeunload", endSession);

    // -------------------- 6️⃣ Multi-Tab Protection --------------------
    localStorage.setItem(activeTabKey, now());
    const tabCheckInterval = setInterval(() => {
      localStorage.setItem(activeTabKey, now());
    }, 5000);

    window.addEventListener("storage", (e) => {
      if (e.key === activeTabKey) {
        if (!getCookie(SESSION_COOKIE)) {
          sessionId =
            "session_" +
            Math.random().toString(36).slice(2) +
            Date.now().toString(36);

          setCookie(SESSION_COOKIE, sessionId, SESSION_EXPIRY_HOURS / 24);

          sessionStartRef.current = Date.now();

          sendVisit();
          sendPageview();
        }
      }
    });

    // -------------------- Cleanup --------------------
    return () => {
      clearInterval(engagementInterval);
      clearInterval(tabCheckInterval);
      document.removeEventListener("click", clickHandler);
      window.removeEventListener("beforeunload", endSession);
    };
  }, [pathname, searchParams]);

  return children || null;
}
