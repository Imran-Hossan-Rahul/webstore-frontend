"use client";
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import { DashboardContext } from "@/app/(dashboard)/layout";
import JobDetailsContent from "@/components/dashboard/jobs/JobDetailsContent";
import EmptyState from "@/components/ui/EmptyState";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, isGuest, requireAuth } = useContext(DashboardContext) || {};
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      if (res.success) {
        setJob(res.data);
      } else {
        setError(res.message || "Job not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded-xl" />
        <div className="h-[500px] bg-slate-100 dark:bg-white/5 rounded-[40px]" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="pt-20">
        <EmptyState 
          type="error" 
          title="Oops! Job not found" 
          description={error || "The job you are looking for does not exist or has been removed."} 
        />
      </div>
    );
  }

  // Find if current user has applied
  const myApplication = !isGuest && user && job.applicants?.find(a => {
    const applicantId = a.user?._id?.toString() || a.user?.toString();
    const currentUserId = user._id?.toString();
    return applicantId === currentUserId;
  });
  
  const myProposalStage = myApplication?.stage;
  const isOwner = !isGuest && user && job.patron && (job.patron?._id || job.patron) === user._id;

  return (
    <JobDetailsContent 
      job={job}
      isGuest={isGuest}
      onRequireAuth={requireAuth}
      myProposalStage={myProposalStage}
      myApplication={myApplication}
      isOwner={isOwner}
    />
  );
}
