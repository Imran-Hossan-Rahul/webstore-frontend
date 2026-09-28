"use client";
import React from "react";
import Link from "next/link";
import { Mail, Globe, Facebook, Instagram } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function Footer() {
  const { showToast } = useToast();
  const links = {
    Platform: ["Features", "Digital Products", "Integrations", "Pricing", "Changelog"],
    Company: ["About Codalina", "Careers", "Engineering Blog", "Contact", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Developers API"],
    Legal: ["Privacy Policy", "Terms of Service", "Security", "Cookie Preferences"],
  };

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 border-t border-brand-navy/[0.08] dark:border-white/10 relative overflow-hidden">
      
      {/* Subtle Background Variation */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06172E] to-transparent -z-20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-brand-interaction rounded-[4px]">
                    <div className="w-3 h-3 bg-white dark:bg-brand-surface rounded-[2px] opacity-90" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-display font-medium tracking-tight text-white">
                      Codalina
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 rounded-[4px]">
                    Enterprise
                  </span>
                </div>
            </Link>
            <p className="text-brand-sky/60 font-sans text-[15px] max-w-xs mb-8 leading-relaxed">
                Empowering engineering teams to build the future of digital infrastructure. 
                Absolute precision. Complete control.
            </p>
            
            <div className="flex flex-wrap gap-3">
                <a 
                  href="mailto:info@codalina.com" 
                  onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText("info@codalina.com");
                      showToast("Email address copied to clipboard!", "success");
                      window.location.href = "mailto:info@codalina.com";
                  }}
                  className="p-2.5 bg-white dark:bg-brand-surface/5 border border-white/10 rounded-[4px] text-white/60 hover:text-white hover:bg-white dark:bg-brand-surface/10 hover:border-white/20 transition-all cursor-pointer" 
                  title="Email"
                >
                    <Mail className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61591711877853" target="_blank" rel="noreferrer" className="p-2.5 bg-white dark:bg-brand-surface/5 border border-white/10 rounded-[4px] text-white/60 hover:text-white hover:bg-white dark:bg-brand-surface/10 hover:border-white/20 transition-all cursor-pointer" title="Facebook">
                    <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/codalinaglobal/" target="_blank" rel="noreferrer" className="p-2.5 bg-white dark:bg-brand-surface/5 border border-white/10 rounded-[4px] text-white/60 hover:text-white hover:bg-white dark:bg-brand-surface/10 hover:border-white/20 transition-all cursor-pointer" title="Instagram">
                    <Instagram className="w-4 h-4" />
                </a>
                <a href="https://codalina.com" target="_blank" rel="noreferrer" className="p-2.5 bg-brand-interaction border border-blue-500/50 rounded-[4px] text-white hover:bg-blue-600 transition-all flex items-center gap-2 px-4" title="Order Now">
                    <Globe className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Access Portal</span>
                </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-brand-sky/40 mb-6">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-[14px] text-white/60 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-[13px] font-mono text-brand-sky/40">
                  © {new Date().getFullYear()} CODALINA INC.
              </p>
              <div className="w-1 h-1 rounded-full bg-brand-sky/20" />
              <p className="text-[13px] font-mono text-brand-sky/40">
                  ENGINEERED IN DHAKA
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-[13px] font-mono text-brand-sky/40">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#22C7E8]" />
                SYSTEM OPERATIONAL
            </div>
        </div>

      </div>
    </footer>
  );
}
