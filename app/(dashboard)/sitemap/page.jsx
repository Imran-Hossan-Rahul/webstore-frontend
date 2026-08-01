import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Site Map - Codalina',
  description: 'A complete overview of the Codalina Marketplace.',
};

export default function SitemapPage() {
  const sitemapData = [
    {
      title: "Shop and Learn",
      links: [
        { label: "Marketplace Home", href: "/" },
        { label: "Search Products", href: "/search" },
        { label: "Smartwatches", href: "/category/smartwatch" },
        { label: "Audio & Headphones", href: "/category/audio" },
        { label: "Power Banks & Cables", href: "/category/powerbank" },
        { label: "Adapters", href: "/category/adapter" }
      ]
    },
    {
      title: "Account",
      links: [
        { label: "Manage Your Account", href: "/settings" },
        { label: "Shopping Cart", href: "/cart" },
        { label: "Sign In", href: "/auth/login" },
        { label: "Create Account", href: "/auth/register" }
      ]
    },
    {
      title: "Services & Support",
      links: [
        { label: "Product Warranty Check", href: "/warranty" },
        { label: "Checkout", href: "/checkout" }
      ]
    },
    {
      title: "About Codalina",
      links: [
        { label: "Who We Are", href: "/about" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-transparent font-sans pt-12 pb-24 px-6 md:px-12">
      <div className="max-w-[980px] mx-auto">
        
        {/* Page Title */}
        <h1 className="text-[32px] md:text-[40px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-4">
          Codalina Site Map
        </h1>
        <div className="w-full h-[1px] bg-[#d2d2d7] mb-10"></div>

        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
          {sitemapData.map((section, idx) => (
            <div key={idx} className="flex flex-col">
              <h3 className="text-[14px] font-[600] text-[#1d1d1f] mb-3">
                {section.title}
              </h3>
              <ul className="flex flex-col space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href}
                      className="text-[13px] font-[400] text-[#0066cc] hover:underline"
                    >
                      {link.label}
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
