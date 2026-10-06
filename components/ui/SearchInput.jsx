import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = React.forwardRef(({ 
  className = '', 
  onClear,
  value,
  ...props 
}, ref) => {
  return (
    <div className="relative w-full group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
        <Search size={16} />
      </div>
      <input 
        ref={ref}
        value={value}
        className={`w-full bg-brand-surface  border border-brand-navy/[0.08]  rounded-[4px] h-10 pl-10 pr-10 text-[14px] font-sans text-brand-navy  placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors ${className}`}
        {...props}
      />
      {value && onClear && (
        <button 
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy :text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
SearchInput.displayName = 'SearchInput';

