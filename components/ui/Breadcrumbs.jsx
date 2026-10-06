import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs = ({ items, className = '', ...props }) => {
  return (
    <nav className={`flex items-center text-[11px] font-mono tracking-widest uppercase text-slate-500  ${className}`} {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            {isLast ? (
              <span className="text-brand-navy  font-medium">{item.label}</span>
            ) : (
              <Link href={item.href || '#'} className="hover:text-brand-blue transition-colors">
                {item.label}
              </Link>
            )}
            {!isLast && <ChevronRight size={14} className="mx-2 opacity-50" />}
          </div>
        );
      })}
    </nav>
  );
};

