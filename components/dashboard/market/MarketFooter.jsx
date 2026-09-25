import React from 'react';
import Link from 'next/link';

export default function MarketFooter() {
  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { label: "Products", href: "/shop" },
        { label: "Software", href: "/shop?type=software" },
        { label: "Services", href: "/shop?type=service" },
        { label: "Solutions", href: "/solutions" },
        { label: "Support", href: "/support" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Work", href: "/work" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Blog", href: "/blog" },
        { label: "Updates", href: "/updates" }
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
    <footer className="w-full bg-brand-navy border-t border-white/5 font-sans pt-24 pb-28 md:pb-12 px-6 md:px-12 text-slate-400">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-8 mb-24">
          
          {/* Brand Column */}
          <div className="lg:w-1/3 flex flex-col">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              {/* Premium Logo Mark */}
              <div className="w-7 h-7 bg-transparent border border-white/20 group-hover:border-white/40 transition-colors flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 bg-brand-cyan absolute top-1 right-1 rounded-full shadow-[0_0_8px_#22C7E8]"></div>
                <span className="font-display font-semibold text-[14px] text-white">C</span>
              </div>
              <span className="font-display font-medium text-[20px] text-white tracking-wide">CODALINA</span>
            </Link>
            
            <p className="text-[15px] text-white/50 max-w-[240px] leading-relaxed">
              Digital technology partner.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            {footerLinks.map((column, idx) => (
              <div key={idx} className="flex flex-col">
                <h3 className="font-mono text-[11px] font-medium tracking-[0.1em] text-brand-cyan uppercase mb-6">{column.title}</h3>
                <ul className="flex flex-col gap-4">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link 
                        href={link.href} 
                        className="text-[14px] text-white/60 hover:text-white transition-colors duration-300 relative inline-block group"
                      >
                        {link.label}
                        <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-brand-cyan transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100"></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pt-8 border-t border-white/5 text-[13px] text-white/40">
          <p>© {new Date().getFullYear()} Codalina. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
             <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/30">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan/50"></span>
               Engineered in Dhaka
             </span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
