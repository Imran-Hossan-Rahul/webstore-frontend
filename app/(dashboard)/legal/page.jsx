"use client";
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Lock, FileText, Store, Cloud, ShieldCheck } from 'lucide-react';

export default function LegalPage() {
  const legalSections = [
    {
      icon: <ShoppingBag className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Sales & Refunds",
      description: "Details about the policies, terms, and conditions for the purchase, support, and returning of products bought on the Codalina marketplace.",
      links: [
        { label: "Explore Sales & Refunds >", href: "/warranty" }
      ]
    },
    {
      icon: <Lock className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Privacy Policy",
      description: "Codalina is committed to your privacy. Read our customer Privacy Policy for a clear explanation of how we collect, use, disclose, transfer, and store your information.",
      links: [
        { label: "Read Codalina's Privacy Policy >", href: "/privacy" }
      ]
    },
    {
      icon: <FileText className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Terms of Service",
      description: "Before using the Codalina platform, you may review the terms and conditions of our end user software license agreements and marketplace usage.",
      links: [
        { label: "Find your terms of service >", href: "/terms" }
      ]
    },
    {
      icon: <Store className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Seller & Vendor Policies",
      description: "Policies and requirements that govern official brand partners, distributors, and verified sellers operating on the Codalina marketplace.",
      links: [
        { label: "Explore Seller Policies >", href: "#" }
      ]
    },
    {
      icon: <Cloud className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Internet Services",
      description: "Policies and terms that govern Codalina online services, including digital wallets, user accounts, and our community guidelines.",
      links: [
        { label: "Explore Internet Services >", href: "#" }
      ]
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Intellectual Property",
      description: "Codalina's innovation is embodied in its Intellectual Property, including Patents, Trademarks, and Copyrights. Learn about our policies.",
      links: [
        { label: "Explore Intellectual Property >", href: "#" }
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#ffffff] font-sans">
      
      {/* 1. Secondary Navigation Bar (Apple Style) */}
      <div className="w-full border-b border-[#d2d2d7] bg-[#ffffff] sticky top-[60px] z-40 hidden md:block">
        <div className="max-w-[1000px] mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[21px] font-[600] text-[#1d1d1f] tracking-[-0.01em]">Legal</span>
          <div className="flex items-center gap-6 text-[12px] font-[400] text-[#424245]">
            <Link href="#hardware" className="hover:text-[#1d1d1f] transition-colors">Sales & Refunds</Link>
            <Link href="#software" className="hover:text-[#1d1d1f] transition-colors">Terms of Service</Link>
            <Link href="#sales" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
            <Link href="#services" className="hover:text-[#1d1d1f] transition-colors">Internet Services</Link>
            <Link href="#ip" className="hover:text-[#1d1d1f] transition-colors">Intellectual Property</Link>
            <Link href="#resources" className="hover:text-[#1d1d1f] transition-colors">More Resources</Link>
          </div>
        </div>
      </div>

      {/* 2. Mobile Secondary Navigation */}
      <div className="w-full border-b border-[#d2d2d7] bg-[#ffffff] sticky top-[60px] z-40 block md:hidden px-4 py-3">
        <span className="text-[21px] font-[600] text-[#1d1d1f] tracking-[-0.01em]">Legal</span>
      </div>

      {/* 3. Hero Section (Gradient Banner) */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
        {/* Subtle Apple-style background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e3f2fd] via-[#f0f4ff] to-[#e1f5fe] z-0"></div>
        {/* Decorative sharp diagonal elements mimicking the screenshot */}
        <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-gradient-to-r from-[#3b82f6]/10 to-transparent transform -skew-x-12 z-0"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[20%] bg-gradient-to-l from-[#3b82f6]/10 to-transparent transform skew-x-12 z-0"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-[40px] md:text-[56px] font-[600] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-3">
            Codalina Legal
          </h1>
          <p className="text-[17px] md:text-[19px] font-[400] text-[#1d1d1f] max-w-[400px] mx-auto leading-[1.4]">
            Find legal information and resources for Codalina products and services.
          </p>
        </div>
      </section>

      {/* 4. Content Grid */}
      <section className="w-full pt-[80px] pb-[120px] px-6">
        <div className="max-w-[980px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[100px]">
            {legalSections.map((section, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex justify-center md:justify-start w-full">
                  {section.icon}
                </div>
                <h3 className="text-[24px] font-[600] text-[#1d1d1f] tracking-[-0.01em] mb-3">
                  {section.title}
                </h3>
                <p className="text-[14px] font-[400] text-[#424245] leading-[1.6] mb-5 max-w-[400px]">
                  {section.description}
                </p>
                <div className="flex flex-col items-center md:items-start space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <Link 
                      key={linkIdx} 
                      href={link.href}
                      className="text-[14px] font-[400] text-[#0066cc] hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
