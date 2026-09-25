import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-mono tracking-widest uppercase border";
  
  const variants = {
    default: "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10",
    primary: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    success: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
