import React from 'react';
import Link from 'next/link';
import GlassBackground from '@/components/dashboard/market/GlassBackground';
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: 'Site Map - Codalina',
  description: 'Navigate through our web development services, premium templates, and resources.',
};

export default function SitemapPage() {
  const sitemapData = [
    {
      title: "Codalina Platform",
      description: "Learn more about who we are and what we do.",
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Partner Program", href: "/partner" },
        { label: "Contact Us", href: "/contact" }
      ]
    },
    {
      title: "Services & Store",
      description: "Explore our web solutions and premium templates.",
      links: [
        { label: "Template Store", href: "/store" },
        { label: "Submit Project Brief", href: "/submit-brief" },
        { label: "Book a Consultation", href: "/book-call" },
        { label: "Shopping Cart", href: "/cart" }
      ]
    },
    {
      title: "Resources & Help",
      description: "Find answers and learn how to use our platform.",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Help & Support", href: "/support" },
        { label: "Frequently Asked Questions", href: "/faq" },
        { label: "Warranty Check", href: "/warranty" }
      ]
    },
    {
      title: "Legal & Policies",
      description: "Important terms and guidelines for our users.",
      links: [
        { label: "Legal Hub", href: "/legal" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "End User License (EULA)", href: "/eula" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-sans pb-24 selection:bg-brand-navy selection:text-white">
      <GlassBackground />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pt-28 md:pt-36">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm text-brand-navy text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-[20px] mb-6">
            Directory
          </div>
          <h1 className="text-[36px] md:text-[52px] font-bold text-brand-navy font-display leading-[1.1] mb-4 tracking-tight max-w-[800px]">
            Platform <span className="text-brand-blue">Sitemap</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-slate-500 max-w-[600px] leading-relaxed">
            Navigate through our web development services, premium templates, and resources to find exactly what you're looking for.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-[1200px] mx-auto">
          {sitemapData.map((section, idx) => (
            <div 
              key={idx} 
              className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-8 hover:shadow-md hover:border-brand-blue/20 transition-all duration-300"
            >
              <h3 className="text-[16px] font-semibold text-brand-navy font-display mb-2">
                {section.title}
              </h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                {section.description}
              </p>
              <ul className="flex flex-col space-y-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href}
                      className="group flex items-center justify-between text-[14px] font-medium text-slate-600 hover:text-brand-blue transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-blue" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
