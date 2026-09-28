import React from 'react';

export const Tabs = ({ tabs, activeTab, onChange, className = '', ...props }) => {
  return (
    <div className={`flex overflow-x-auto scrollbar-hide border-b border-brand-navy/[0.08] dark:border-white/10 ${className}`} {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-3 text-[14px] font-sans font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive 
                ? 'border-brand-blue text-brand-blue' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white hover:border-brand-navy/[0.08] dark:hover:border-white/30'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 text-[11px] font-mono px-2 py-0.5 rounded-[4px] ${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 dark:bg-brand-surface/5 text-slate-500 dark:text-slate-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
