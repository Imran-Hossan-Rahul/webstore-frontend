import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div className={`bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-5 pt-5 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`text-[16px] font-display font-medium text-brand-navy dark:text-white ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);
