import React from 'react';
import { Layers, Bookmark, FolderOpen, SearchX } from "lucide-react";
import Link from 'next/link';

export default function EmptyState({ 
  type = 'default', // 'devlogs', 'artifacts', 'saved', 'search', 'default'
  title, 
  description, 
  actionText, 
  actionHref,
  icon: CustomIcon
}) {
  
  const getDefaults = () => {
    switch (type) {
      case 'devlogs':
        return {
          icon: <Layers strokeWidth={1.5} className="w-8 h-8 text-purple-400" />,
          title: "No showcases found",
          description: "There are no showcases matching your current filters. Try adjusting your categories or check back later.",
          bgIcon: "bg-purple-100 dark:bg-purple-900/30"
        };
      case 'artifacts':
        return {
          icon: <FolderOpen strokeWidth={1.5} className="w-8 h-8 text-pink-400" />,
          title: "No artifacts available",
          description: "We couldn't find any artifacts. Be the first to create and share a artifact!",
          bgIcon: "bg-pink-100 dark:bg-pink-900/30"
        };
      case 'saved':
        return {
          icon: <Bookmark strokeWidth={1.5} className="w-8 h-8 text-emerald-400" />,
          title: "Nothing saved yet",
          description: "When you find something inspiring, click the heart or save icon to add it to your collection.",
          actionText: "Explore Content",
          actionHref: "/explore",
          bgIcon: "bg-emerald-100 dark:bg-emerald-900/30"
        };
      case 'search':
        return {
          icon: <SearchX strokeWidth={1.5} className="w-8 h-8 text-slate-400" />,
          title: "No results found",
          description: "We couldn't find anything matching your search. Try different keywords or broader terms.",
          bgIcon: "bg-slate-100 dark:bg-slate-800"
        };
      default:
        return {
          icon: <Layers strokeWidth={1.5} className="w-8 h-8 text-slate-400" />,
          title: "Nothing to see here",
          description: "There is no content available at the moment.",
          bgIcon: "bg-slate-100 dark:bg-slate-800"
        };
    }
  };

  const defaults = getDefaults();
  const IconEl = CustomIcon || defaults.icon;
  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayActionText = actionText || defaults.actionText;
  const displayActionHref = actionHref || defaults.actionHref;

  return (
    <div className="text-center py-12 px-4 flex flex-col items-center justify-center border border-slate-200 dark:border-white/10 rounded-xl mt-4 bg-white dark:bg-black/20 animate-in fade-in duration-500">
       <div className={`w-12 h-12 ${defaults.bgIcon} rounded-xl flex items-center justify-center mb-4 border border-slate-100 dark:border-white/5`}>
           <div className="scale-75 flex items-center justify-center">
             {IconEl}
           </div>
       </div>
       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
           {displayTitle}
       </h3>
       <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center mb-6 leading-relaxed text-sm">
         {displayDesc}
       </p>
       
       {displayActionText && displayActionHref && (
         <Link href={displayActionHref}>
            <button className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm active:opacity-60">
              {displayActionText}
            </button>
         </Link>
       )}
    </div>
  );
}

