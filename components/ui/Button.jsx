import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded-[4px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0D1117] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-blue hover:bg-brand-blue/90 text-white border border-brand-blue",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-brand-navy dark:text-white border border-transparent",
    outline: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-brand-navy dark:text-white border border-slate-200 dark:border-white/10",
    ghost: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-brand-navy dark:text-white border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white border border-red-500"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-12 px-6 text-[15px]"
  };
  
  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});
Button.displayName = 'Button';
