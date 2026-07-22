"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ScanLandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative z-10">
      <motion.div 
        className="w-full max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mb-12">
          {/* Logo container matching the packaging C design */}
          <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] mb-6 transition-transform hover:scale-105 cursor-default relative">
             <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Minimalist C logo path inspired by the poly bag */}
                <path d="M70 25 L45 50 L70 75" stroke="black" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M45 50 L70 75" stroke="black" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
             </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 text-center">
            Codalina
          </h1>
          <p className="text-neutral-400 text-sm tracking-[0.2em] uppercase font-semibold text-center mt-2">
            Unbox. Explore. Innovate.
          </p>
        </motion.div>

        {/* Authentication Card */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 p-[1px] group hover:border-brand-primary/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl p-6 flex items-start space-x-4 border border-white/5">
              <div className="bg-emerald-500/10 p-3 rounded-full mt-1 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1 flex items-center">
                  Product Verified
                  <CheckCircle className="w-4 h-4 ml-2 text-emerald-400" />
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  This item is an authentic Codalina product. Thank you for scanning the QR code securely.
                </p>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-12 text-center flex flex-col items-center">
          <Link href="/market" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-8">
            Explore our Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-neutral-600 text-xs font-mono">
            © {new Date().getFullYear()} Codalina.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
