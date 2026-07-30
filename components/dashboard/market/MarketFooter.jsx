import React from 'react';
import Link from 'next/link';

export default function MarketFooter() {
  const footerLinks = [
    {
      title: "Shop and Learn",
      links: [
        { label: "Marketplace", href: "/" },
        { label: "Electronics", href: "/category/electronics" },
        { label: "Accessories", href: "/category/accessories" },
        { label: "New Arrivals", href: "#" }
      ]
    },
    {
      title: "Account",
      links: [
        { label: "Manage Your Codalina ID", href: "/admin" },
        { label: "Codalina Store Account", href: "/admin" },
        { label: "iCloud.com", href: "#" } // Just mimicking Apple's style
      ]
    },
    {
      title: "About Codalina",
      links: [
        { label: "Who We Are", href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Ethics & Compliance", href: "#" },
        { label: "Contact Codalina", href: "#" }
      ]
    }
  ];

  return (
    <footer className="w-full bg-[#f5f5f7] border-t border-[#e8e8ed] font-sans pt-12 pb-16 px-6 md:px-12 text-[#86868b] text-[12px] leading-relaxed">
      <div className="max-w-[980px] mx-auto">
        
        {/* Top Disclaimer / Fine Print */}
        <div className="border-b border-[#e8e8ed] pb-4 mb-8">
          <p className="mb-2">
            1. Fast delivery applies to digital products and eligible physical items. Delivery times may vary based on location.
          </p>
          <p className="mb-2">
            2. Codalina securely processes your payments using state-of-the-art encryption.
          </p>
          <p>
            Prices are subject to change. Codalina reserves the right to cancel any orders in the event of pricing errors.
          </p>
        </div>

        {/* Directory Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((column, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-[#1d1d1f] mb-2">{column.title}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href} className="hover:text-[#1d1d1f] hover:underline transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright & Legal Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-[#e8e8ed]">
          <div className="mb-4 md:mb-0">
            <p>Copyright © {new Date().getFullYear()} Codalina Inc. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="hover:text-[#1d1d1f] hover:underline">Privacy Policy</Link>
            <span className="hidden md:inline text-[#e8e8ed]">|</span>
            <Link href="/terms" className="hover:text-[#1d1d1f] hover:underline">Terms of Use</Link>
            <span className="hidden md:inline text-[#e8e8ed]">|</span>
            <Link href="/warranty" className="hover:text-[#1d1d1f] hover:underline">Sales and Refunds</Link>
            <span className="hidden md:inline text-[#e8e8ed]">|</span>
            <Link href="#" className="hover:text-[#1d1d1f] hover:underline">Legal</Link>
            <span className="hidden md:inline text-[#e8e8ed]">|</span>
            <Link href="#" className="hover:text-[#1d1d1f] hover:underline">Site Map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
