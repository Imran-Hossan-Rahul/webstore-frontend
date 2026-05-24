"use client";
import React, { useContext } from "react";
import DashboardFeed from "@/components/dashboard/DashboardFeed";
import { DashboardContext } from "./layout";

export default function Home() {
  const { isGuest, requireAuth, user } = useContext(DashboardContext) || { isGuest: true };

  return (
    <DashboardFeed 
      user={user}
      isGuest={isGuest} 
      onRequireAuth={requireAuth} 
    />
  );
}
