import React from 'react';

export const PageHeader = ({ title, description, actions, className = '', ...props }) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ${className}`} {...props}>
      <div>
        <h1 className="text-[24px] md:text-[28px] font-display font-medium text-brand-navy  leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] font-sans text-slate-500  mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

