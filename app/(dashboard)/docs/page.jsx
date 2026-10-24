import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Book, Code, Terminal, Server, ArrowRight, Search } from 'lucide-react';

export const metadata = {
  title: 'Documentation | Codalina',
  description: 'Explore technical guides, API references, and architecture overviews.',
};

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
    <div className="w-full h-full relative z-10 flex flex-col min-h-screen">
      <div className="w-full bg-transparent font-sans pb-16">
        
        {/* Header */}
        <section className="text-center pt-[80px] pb-[60px] px-6">
          <PageContainer maxWidth="max-w-[980px]">
            <div className="flex flex-col items-center">
              <span className="text-[12px] font-mono font-semibold uppercase tracking-widest text-[#111418] mb-[18px] block bg-white/60 px-4 py-1.5 rounded-full shadow-sm border border-[rgba(17,20,24,0.18)]">
                DOCUMENTATION
              </span>
              <h1 className="text-[40px] md:text-[56px] font-display font-medium text-slate-900 leading-[1.1] mb-[20px] max-w-[800px]">
                Everything you need to build with Codalina.
              </h1>
              <p className="text-[18px] md:text-[21px] font-sans text-slate-500 max-w-[640px] mx-auto mb-[24px]">
                Explore comprehensive technical guides, detailed API references, and in-depth architecture overviews.
              </p>
              
              <div className="relative max-w-[500px] w-full mt-4">
                <input 
                  type="text" 
                  placeholder="Search documentation..."
                  className="w-full h-14 pl-14 pr-6 rounded-full border border-white/60 bg-white/40 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-[15px] font-sans text-slate-900 focus:outline-none focus:border-[#111418]/50 focus:ring-2 focus:ring-[rgba(17,20,24,0.50)]/20 focus:bg-white/60 transition-all placeholder:text-slate-400"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Documentation Categories */}
        <section className="px-6 relative z-10">
          <PageContainer maxWidth="max-w-[1200px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-white/30 backdrop-blur-3xl border border-white/50 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col relative group hover:bg-white/40 hover:shadow-[0_8px_40px_rgba(17,20,24,0.08)] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[32px] pointer-events-none" />
                  
                  <div className="relative z-10 flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 bg-[#111418]/5 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-[rgba(17,20,24,0.18)]">
                      <cat.icon className="w-6 h-6 text-[#111418]" />
                    </div>
                    <div>
                      <h3 className="text-[22px] font-display font-medium text-slate-900 mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-[15px] font-sans text-slate-600 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 relative z-10 mt-auto pt-6 border-t border-slate-900/5">
                    {cat.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link href="#" className="text-[15px] font-sans text-slate-700 hover:text-[#111418] transition-colors flex items-center justify-between group/link">
                          <span>{link}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#111418]" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

      </div>
    </div>
  );
}
