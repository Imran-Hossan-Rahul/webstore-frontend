import React from 'react';
import { Loader2 } from 'lucide-react';

export const IconButton = React.forwardRef(({ 
  className = '', 
  variant = 'outline', 
  size = 'md', 
  isLoading = false, 
  icon, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[4px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0D1117] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-blue hover:bg-brand-blue/90 text-white border border-brand-blue",
    secondary: "bg-slate-100 dark:bg-brand-surface/[0.05] hover:bg-slate-200 dark:bg-brand-surface/5 dark:hover:bg-brand-surface/10 text-brand-navy dark:text-white border border-transparent",
    outline: "bg-transparent hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5 text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white border border-brand-navy/[0.08] dark:border-white/10",
    ghost: "bg-transparent hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5 text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white border border-transparent"
  };
  
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );
});
IconButton.displayName = 'IconButton';
