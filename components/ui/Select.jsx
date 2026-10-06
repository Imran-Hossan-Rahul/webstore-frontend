import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({ 
  className = '', 
  label, 
  error, 
  options = [],
  id,
  ...props 
}, ref) => {
  const internalId = React.useId();
  const generatedId = id || internalId;
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select 
          id={generatedId}
          ref={ref}
          className={`appearance-none w-full bg-brand-surface  border ${error ? 'border-red-500' : 'border-brand-navy/[0.08] '} rounded-[4px] h-10 px-3 pr-10 text-[14px] font-sans text-brand-navy  focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <span className="text-[12px] font-sans text-red-500 mt-1">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';

