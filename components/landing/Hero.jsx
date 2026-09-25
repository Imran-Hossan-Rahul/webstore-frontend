"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50 dark:opacity-20" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none -z-10 opacity-30 dark:opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-sky dark:bg-blue-900/20 text-brand-blue dark:text-blue-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
          </span>
          v2.0 is now live
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Unleash your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
            Creative Potential
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-brand-slate dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The all-in-one platform for craftsmen, developers, and teams to build, share, and grow. 
          Artifacts, codex, and community—all in one place.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link href="/auth/register">
            <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:-translate-y-0.5 transition-opacity duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20">
              Start Creating for Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="#demo">
            <button className="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-brand-cloud dark:hover:bg-slate-900 transition-colors flex items-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Demo
            </button>
          </Link>
        </div>

        {/* Social Proof / Trust */}
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Token-native economy</span>
            </div>
        </div>

        {/* Dashboard Preview / Illustration */}
        <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-brand-cloud dark:bg-slate-900/50 p-2 md:p-4 backdrop-blur-sm shadow-2xl">
                <div className="rounded-xl overflow-hidden bg-white dark:bg-black aspect-[16/9] relative group">
                     {/* Abstract UI Representation */}
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-black">
                        {/* Fake Sidebar */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-64 border-r border-dashed border-slate-200 dark:border-slate-800" />
                        {/* Fake Header */}
                        <div className="absolute left-16 md:left-64 right-0 top-0 h-16 border-b border-dashed border-slate-200 dark:border-slate-800" />
                        
                        {/* Content Area */}
                        <div className="absolute left-16 md:left-64 top-16 right-0 bottom-0 p-8 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-brand-blue rounded-lg animate-bounce" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-400">Dashboard Preview</h3>
                            </div>
                        </div>

                         {/* Hover Overlay */}
                         <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="glass-button px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/20">Interactive Preview</span>
                         </div>
                     </div>
                </div>
            </div>
            {/* Decorative blobs behind image */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-[80px] opacity-30 -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-blue rounded-full blur-[80px] opacity-30 -z-10" />
        </div>

      </div>
    </section>
  );
}


