"use client";
import React from "react";
import { Trophy, Clock, Users, ArrowRight, Zap } from "lucide-react";

export const ChallengeCard = ({ challenge }) => {
  const timeLeft = new Date(challenge.endDate) - new Date();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
        
        {/* Top Image / Gradient Area */}
        <div className="h-48 relative overflow-hidden">
            {challenge.coverImage ? (
                <img src={challenge.coverImage} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center relative">
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <Trophy className="text-white/20 transform rotate-12" size={120} />
                </div>
            )}
            
            {/* Prize Badge */}
            <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-orange-500/30 flex items-center gap-2 shadow-lg">
                <Trophy size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900 dark:text-white">{challenge.prize}</span>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                     isExpired 
                     ? "bg-gray-800 text-gray-400" 
                     : "bg-green-500 text-white shadow-lg shadow-green-500/40"
                 }`}>
                     {isExpired ? "Completed" : "Active"}
                 </span>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-orange-500 transition-colors">
                    {challenge.title}
                </h3>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6">
                {challenge.description}
            </p>

            {/* Stats Row */}
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                    <Clock size={16} className={daysLeft < 3 ? "text-red-500" : "text-gray-400"} />
                    <span>{isExpired ? "Ended" : `${daysLeft} days left`}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    <span>{challenge.submissions?.length || 0} participants</span>
                </div>
            </div>

            {/* Action */}
            <button 
                disabled={isExpired}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isExpired 
                    ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed" 
                    : "bg-black dark:bg-white text-white dark:text-black hover:transform hover:scale-[1.02] shadow-xl shadow-orange-500/20"
                }`}
            >
                {isExpired ? (
                    "View Winners"
                ) : (
                    <>
                       <Zap size={18} className="fill-current" /> Join Challenge
                    </>
                )}
            </button>
        </div>
    </div>
  );
};
