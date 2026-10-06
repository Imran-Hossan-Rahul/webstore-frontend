import React from 'react';

export const Tabs = ({ tabs, activeTab, onChange, className = '', ...props }) => {
  return (
    <div className={`flex overflow-x-auto scrollbar-hide border-b border-brand-navy/[0.08]  ${className}`} {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-3 text-[14px] font-sans font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive 
                ? 'border-brand-blue text-brand-blue' 
                : 'border-transparent text-slate-500  hover:text-brand-navy :text-white hover:border-brand-navy/[0.08] :border-white/30'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 text-[11px] font-mono px-2 py-0.5 rounded-[4px] ${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100  text-slate-500 '}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

