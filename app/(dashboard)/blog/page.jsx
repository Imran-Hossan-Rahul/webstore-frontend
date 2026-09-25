"use client";
import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    {
      title: "Building the Next Generation of Codalina Marketplace",
      excerpt: "An architectural overview of how we migrated from a monolithic frontend to a highly performant Next.js 14 App Router application with Server Components.",
      category: "Engineering",
      date: "July 24, 2026",
      readTime: "8 min read"
    },
    {
      title: "Introducing the New Dark Mode Design System",
      excerpt: "How we crafted a premium, editorial visual language for our digital products. A deep dive into color theory, spacing, and typography.",
      category: "Design",
      date: "July 12, 2026",
      readTime: "5 min read"
    },
    {
      title: "Scaling our Hardware Distribution Network",
      excerpt: "Behind the scenes on how Codalina verifies authenticity and provides direct manufacturer warranties for every hardware product we sell.",
      category: "Operations",
      date: "June 28, 2026",
      readTime: "6 min read"
    }
  ];

  return (
    <PageContainer maxWidth="max-w-[1000px]" className="py-16 md:py-24">
      <header className="mb-16 border-b border-slate-200 dark:border-white/10 pb-12">
        <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
          Updates & Insights
        </p>
        <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
          Codalina Blog
        </h1>
        <p className="text-[17px] font-sans text-slate-500 max-w-[640px] leading-relaxed">
          Engineering deep dives, design system updates, and company news.
        </p>
      </header>

      <div className="space-y-12">
        {posts.map((post, idx) => (
          <article key={idx} className="group flex flex-col items-start pb-12 border-b border-slate-100 dark:border-white/5 last:border-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-mono font-medium uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-[4px]">
                {post.category}
              </span>
              <span className="text-[13px] font-sans text-slate-400">
                {post.date}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
              <span className="text-[13px] font-mono text-slate-400">
                {post.readTime}
              </span>
            </div>
            
            <h2 className="text-[24px] md:text-[28px] font-display font-medium text-brand-navy dark:text-white mb-4 group-hover:text-brand-blue transition-colors">
              <Link href="#">{post.title}</Link>
            </h2>
            
            <p className="text-[15px] font-sans text-slate-500 leading-relaxed max-w-[800px] mb-6">
              {post.excerpt}
            </p>
            
            <Link href="#" className="flex items-center gap-2 text-[14px] font-sans font-medium text-brand-blue group-hover:text-blue-700 transition-colors">
              Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button className="px-6 py-2.5 rounded-[4px] border border-slate-200 dark:border-white/10 text-[14px] font-sans font-medium text-brand-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          Load More Posts
        </button>
      </div>
    </PageContainer>
  );
}
