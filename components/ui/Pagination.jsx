import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './IconButton';

export const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  // Simplified logic: show max 5 pages around current
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      <IconButton 
        icon={<ChevronLeft size={16} />} 
        variant="outline" 
        size="sm" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={i} className="px-2 text-slate-400">...</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-[4px] text-[13px] font-sans font-medium transition-colors ${
              p === currentPage
                ? 'bg-brand-blue text-white'
                : 'bg-brand-surface  border border-brand-navy/[0.08]  text-brand-navy  hover:border-brand-blue hover:text-brand-blue'
            }`}
          >
            {p}
          </button>
        )
      ))}

      <IconButton 
        icon={<ChevronRight size={16} />} 
        variant="outline" 
        size="sm" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
};

