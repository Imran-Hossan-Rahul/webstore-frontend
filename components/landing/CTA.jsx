"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TechnicalBackground from "@/components/ui/TechnicalBackground";

export default function CTA() {
  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-brand-navy/[0.08] dark:border-white/10">
      {/* Background Tonal Variation */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06172E] to-brand-dark -z-20" />
      <TechnicalBackground variant="grid-dark" />
      
      {/* Restrained Cyan Accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] md:w-[600px] h-[200px] md:h-[300px] bg-brand-cyan opacity-[0.01] md:opacity-[0.02] blur-[60px] md:blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-6">
          Ready to deploy your <br/>
          <span className="text-brand-cyan">digital infrastructure?</span>
        </h2>
        <p className="text-lg md:text-xl text-brand-sky/60 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
          Join leading engineers, developers, and product teams building the next generation of software on Codalina.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/auth/register">
            <button className="px-8 py-3.5 bg-brand-interaction text-white rounded-[4px] font-medium text-[15px] hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(29,95,209,0.15)] hover:shadow-[0_0_30px_rgba(29,95,209,0.25)] ring-1 ring-white/10">
              Initialize Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-[4px] font-medium text-[15px] hover:bg-white dark:bg-brand-surface/5 transition-colors">
              Contact Enterprise Sales
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
