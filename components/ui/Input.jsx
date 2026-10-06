import React from 'react';

export const Input = React.forwardRef(({ 
  className = '', 
  label, 
  error, 
  leftElement,
  rightElement,
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
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftElement}
          </div>
        )}
        <input 
          id={generatedId}
          ref={ref}
          className={`w-full bg-brand-surface  border ${error ? 'border-red-500' : 'border-brand-navy/[0.08] '} rounded-[4px] h-10 text-[14px] font-sans text-brand-navy  placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors ${leftElement ? 'pl-10' : 'pl-3'} ${rightElement ? 'pr-10' : 'pr-3'} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-[12px] font-sans text-red-500 mt-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';

