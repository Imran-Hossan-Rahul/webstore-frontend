import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-brand-surface  border border-brand-navy/[0.08]  rounded-[4px] ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-5 pt-5 pb-3 border-b border-slate-100  flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-[16px] font-display font-medium text-brand-navy  ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);


