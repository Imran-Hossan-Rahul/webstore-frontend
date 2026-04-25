"use client";
import React, { useContext } from "react";
import BlogsFeed from "./BlogsFeed";
import { DashboardContext } from "../DashboardLayoutWrapper";

export default function BlogsDashboard() {
  const { searchQuery, isGuest } = useContext(DashboardContext) || { searchQuery: "", isGuest: false };

  return (
    <>
      {/* Background Calm Gradient - Blog Vibe */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-screen">
          <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[160px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[50%] h-[50%] bg-orange-400/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full">
         <BlogsFeed searchQuery={searchQuery} isGuest={isGuest} />
      </div>
    </>
  );
}
