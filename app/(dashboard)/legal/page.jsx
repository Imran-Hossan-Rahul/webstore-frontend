"use client";
import React from 'react';
import Link from 'next/link';

import { PageContainer } from '@/components/ui/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronRight, Shield, FileText, CheckCircle, RefreshCcw } from 'lucide-react';

export default function LegalPage() {
  const legalSections = [
    {
      title: "Terms & Conditions",
      description: "Before using the Codalina platform, review the terms governing our marketplace usage and community.",
      icon: FileText,
      links: [
        { label: "Find your terms of service", href: "/terms" }
      ]
    },
    {
      title: "Privacy Policy",
      description: "Codalina is committed to your privacy. Read our policy for a clear explanation of how we protect your data.",
      icon: Shield,
      links: [
        { label: "Read Codalina's Privacy Policy", href: "/privacy" }
      ]
    },
    {
      title: "End User License Agreement",
      description: "Standard licensing terms for digital products on Codalina, including personal and commercial limits.",
      icon: CheckCircle,
      links: [
        { label: "Review the EULA", href: "/eula" }
      ]
    },
    {
      title: "Warranty & Refunds",
      description: "Details about the policies, terms, and conditions for the support and refunding of digital products.",
      icon: RefreshCcw,
      links: [
        { label: "Explore Warranty & Refunds", href: "/warranty" }
      ]
    }
  ];

  return (
    <PageContainer maxWidth="max-w-[1200px]" className="py-16 md:py-24">
      
      {/* Hero Section */}
      <div className="pb-12 border-b border-slate-200 dark:border-white/8 mb-16 text-center md:text-left">
        <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
          Legal Resources
        </p>
        <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
          Codalina Legal & Information
        </h1>
        <p className="text-[17px] font-sans text-slate-500 max-w-[640px] leading-relaxed mx-auto md:mx-0">
          Find legal information, data protection policies, and licensing resources for Codalina products and platforms.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {legalSections.map((section, idx) => (
          <Card key={idx} className="bg-white dark:bg-[#161B22] border-slate-200 dark:border-white/10 hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-colors shadow-sm dark:shadow-none h-full">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="w-10 h-10 rounded-[4px] bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6">
                <section.icon size={20} />
              </div>
              <h3 className="text-[20px] font-display font-medium text-brand-navy dark:text-white mb-3 leading-tight">
                {section.title}
              </h3>
              <p className="text-[14px] font-sans text-slate-500 leading-relaxed mb-8 flex-1">
                {section.description}
              </p>
              <div className="flex flex-col items-start space-y-2 mt-auto">
                {section.links.map((link, linkIdx) => (
                  <Link 
                    key={linkIdx} 
                    href={link.href}
                    className="group flex items-center gap-2 text-[14px] font-sans font-medium text-brand-blue hover:text-blue-700 transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </PageContainer>
  );
}
