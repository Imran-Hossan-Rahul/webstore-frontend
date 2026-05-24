"use client";

import React from 'react';
import TieredVerification from '@/components/dashboard/TieredVerification';
import { ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="w-full max-w-6xl px-4 pt-4 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full">
        <TieredVerification />
        
        <div className="mt-16 text-center opacity-40">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">
            Powered by Career Integrity Protocol v4.2 • Secured by Forensic Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
