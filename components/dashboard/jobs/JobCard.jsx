"use client";
import React from "react";
import { MapPin, Clock, DollarSign, Briefcase, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const JobCard = ({ job, onClick }) => {
  const isHourly = job.budget?.type === "hourly";
  // Format Budget
  const budgetDisplay = isHourly 
    ? `$${job.budget?.min || 0} - $${job.budget?.max || 0}/hr`
    : `$${job.budget?.min || 0} - $${job.budget?.max || 0}`;

  return (
    <div 
        onClick={onClick}
        className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-2xl p-6 hover:shadow-xl hover:border-purple-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
        {/* Hover Gradient Accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        
        <div className="flex gap-4 items-start">
            {/* Client Logo */}
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-white/10">
                {job.client?.avatar ? (
                    <img src={job.client.avatar} alt={job.client.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                        {job.client?.name?.[0]}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            <span>{job.client?.name}</span>
                            {/* Verified Badge Mock */}
                            <CheckCircle2 size={14} className="text-blue-500" />
                        </div>
                    </div>
                    
                    {/* Time / Status */}
                    <div className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                        {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                        <DollarSign size={12} /> {budgetDisplay}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                        <MapPin size={12} /> {job.location || "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                        <Briefcase size={12} /> {job.level || "Expert"}
                    </span>
                </div>

                {/* Skills */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills?.map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
            
             {/* Hover Action */}
             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 top-1/2 -translate-y-1/2 hidden md:block">
                  <button className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-full shadow-lg transform translate-x-4 group-hover:translate-x-0 transition-all">
                      <ArrowUpRight size={20} />
                  </button>
             </div>
        </div>
    </div>
  );
};
