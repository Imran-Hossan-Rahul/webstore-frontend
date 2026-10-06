"use client";
import React from "react";
import Link from "next/link";
import { Mail, Globe, Facebook, Instagram, ShieldCheck } from "lucide-react";
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
    <footer className="w-full px-4 md:px-8 pb-8 pt-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[32px] md:rounded-[40px] shadow-sm relative overflow-hidden">
          
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-cyan/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />
          
          <div className="p-8 md:p-16">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">
              
              {/* Brand Section */}
              <div className="col-span-2 md:pr-8">
                <Link href="/" className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-brand-navy rounded-[8px] shadow-sm">
                    <div className="w-3 h-3 bg-white rounded-[2px] opacity-90" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[22px] font-display font-semibold tracking-tight text-brand-navy">
                      Codalina
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-[4px]">
                      Enterprise
                    </span>
                  </div>
                </Link>
                <p className="text-slate-500 font-sans text-[15px] max-w-sm mb-8 leading-relaxed">
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
                  <a href="https://codalina.com" target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-brand-navy text-white rounded-[12px] hover:bg-brand-blue transition-all flex items-center gap-2 shadow-sm font-medium" title="Access Portal">
                    <Globe className="w-4 h-4" />
                    <span className="text-[13px]">Access Portal</span>
                  </a>
                </div>
              </div>

              {/* Links Sections */}
              {Object.entries(links).map(([category, items]) => (
                <div key={category} className="col-span-1">
                  <h4 className="font-mono text-[11px] uppercase tracking-widest text-brand-navy font-semibold mb-6">{category}</h4>
                  <ul className="space-y-4">
                    {items.map((item) => (
                      <li key={item}>
                        <Link href="#" className="text-[14px] font-sans text-slate-500 hover:text-brand-blue transition-colors font-medium">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-brand-navy/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-[13px] font-mono text-slate-500 font-medium">
                  © {new Date().getFullYear()} CODALINA INC.
                </p>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <p className="text-[13px] font-mono text-slate-500 font-medium tracking-wide">
                  ENGINEERED IN DHAKA
                </p>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <Link href="/privacy" className="text-[13px] font-mono text-slate-500 font-medium hover:text-brand-blue transition-colors">
                  PRIVACY
                </Link>
                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <Link href="/terms" className="text-[13px] font-mono text-slate-500 font-medium hover:text-brand-blue transition-colors">
                  TERMS
                </Link>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-brand-cyan/5 border border-brand-cyan/20 rounded-[12px]">
                <div className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute w-full h-full rounded-full bg-brand-cyan opacity-75 animate-ping"></span>
                  <span className="relative w-1.5 h-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_#22C7E8]"></span>
                </div>
                <span className="text-[12px] font-mono text-brand-navy font-semibold tracking-widest uppercase">
                  System Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
