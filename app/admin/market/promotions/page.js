"use client";
import React from 'react';
import MarketPromotionsForm from '@/components/admin/MarketPromotionsForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MarketPromotionsPage() {
  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/market" className="p-2 hover:bg-brand-cloud dark:bg-[#0D1117] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[24px] font-display font-medium text-white tracking-tight">Marketplace Promotions</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Flash Deals, Trending Now, Grand Opening Offer, and Brand Spotlight</p>
        </div>
      </div>

      <MarketPromotionsForm />
    </div>
  );
}
