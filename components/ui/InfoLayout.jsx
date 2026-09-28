import React from 'react';
import Link from 'next/link';

export function InfoLayout({ 
  children, 
  title, 
  subtitle, 
  eyebrow, 
  lastUpdated, 
  sidebarLinks = [] 
}) {
  return (
    <div className="w-full min-h-screen ] font-sans bg-brand-main">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-[800px]">
            <header className="mb-12">
              {eyebrow && (
                <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[17px] font-sans text-slate-500 dark:text-slate-400 max-w-[640px] mb-6 leading-relaxed">
                  {subtitle}
                </p>
              )}
              {lastUpdated && (
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
                  <p className="text-[12px] font-mono text-slate-400 uppercase tracking-widest">
                    Last Updated: {lastUpdated}
                  </p>
                </div>
              )}
            </header>

            <div className="prose prose-slate dark:prose-invert prose-headings:font-display prose-headings:font-medium prose-h2:text-[24px] prose-h2:md:text-[28px] prose-h2:mt-12 prose-h2:mb-6 prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-slate-600 dark:text-slate-300 dark:prose-p:text-slate-300 prose-li:text-[15px] prose-li:text-slate-600 dark:text-slate-300 dark:prose-li:text-slate-300 max-w-none">
              {children}
            </div>
          </div>

          {/* Sticky Sidebar */}
          {sidebarLinks.length > 0 && (
            <aside className="w-full lg:w-[280px] shrink-0 sticky top-[120px]">
              <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-5">
                <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-400 mb-4">
                  Information & Legal
                </p>
                <nav className="flex flex-col gap-1">
                  {sidebarLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className={`text-[13px] font-sans py-2 px-3 rounded-[4px] transition-colors ${
                        link.active 
                          ? 'bg-brand-blue/10 text-brand-blue dark:text-brand-blue font-medium' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}
