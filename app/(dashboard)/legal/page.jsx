"use client";
import React from 'react';
import Link from 'next/link';

export default function LegalPage() {
  const legalSections = [
    {
      title: "Sales & Refunds",
      description: "Details about the policies, terms, and conditions for the purchase, support, and returning of products bought on the Codalina marketplace.",
      links: [
        { label: "Explore Sales & Refunds >", href: "/warranty" }
      ]
    },
    {
      title: "Privacy Policy",
      description: "Codalina is committed to your privacy. Read our customer Privacy Policy for a clear explanation of how we collect, use, disclose, transfer, and store your information.",
      links: [
        { label: "Read Codalina's Privacy Policy >", href: "/privacy" }
      ]
    },
    {
      title: "Terms of Service",
      description: "Before using the Codalina platform, you may review the terms and conditions of our end user software license agreements and marketplace usage.",
      links: [
        { label: "Find your terms of service >", href: "/terms" }
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      


      {/* Hero Section */}
      <section className="text-center pt-[100px] pb-[64px] px-6">
        <p className="uppercase tracking-[.12em] text-[12px] font-[600] text-[#0071e3] mb-[18px]">
          Legal Resources
        </p>
        <h1 className="text-[40px] md:text-[56px] font-[700] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-[20px]">
          Codalina Legal
        </h1>
        <p className="text-[17px] md:text-[21px] font-[400] text-[#86868b] max-w-[640px] mx-auto mb-[24px]">
          Find legal information and resources for Codalina products and services.
        </p>
      </section>

      {/* Content Grid */}
      <section className="w-full py-[60px] px-6 border-t border-[#e8e8ed] bg-transparent">
        <div className="max-w-[980px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[60px] gap-y-[60px]">
            {legalSections.map((section, idx) => (
              <div key={idx} className="flex flex-col text-left">
                <h3 className="text-[24px] font-[600] text-[#1d1d1f] tracking-[-0.01em] mb-3">
                  {section.title}
                </h3>
                <p className="text-[16px] font-[400] text-[#86868b] leading-[1.5] mb-5 max-w-[400px]">
                  {section.description}
                </p>
                <div className="flex flex-col items-start space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <Link 
                      key={linkIdx} 
                      href={link.href}
                      className="text-[16px] font-[400] text-[#0071e3] hover:underline"
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
