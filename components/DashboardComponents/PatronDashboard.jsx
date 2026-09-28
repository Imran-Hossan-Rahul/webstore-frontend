"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { Zap, Rocket, Users } from "lucide-react";

export default function PatronDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    postedOpportunities: 0,
    activeDevlogs: 0,
    hiredEngineers: 0,
  });
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: Implement patron dashboard API
      // const res = await api.get("/patron/dashboard");
      // setStats(res.stats);
      // setRecentOpportunities(res.opportunities);
      
      setStats({
        postedOpportunities: 0,
        activeDevlogs: 0,
        hiredEngineers: 0,
      });
      setRecentOpportunities([]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
        <div className="text-center py-20">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <h1 className="text-4xl font-bold text-black mb-8">patron dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Posted Opportunities" value={stats.postedOpportunities} icon={<Zap className="text-brand-blue" size={32} />} />
        <StatCard title="Active Devlogs" value={stats.activeDevlogs} icon={<Rocket className="text-brand-blue" size={32} />} />
        <StatCard title="Hired Craftsmen" value={stats.hiredEngineers} icon={<Users className="text-brand-teal" size={32} />} />
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-black mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push("/opportunities?action=create")}
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-slate-900 transition-colors"
          >
            + Post Opportunity
          </button>
          <button
            onClick={() => router.push("/opportunities")}
            className="px-6 py-3 bg-brand-surface text-black rounded-full font-medium border-2 border-black hover:bg-brand-cloud transition-colors"
          >
            Browse Craftsmen
          </button>
        </div>
      </div>

      {/* Recent Opportunities */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Your Opportunities</h2>
          <button
            onClick={() => router.push("/opportunities")}
            className="text-brand-slate dark:text-slate-300 hover:text-black transition-colors"
          >
            View All →
          </button>
        </div>
        {recentOpportunities.length === 0 ? (
          <p className="text-brand-slate dark:text-slate-300">No opportunities posted yet. Create your first one!</p>
        ) : (
          <div className="space-y-4">
            {recentOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-brand-surface rounded-[26px] p-6 shadow-sm hover:shadow-sm transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-black mb-2">{opp.title}</h3>
                <p className="text-brand-slate dark:text-slate-300 mb-4">{opp.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-black">{opp.budget}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{opp.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-brand-surface rounded-[26px] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-slate dark:text-slate-300 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}


