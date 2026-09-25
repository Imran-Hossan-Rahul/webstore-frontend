"use client";

import { useState, useEffect } from "react";
import { api, getHasCraftsmanAccount } from "@/utils/api";
import DribbbleGrid from "@/components/HomeComponents/DribbbleGrid";
import CreateCraftsmanAccount from "./CreateCraftsmanAccount";
import { Zap } from "lucide-react";

export default function DashboardMain() {
  const hasCraftsmanAccount = getHasCraftsmanAccount();
  const [showCraftsmanForm, setShowCraftsmanForm] = useState(false);
  const [userStats, setUserStats] = useState({
    artifacts: 0,
    codex: 0,
    downloads: 0,
    views: 0,
    sales: 0,
    earnings: 0,
  });
  const [myCodex, setMyCodex] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // Fetch user's artifacts count
      const artifactsRes = await api.get("/artifact/my-artifacts");
      const artifacts = artifactsRes.data || [];

      // Calculate stats
      const totalDownloads = artifacts.reduce(
        (sum, t) => sum + (t.downloadsCount || 0),
        0
      );
      const totalViews = artifacts.reduce(
        (sum, t) => sum + (t.viewsCount || 0),
        0
      );

      // TODO: replace with user-specific codex endpoint
      const codexRes = await api.get("/codex");
      const codex = Array.isArray(codexRes) ? codexRes : codexRes?.data || [];

      setUserStats({
        artifacts: artifacts.length,
        codex: codex.length,
        downloads: totalDownloads,
        views: totalViews,
        sales: 0, // TODO: Add sales API
        earnings: 0, // TODO: Add earnings API
      });
      setMyCodex(codex.slice(0, 3));
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showCraftsmanForm) {
    return (
      <CreateCraftsmanAccount
        onSuccess={() => {
          setShowCraftsmanForm(false);
          window.location.reload(); // Reload to update hasCraftsmanAccount
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-100 px-4 py-6 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-sm text-brand-slate dark:text-slate-400">
            Jun 1 – Aug 31, {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex gap-2 text-xs md:text-sm text-brand-slate dark:text-slate-400">
          <span>EOI Sent</span>
          <span className="font-semibold text-black dark:text-white">
            {userStats.artifacts}
          </span>
          <span>New Requests</span>
          <span className="font-semibold text-black dark:text-white">
            {userStats.downloads}
          </span>
        </div>
      </div>

      {/* Craftsman Account Prompt */}
      {!hasCraftsmanAccount && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Become a Craftsman! 🚀</h2>
          <p className="mb-4">
            Unlock craftsman features: publish codex, share artifacts, and showcase your work to thousands of users.
          </p>
          <button
            onClick={() => setShowCraftsmanForm(true)}
            className="px-6 py-3 bg-white text-brand-blue rounded-full font-medium hover:bg-slate-100 transition-colors"
          >
            Create Craftsman Account
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Artifacts"
          value={userStats.artifacts}
          icon="📦"
          onClick={() => router.push("/artifacts")}
        />
        <StatCard
          title="Codex"
          value={userStats.codex}
          icon="📝"
          onClick={() => router.push("/codex-editor")}
        />
        <StatCard title="Downloads" value={userStats.downloads} icon="⬇️" />
        <StatCard title="Views" value={userStats.views} icon="👁️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5">
            <p className="text-sm font-semibold mb-4">Quick Actions</p>
            <div className="flex flex-wrap gap-3">
              {hasCraftsmanAccount && (
                <>
                  <ActionButton
                    label="Create Artifact"
                    icon="➕"
                    onClick={() => router.push("/upload")}
                  />
                  <ActionButton
                    label="Write Codex"
                    icon="✍️"
                    onClick={() => router.push("/codex-editor")}
                  />
                </>
              )}
              <ActionButton
                label="Post Opportunity"
                icon={<Zap size={14} />}
                onClick={() => router.push("/opportunities?action=create")}
              />
              <ActionButton
                label="View Profile"
                icon="👤"
                onClick={() => router.push("/settings?tab=profile")}
              />
            </div>
          </div>

          {/* Artifacts */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Artifacts</h2>
              <button
                onClick={() => router.push("/artifacts")}
                className="text-sm text-brand-slate dark:text-slate-400 hover:text-black dark:hover:text-white"
              >
                View All →
              </button>
            </div>
            <DribbbleGrid type="my-artifacts" title="" showFilters={false} />
          </div>

          {/* Codex + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Your Codex</h2>
                <button
                  onClick={() => router.push("/codex-editor")}
                  className="text-xs text-brand-slate dark:text-slate-400 hover:text-black dark:hover:text-white"
                >
                  Write →
                </button>
              </div>
              {myCodex.length === 0 ? (
                <div className="text-xs text-brand-slate dark:text-slate-400">
                  No codex yet. Share what you learn and earn.{" "}
                  <button
                    onClick={() => router.push("/codex-editor")}
                    className="underline"
                  >
                    Start writing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myCodex.map((b) => (
                    <div
                      key={b._id || b.slug || b.title}
                      className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 p-3 shadow-sm"
                    >
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {b.category || "Codex"}
                      </p>
                      <p className="text-sm font-semibold text-black dark:text-white line-clamp-2">
                        {b.title || "Untitled"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
              <div className="space-y-3 text-xs text-brand-slate dark:text-slate-400">
                <div className="rounded-2xl bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/30 border border-black/5 dark:border-white/10 p-3">
                  Downloads history placeholder. Wire API to list recent
                  downloads.
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-800/30 border border-black/5 dark:border-white/10 p-3">
                  Viewed history placeholder. Wire API to list recently viewed
                  items.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Sales & Earnings */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5 space-y-3">
            <h2 className="text-lg font-semibold">Earnings</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MiniStat
                title="Sales"
                value={userStats.sales}
                accent="from-orange-400 to-amber-500"
              />
              <MiniStat
                title="Earnings"
                value={`$${userStats.earnings.toFixed(2)}`}
                accent="from-emerald-400 to-green-500"
              />
            </div>
          </div>

          {/* Recommended */}
          <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recommended</h2>
            </div>
            <DribbbleGrid type="popular" title="" showFilters={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 ${
        onClick ? "cursor-pointer hover:bg-brand-cloud dark:hover:bg-slate-700" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-slate dark:text-slate-400 text-xs mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {value}
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-slate-900 dark:hover:bg-slate-200 transition-all duration-300"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MiniStat({ title, value, accent }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 p-3 shadow-sm">
      <p className="text-xs text-brand-slate dark:text-slate-400">{title}</p>
      <p className="text-xl font-bold text-black dark:text-white">{value}</p>
      <div className={`mt-2 h-1.5 rounded-full bg-gradient-to-r ${accent}`} />
    </div>
  );
}


