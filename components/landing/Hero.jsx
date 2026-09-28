"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import TechnicalBackground from "@/components/ui/TechnicalBackground";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-brand-navy text-white border-b border-brand-navy/[0.08] dark:border-white/10">
        
      {/* Background Elements - Subtle Tonal Variation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B2545] to-[#0B2545] -z-20" />
      <TechnicalBackground variant="grid-dark" />
      {/* Restrained Cyan Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-[800px] h-[400px] bg-brand-cyan opacity-[0.015] md:opacity-[0.03] blur-[60px] md:blur-[100px] rounded-[100%] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white dark:bg-brand-surface/5 border border-white/10 text-brand-cyan text-[11px] font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-cyan"></span>
          </span>
          v2.0 is now live
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tight text-white mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Engineering the <br className="hidden md:block" />
          <span className="text-white/70">
            Digital Future
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-brand-sky/60 mb-10 max-w-2xl mx-auto font-sans leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The enterprise platform for craftsmen, developers, and product teams. 
          Build, launch, and scale digital products with absolute precision.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link href="/auth/register">
            <button className="px-8 py-3.5 bg-brand-interaction text-white rounded-[4px] font-medium text-[15px] hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(29,95,209,0.15)] hover:shadow-[0_0_30px_rgba(29,95,209,0.25)] ring-1 ring-white/10">
              Start Engineering
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="#demo">
            <button className="px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-[4px] font-medium text-[15px] hover:bg-white dark:bg-brand-surface/5 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4 fill-current" />
              Watch Technical Demo
            </button>
          </Link>
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-12 flex items-center justify-center gap-8 text-[11px] font-mono tracking-widest uppercase text-brand-sky/40 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                <span>Enterprise Grade</span>
            </div>
        </div>

        {/* Dashboard Preview / Illustration */}
        <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-500">
            {/* Studio Lighting behind the hero object */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] md:w-[90%] h-[90%] md:h-[70%] bg-brand-cyan opacity-[0.015] md:opacity-[0.03] blur-[60px] md:blur-[120px] rounded-[100%] pointer-events-none -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] h-[70%] md:h-[50%] bg-brand-interaction opacity-[0.02] md:opacity-[0.05] blur-[50px] md:blur-[100px] rounded-[100%] pointer-events-none -z-10" />
            
            <div className="rounded-[4px] border border-white/10 bg-[#0B2545]/50 p-2 md:p-4 backdrop-blur-sm shadow-sm relative z-10">
                <div className="rounded-[4px] overflow-hidden bg-brand-surface dark:bg-[#0B2545] aspect-[16/9] relative group border border-brand-navy/[0.08] dark:border-white/5">
                     {/* Abstract UI Representation */}
                     <div className="absolute inset-0 bg-brand-main dark:bg-[#0B2545]">
                        {/* Fake Sidebar */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-64 border-r border-brand-navy/[0.08] dark:border-white/5 bg-brand-surface dark:bg-brand-navy" />
                        {/* Fake Header */}
                        <div className="absolute left-16 md:left-64 right-0 top-0 h-16 border-b border-brand-navy/[0.08] dark:border-white/5 bg-brand-surface dark:bg-brand-navy" />
                        
                        {/* Content Area */}
                        <div className="absolute left-16 md:left-64 top-16 right-0 bottom-0 p-8 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-white dark:bg-brand-surface/5 rounded-[4px] mx-auto mb-4 flex items-center justify-center">
                                    <div className="w-4 h-4 bg-brand-interaction rounded-[2px]" />
                                </div>
                                <h3 className="text-[11px] font-mono tracking-widest uppercase text-brand-slate dark:text-brand-sky/40">Platform Interface</h3>
                            </div>
                        </div>

                         {/* Hover Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                            <span className="px-6 py-2.5 rounded-[4px] text-[13px] font-medium bg-brand-interaction text-white shadow-sm">Initialize Interface</span>
                         </div>
                     </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
}
