"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, HelpCircle, CheckCircle, AlertCircle, Lightbulb, Eye, Flame } from "lucide-react";
import { api } from "@/utils/api";

export default function DiscussionBadges({ item, href, initialCounts = null }) {
    const router = useRouter();
    const [liveComments, setLiveComments] = useState(item?.comments || []);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (initialCounts) return; // Skip fetching if counts are provided
        if (!item) return;

        const isPopulated = item.comments && item.comments.length > 0 && typeof item.comments[0] === 'object' && item.comments[0].feedbackType;
        
        if (!isPopulated && (item._id || item.id) && !fetched) {
            api.get(`/comments/${item._id || item.id}?limit=100`)
                .then(res => {
                    if (res.success && res.data) {
                        setLiveComments(res.data);
                    }
                    setFetched(true);
                })
                .catch(() => {});
        }
    }, [item, initialCounts, fetched]);

    const stats = [
        { id: 'comment', icon: MessageCircle, title: 'Comments' },
        { id: 'question', icon: HelpCircle, title: 'Questions' },
        { id: 'answer', icon: CheckCircle, title: 'Solutions' },
        { id: 'issue', icon: AlertCircle, title: 'Issues' },
        { id: 'suggestion', icon: Lightbulb, title: 'Ideas' },
        { id: 'critique', icon: Eye, title: 'Critiques' },
        { id: 'kudos', icon: Flame, title: 'Kudos' }
    ];

    const getCount = (id) => {
        if (initialCounts) {
            return initialCounts[id] || 0;
        }
        if (id === 'comment') {
            return liveComments.length;
        }
        return liveComments.filter(c => c && c.feedbackType === id).length;
    };

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            {stats.map((stat) => {
                const count = getCount(stat.id);
                const Icon = stat.icon;
                const hasCount = count > 0;

                const hoverColorMap = {
                    comment: 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200',
                    question: 'group-hover/btn:text-indigo-500 dark:group-hover/btn:text-indigo-400',
                    answer: 'group-hover/btn:text-emerald-500 dark:group-hover/btn:text-emerald-400',
                    issue: 'group-hover/btn:text-rose-500 dark:group-hover/btn:text-rose-400',
                    suggestion: 'group-hover/btn:text-amber-500 dark:group-hover/btn:text-amber-400',
                    critique: 'group-hover/btn:text-violet-500 dark:group-hover/btn:text-violet-400',
                    kudos: 'group-hover/btn:text-orange-500 dark:group-hover/btn:text-orange-400'
                };

                const baseColor = 'text-slate-700 dark:text-slate-300';
                
                const hoverColor = hoverColorMap[stat.id] || 'group-hover/btn:text-slate-700 dark:group-hover/btn:text-slate-200';

                return (
                    <div 
                        key={stat.id} 
                        title={stat.title}
                        className="group/btn flex items-center gap-1.5 py-1 pr-2 transition-all duration-200 cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const filterType = stat.id === 'total' || stat.id === 'comment' ? 'all' : stat.id;
                            
                            const targetHref = href || `/post/${item?._id || item?.id}`;
                            router.push(`${targetHref}?filter=${filterType}#comments`);
                        }}
                    >
                        <Icon 
                            size={16} 
                            className={`${baseColor} ${hoverColor} group-hover/btn:opacity-100 group-hover/btn:scale-105 transition-all duration-200 stroke-[2.2px]`} 
                        />
                        {hasCount && (
                            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-200 transition-colors duration-200 tabular-nums">
                                {count}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
