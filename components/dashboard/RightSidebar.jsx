"use client";
import React, { useContext } from "react";
import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { DashboardContext } from "../../app/(dashboard)/layout";

export default function RightSidebar({ isMarket, hideWallet, hideStats }) {
  const { user } = useContext(DashboardContext) || {};
  
  // Minimal contextual data to mimic a premium SaaS interface
  const featuredProduct = {
    title: "Headless Commerce Kit",
    description: "Next.js 15 + Stripe + Tailwind template for high-performance storefronts.",
    href: "/store?type=product"
  };

  return (
    <aside className="h-full flex flex-col gap-8 pb-10 pr-2 relative">
      
      {/* Workspace Header */}
      <div className="flex flex-col gap-1 mt-4">
        <span className="text-[10px] font-mono font-medium tracking-widest text-brand-cyan uppercase">Codalina</span>
        <h2 className="text-[15px] font-semibold text-brand-navy">Your workspace</h2>
      </div>

      {/* Stats Blocks */}
      <div className="flex gap-4">
        <div className="flex-1 border-l-2 border-brand-blue pl-3 py-1">
           <div className="text-[20px] font-display font-bold text-brand-navy mb-0.5">03</div>
           <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Digital Products</div>
        </div>
        <div className="flex-1 border-l-2 border-brand-teal pl-3 py-1">
           <div className="text-[20px] font-display font-bold text-brand-navy mb-0.5">02</div>
           <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Active Services</div>
        </div>
      </div>

      <div className="w-full h-[1px] bg-slate-200"></div>

      {/* Featured Section */}
      <div className="flex flex-col">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-4">Featured</span>
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-4 group hover:border-brand-blue/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-8 h-8 rounded-[12px] bg-brand-blue/10 flex items-center justify-center shrink-0">
               <Cpu className="w-4 h-4 text-brand-blue" />
             </div>
             <h3 className="text-[13px] font-semibold text-brand-navy leading-tight">{featuredProduct.title}</h3>
          </div>
          <p className="text-[12px] text-slate-500 mb-4 leading-relaxed">
            {featuredProduct.description}
          </p>
          <Link href={featuredProduct.href} className="inline-flex items-center text-[12px] font-semibold text-brand-blue hover:text-brand-navy transition-colors gap-1 group-hover:gap-2">
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>


    </aside>
  );
}
