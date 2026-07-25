"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Initializing session");

  useEffect(() => {
    // Cycle through professional status messages
    const statuses = [
      "Verifying credentials",
      "Syncing profile state",
      "Establishing secure tunnel",
      "Finalizing redirection"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setStatus(statuses[i % statuses.length]);
      i++;
    }, 800);

    const token       = searchParams.get("token");
    const csrf        = searchParams.get("csrf");
    const userDataStr = searchParams.get("user");
    const error       = searchParams.get("error");

    if (error) {
      clearInterval(interval);
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (userDataStr) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        
        // Inject token into userData so api.js getAccessToken() can find it
        if (token) {
          userData.accessToken = token;
        }
        
        localStorage.setItem("user",                JSON.stringify(userData));
        localStorage.setItem("hasCraftsmanAccount", String(userData.hasCraftsmanAccount));
        localStorage.setItem("userId",              userData._id);
        
        if (token) localStorage.setItem("token", token);
        if (csrf) localStorage.setItem("XSRF-TOKEN", csrf);

        // Delay slightly for the "70k dollar" smooth experience
        setTimeout(() => {
          clearInterval(interval);
          window.location.href = "/";
        }, 2000);
      } catch (err) {
        clearInterval(interval);
        console.error("[AuthCallback] Parse error:", err);
        router.push("/auth/login?error=server_error");
      }
      return;
    }

    // No data case
    setTimeout(() => {
      clearInterval(interval);
      router.push("/auth/login?error=token_failed");
    }, 3000);

    return () => clearInterval(interval);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="w-full max-w-[280px] space-y-12">
        {/* Logo or Brand Placeholder */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-white animate-pulse" />
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight uppercase opacity-50">
              Authentication
            </h1>
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
              {status}...
            </p>
          </div>

          {/* Precision Loading Bar */}
          <div className="relative h-[2px] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-zinc-950 dark:bg-white w-1/3 animate-[loading_1.5s_infinite_ease-in-out]" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em]">
            Secure Handshake
          </p>
        </div>
      </div>

      {/* Global CSS for the custom loading animation if not in tailwind config */}
      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
