import React from 'react';
import Link from 'next/link';

export const FooterSection = ({ className = '', logo, links = [], bottomText }) => (
  <footer className={`w-full bg-brand-surface dark:bg-brand-surface border-t border-brand-navy/[0.08] dark:border-white/10 pt-16 pb-8 ${className}`}>
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
        <div className="max-w-xs">
          {logo || <div className="text-[20px] font-display font-bold text-brand-navy dark:text-white mb-4">Codalina</div>}
          <p className="text-[13px] font-sans text-slate-500 dark:text-slate-400">
            Premium digital assets, tools, and UI kits for elite developers and designers.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          {links.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-[11px] font-mono tracking-widest uppercase text-brand-navy dark:text-white mb-6">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link href={item.href} className="text-[13px] font-sans text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-8 border-t border-brand-navy/[0.08] dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[12px] font-sans text-slate-400">
          {bottomText || `© ${new Date().getFullYear()} Codalina. All rights reserved.`}
        </p>
        <div className="flex items-center gap-6 text-[12px] font-sans text-slate-400">
          <Link href="/terms" className="hover:text-brand-navy dark:hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-brand-navy dark:hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  </footer>
);
