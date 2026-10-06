import React from 'react';

export const NavigationGroup = ({ title, children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h4 className="px-4 mb-2 text-[10px] font-mono tracking-widest uppercase text-slate-400">
          {title}
        </h4>
      )}
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
};

