import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-mono tracking-widest uppercase border";
  
  const variants = {
    default: "bg-[#E6E9ED] text-[#5B636D] border-[rgba(17,20,24,0.18)]",
    primary: "bg-[#E6E9ED] text-[#111418] border-[rgba(17,20,24,0.18)]",
    success: "bg-[#0E7C86]/10 text-[#0E7C86] border-[#0E7C86]/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

