"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { ChallengeCard } from "./ChallengeCard";
import { Flame, Medal } from "lucide-react";

export default function ChallengesFeed() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenges = async () => {
        try {
            const res = await api.get('/challenges');
            if (res.success) {
                setChallenges(res.data);
            }
        } catch (e) {
            console.error("Challenges fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchChallenges();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-10 text-center relative">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 text-sm font-bold mb-4 border border-orange-200 dark:border-orange-500/20">
                 <Flame size={16} className="fill-orange-500" /> Weekly Competitions
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                 Level Up Your Skills 
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 block sm:inline"> & Win Prizes</span>
             </h1>
             <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                 Join thousands of developers and designers in weekly challenges. Build your portfolio, earn badges, and get hired.
             </p>
        </div>

        {/* Stats / Badges (Mock) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[ 
                { label: "Active Challenges", val: challenges.length },
                { label: "Total Participants", val: "2.4k+" },
                { label: "Prizes Awarded", val: "$15k+" },
                { label: "Community", val: "Strong" }
            ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.val}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
            {loading ? (
                <div className="col-span-full text-center py-20 text-gray-400">Loading Challenges...</div>
            ) : challenges.length > 0 ? (
                challenges.map(c => (
                    <ChallengeCard key={c._id} challenge={c} />
                ))
            ) : (
                <div className="col-span-full text-center py-20">
                    <p>No active competitions right now.</p>
                </div>
            )}
        </div>

    </div>
  );
}
