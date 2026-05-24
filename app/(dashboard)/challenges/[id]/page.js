"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import ChallengeDetailsContent from "@/components/dashboard/challenges/ChallengeDetailsContent";
import EmptyState from "@/components/ui/EmptyState";
import { Trophy } from "lucide-react";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { user, isGuest, requireAuth } = useContext(DashboardContext) || {};
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challenges/${id}`);
      if (res.success) {
        setChallenge(res.data);
      } else {
        setError(res.message || "Challenge not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load challenge details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-12 px-4 space-y-8 animate-pulse">
        <div className="h-40 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-10 w-2/3 bg-slate-200 dark:bg-white/5 rounded-xl" />
            <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-slate-100 dark:bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="pt-20">
        <EmptyState 
          type="error" 
          title="Oops! Challenge not found" 
          description={error || "The challenge you are looking for does not exist or has been removed."} 
          icon={<Trophy size={48} />}
        />
      </div>
    );
  }

  return (
    <ChallengeDetailsContent 
      challenge={challenge}
      isGuest={isGuest}
      onRequireAuth={requireAuth}
      user={user}
    />
  );
}
