"use client";
import React, { useContext } from "react";
import TemplatesFeed from "./TemplatesFeed";
import { DashboardContext } from "../DashboardLayoutWrapper";

export default function TemplatesDashboard() {
  const { searchQuery } = useContext(DashboardContext) || { searchQuery: "" };

  return (
    <>
      {/* Background Calm Gradient - Reduced Opacity for cleaner look */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-screen">
          <div className="absolute top-[5%] left-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-[5%] right-[10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 w-full">
         <TemplatesFeed searchQuery={searchQuery} />
      </div>
    </>
  );
}
