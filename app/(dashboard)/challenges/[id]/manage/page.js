"use client";
import React, { useEffect, useState } from "react";
import ManageChallenge from "@/components/dashboard/challenges/ManageChallenge";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { Loader2 } from "lucide-react";
import { useContext } from "react";

export default function ChallengeManagePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(DashboardContext) || {};
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (id) {
      fetchChallenge();
    }
  }, [id, user, authLoading]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challenges/${id}`);
      if (res.success) {
        // Security Check: Only craftsman can access this page
        if (res.data.craftsman?._id !== user?._id && res.data.craftsman !== user?._id && user?.role !== 'admin') {
           router.push(`/challenges/${id}`);
           return;
        }
        setChallenge(res.data);
      } else {
        router.push("/challenges");
      }
    } catch (error) {
      console.error(error);
      router.push("/challenges");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Authorizing Access...</p>
      </div>
    );
  }

  return <ManageChallenge challengeId={id} />;
}
