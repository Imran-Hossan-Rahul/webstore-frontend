"use client";
import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Book, Code, Terminal, Server } from 'lucide-react';

export default function DocsPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Quick start guides and installation instructions for Codalina products.",
      icon: Book,
      links: [
        "Installation Guide",
        "Environment Variables",
        "Initial Configuration",
        "Deployment Options"
      ]
    },
    {
      title: "API Reference",
      description: "Complete documentation for our REST and GraphQL APIs.",
      icon: Terminal,
      links: [
        "Authentication",
        "Rate Limiting",
        "Endpoints & Pagination",
        "Webhooks"
      ]
    },
    {
      title: "UI Components",
      description: "Documentation for the React/Next.js component kits.",
      icon: Code,
      links: [
        "Design System Tokens",
        "Core Components",
        "Forms & Validation",
        "Theming & Dark Mode"
      ]
    },
    {
      title: "Architecture",
      description: "Deep dives into system design and infrastructure patterns.",
      icon: Server,
      links: [
        "Database Schema",
        "Caching Strategy",
        "Event Driven Architecture",
        "Security Model"
      ]
    }
  ];

  return (
    <PageContainer maxWidth="max-w-[1200px]" className="py-16 md:py-24">
      <header className="mb-16">
        <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
          Documentation
        </p>
        <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
          Codalina Docs
        </h1>
        <p className="text-[17px] font-sans text-slate-500 dark:text-slate-400 max-w-[640px] leading-relaxed mb-8">
          Explore technical guides, API references, and architecture overviews for Codalina products and platforms.
        </p>
        <div className="relative max-w-[500px]">
          <input 
            type="text" 
            placeholder="Search documentation..."
            className="w-full h-12 pl-12 pr-4 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 bg-brand-surface dark:bg-brand-surface text-[15px] font-sans text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-brand-cloud dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-8 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-colors">
            <div className="w-10 h-10 rounded-[4px] bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 flex items-center justify-center text-brand-blue mb-6">
              <cat.icon size={18} />
            </div>
            <h3 className="text-[20px] font-display font-medium text-brand-navy dark:text-white mb-2">
              {cat.title}
            </h3>
            <p className="text-[14px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {cat.description}
            </p>
            <ul className="space-y-3">
              {cat.links.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <Link href="#" className="text-[14px] font-sans text-brand-navy dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-blue/50" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
