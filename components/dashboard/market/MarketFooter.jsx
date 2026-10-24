"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Globe, Facebook, Instagram } from 'lucide-react';

export default function MarketFooter() {
  const pathname = usePathname();
  const isPartnerPage = pathname?.startsWith('/partner');
  
  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { label: "Products", href: "/store" },
        { label: "Services", href: "/#services" },
        { label: "Support", href: "/support" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Codalina Academy", href: "/blog" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" }
      ]
    }
  ];

  return (
    <footer className="w-full px-4 md:px-8 pb-8 pt-10 font-sans">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[32px] md:rounded-[40px] shadow-sm relative overflow-hidden p-8 md:p-12 lg:p-16">
          
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-cyan/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />
          
          {/* Main Footer Content */}
          <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-16 md:mb-24">
            
            <div className="lg:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/" className="flex items-center gap-2 mb-6 group">
                  <div className="p-2 bg-brand-navy rounded-[8px] shadow-sm transform group-hover:scale-105 transition-transform duration-300">
                    <div className="w-3 h-3 bg-white rounded-[2px] opacity-90" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[22px] font-display font-semibold tracking-tight text-brand-navy">
                      Codalina
                    </span>
                  </div>
              </Link>
              
              <p className="text-[15px] font-sans text-slate-500 max-w-[240px] leading-relaxed mx-auto md:mx-0">
                {isPartnerPage ? "Your technical partner for growth. We build, you scale." : "Digital technology partner. Absolute precision. Complete control."}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
                <a 
                  href="mailto:info@codalina.com" 
                  className="p-2.5 bg-white/60 backdrop-blur-md border border-brand-navy/[0.08] rounded-[12px] text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-sm" 
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61591711877853" target="_blank" rel="noreferrer" className="p-2.5 bg-white/60 backdrop-blur-md border border-brand-navy/[0.08] rounded-[12px] text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-sm" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/codalinaglobal/" target="_blank" rel="noreferrer" className="p-2.5 bg-white/60 backdrop-blur-md border border-brand-navy/[0.08] rounded-[12px] text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-sm" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:w-2/3 grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
              {footerLinks.map((column, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <h3 className="font-mono text-[11px] font-semibold tracking-widest text-brand-navy uppercase mb-6">{column.title}</h3>
                  <ul className="flex flex-col gap-4 items-center md:items-start">
                    {column.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link 
                          href={link.href} 
                          className="text-[14px] text-slate-500 hover:text-brand-blue font-medium transition-colors duration-300 relative inline-block group"
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

          {/* Bottom Copyright Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-8 border-t border-brand-navy/[0.08] text-[13px] text-slate-500 gap-4 sm:gap-0 font-medium">
            <p className="text-center sm:text-left">© {new Date().getFullYear()} Codalina. All rights reserved.</p>
            <div className="flex items-center justify-center sm:justify-end">
               <span className="flex items-center gap-2 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-slate-500 whitespace-nowrap">
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                 Engineered in Dhaka
               </span>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
