"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";

export default function OpportunitiesMain() {
  const searchParams = useSearchParams();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, my-opportunities

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      // TODO: Implement opportunities API
      // const res = await api.get(`/opportunities?filter=${filter}`);
      // setOpportunities(res.data);
      
      // Mock data for now
      setOpportunities([
        {
          id: 1,
          title: "React Developer Needed",
          description: "Looking for an experienced React developer...",
          budget: "$5000",
          skills: ["React", "Node.js"],
          postedBy: "Company ABC",
          postedDate: "2 days ago",
          status: "open",
        },
      ]);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard absolute left-20 top-16 md:w-[1800px] pr-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">Opportunities</h1>
          <p className="text-gray-600">
            Find projects and connect with clients or creators
          </p>
        </div>
        {/* All users can post opportunities */}
        <button
          onClick={() => window.location.href = "/opportunities?action=create"}
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          + Post Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {["all", "open", "my-opportunities"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              filter === f
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {f.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="text-center py-20">Loading...</div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          No opportunities found. Check back later!
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity }) {
  return (
    <div className="bg-white rounded-[26px] p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-black mb-2">
            {opportunity.title}
          </h3>
          <p className="text-gray-600 mb-4">{opportunity.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-black mb-1">
            {opportunity.budget}
          </div>
          <div className="text-sm text-gray-500">{opportunity.postedDate}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {opportunity.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
        <button className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}

