import React from 'react';
import { Layers, Bookmark, FolderOpen, SearchX } from "lucide-react";
import Link from 'next/link';

export function EmptyState({ 
  type = 'default', // 'devlogs', 'artifacts', 'saved', 'search', 'default'
  title, 
  description, 
  actionText, 
  actionHref,
  action,
  variant = 'default', // 'default' | 'glass'
  icon: CustomIcon
}) {
  const isGlass = variant === 'glass';
  
  const getDefaults = () => {
    switch (type) {
      case 'devlogs':
        return {
          icon: <Layers strokeWidth={1.5} className="w-8 h-8 text-[#111418]" />,
          title: "No showcases found",
          description: "There are no showcases matching your current filters. Try adjusting your categories or check back later.",
          bgIcon: "bg-[#E6E9ED]"
        };
      case 'artifacts':
        return {
          icon: <FolderOpen strokeWidth={1.5} className="w-8 h-8 text-[#5B636D]" />,
          title: "No artifacts available",
          description: "We couldn't find any artifacts. Be the first to create and share an artifact!",
          bgIcon: "bg-[#E6E9ED]"
        };
      case 'saved':
        return {
          icon: <Bookmark strokeWidth={1.5} className="w-8 h-8 text-[#0E7C86]" />,
          title: "Nothing saved yet",
          description: "When you find something inspiring, click the heart or save icon to add it to your collection.",
          actionText: "Explore Content",
          actionHref: "/",
          bgIcon: "bg-[#0E7C86]/10"
        };
      case 'search':
        return {
          icon: <SearchX strokeWidth={1.5} className="w-8 h-8 text-[#5B636D]" />,
          title: "No results found",
          description: "We couldn't find anything matching your search. Try different keywords or broader terms.",
          bgIcon: "bg-[#E6E9ED]"
        };
      default:
        return {
          icon: <Layers strokeWidth={1.5} className="w-8 h-8 text-[#5B636D]" />,
          title: "Nothing to see here",
          description: "There is no content available at the moment.",
          bgIcon: "bg-[#E6E9ED]"
        };
    }
  };

  const defaults = getDefaults();
  const IconEl = !CustomIcon
    ? defaults.icon
    : React.isValidElement(CustomIcon)
      ? CustomIcon
      : <CustomIcon strokeWidth={1.5} className="w-8 h-8 text-[#5B636D]" />;
  const displayTitle = title || defaults.title;
  const displayDesc = description || defaults.description;
  const displayActionText = actionText || defaults.actionText;
  const displayActionHref = actionHref || defaults.actionHref;

  return (
    <div className={`text-center py-16 px-6 flex flex-col items-center justify-center border border-[rgba(17,20,24,0.18)]/40 animate-in fade-in duration-500 ${isGlass ? 'bg-white/60 backdrop-blur-lg border-white/30 shadow-sm rounded-[20px]' : 'rounded-[4px] mt-4 bg-brand-cloud'}`}>
       <div className={`w-12 h-12 ${defaults.bgIcon} ${isGlass ? 'rounded-[12px]' : 'rounded-[4px]'} flex items-center justify-center mb-5 border border-[rgba(17,20,24,0.18)]/40 `}>
           <div className="scale-75 flex items-center justify-center">
             {IconEl}
           </div>
       </div>
       <h3 className="text-[18px] font-display font-medium text-[#111418] mb-2 tracking-tight">
           {displayTitle}
       </h3>
       <p className="text-[#3B424A] max-w-sm text-center mb-8 leading-relaxed font-sans text-[14px]">
         {displayDesc}
       </p>
       
       {displayActionText && displayActionHref && (
         <Link href={displayActionHref}>
            <button className={`px-6 py-2.5 bg-[#111418] hover:bg-[#2B3038] active:bg-[#000000] text-white font-sans font-medium text-[15px] shadow-[0_4px_12px_rgba(17,20,24,0.20)] transition-all ${isGlass ? 'rounded-[20px]' : 'rounded-[4px]'}`}>
              {displayActionText}
            </button>
         </Link>
       )}
       {!displayActionHref && action?.label && action?.onClick && (
         <button
           onClick={action.onClick}
           className={`px-6 py-2.5 bg-[#111418] hover:bg-[#2B3038] active:bg-[#000000] text-white font-sans font-medium text-[15px] shadow-[0_4px_12px_rgba(17,20,24,0.20)] transition-all ${isGlass ? 'rounded-[20px] shadow-md' : 'rounded-[4px]'}`}
         >
           {action.label}
         </button>
       )}
    </div>
  );
}

export default EmptyState;

