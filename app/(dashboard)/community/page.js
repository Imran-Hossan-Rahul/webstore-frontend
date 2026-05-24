"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import CommunityMain from "@/components/dashboard/community/CommunityMain";

export default function CommunityPage() {
  const router = useRouter();

  // Temporarily hide page by redirecting
  useEffect(() => {
    router.replace("/");
  }, [router]);

  // Always return loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}
