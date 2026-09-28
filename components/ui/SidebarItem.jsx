import React from 'react';
import Link from 'next/link';

export const SidebarItem = ({ icon, label, href, isActive, badge, ...props }) => {
  return (
    <Link 
      href={href}
      className={`flex items-center justify-between px-4 py-2.5 rounded-[4px] transition-all group ${
        isActive 
          ? 'bg-slate-100 dark:bg-brand-surface/5 text-brand-navy dark:text-white' 
          : 'text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-slate-200 hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5'
      }`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && React.cloneElement(icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
        <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>
          {label}
        </span>
      </div>
      {badge > 0 && (
        <span className="w-5 h-5 flex items-center justify-center bg-brand-blue text-white text-[9px] font-bold rounded-[4px]">
          {badge}
        </span>
      )}
    </Link>
  );
};
