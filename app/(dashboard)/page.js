"use client";
import React, { useContext } from "react";
import DashboardFeed from "@/components/dashboard/DashboardFeed";
import { DashboardContext } from "./layout";

export default function Home() {
  const { isGuest, requireAuth } = useContext(DashboardContext) || { isGuest: true };

  return (
    <DashboardFeed 
      isGuest={isGuest} 
      onRequireAuth={requireAuth} 
    />
  );
}
