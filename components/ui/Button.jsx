import React from 'react';
import { Loader2 } from 'lucide-react';
import AppleSpinner from '@/components/ui/AppleSpinner';

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
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(17,20,24,0.50)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#111418] hover:bg-[#2B3038] active:bg-[#000000] text-white border border-[#111418] shadow-[0_4px_12px_rgba(17,20,24,0.20)]",
    secondary: "bg-[#E6E9ED] hover:bg-[#DCE3EA] text-[#111418] border border-[rgba(17,20,24,0.18)]",
    outline: "bg-transparent hover:bg-[#E6E9ED] text-[#111418] border border-[rgba(17,20,24,0.18)]",
    ghost: "bg-transparent hover:bg-[#E6E9ED] text-[#111418] border border-transparent",
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
      {isLoading && <span className="mr-2"><AppleSpinner size={16} className={variant === 'primary' ? 'text-white' : 'text-[#111418]'} /></span>}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});
Button.displayName = 'Button';


