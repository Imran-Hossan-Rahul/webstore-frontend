"use client";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-900/10" />
      
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
          Ready to start your <br/>
          <span className="text-blue-600">creative journey?</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
          Join thousands of designers, developers, and creators improving their workflow today.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
           <Link href="/auth/register">
            <button className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-200 flex items-center gap-2 shadow-xl shadow-blue-500/20">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-8 py-4 bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              Contact Sales
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
