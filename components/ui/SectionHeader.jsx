import React from 'react';

export const SectionHeader = ({ title, badge, action, className = '', ...props }) => {
  return (
    <div className={`flex items-center justify-between border-b border-brand-navy/[0.08] dark:border-white/10 pb-4 mb-6 ${className}`} {...props}>
      <div className="flex items-center gap-3">
        <h2 className="text-[18px] md:text-[20px] font-display font-medium text-brand-navy dark:text-white">
          {title}
        </h2>
        {badge && (
          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[11px] font-mono tracking-widest uppercase rounded-[4px] border border-brand-blue/20">
            {badge}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
