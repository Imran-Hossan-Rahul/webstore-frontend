"use client";
import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Tag, BookOpen, ChevronRight, CheckCircle2, Zap, Package } from 'lucide-react';

import { PageContainer } from '@/components/ui/PageContainer';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DigitalDeliveryPolicy() {
  return (
    <PageContainer maxWidth="max-w-[1000px]">
      
      {/* Hero Section */}
      <div className="pb-12 border-b border-slate-200 dark:border-white/10 mb-16">
        <div className="flex items-center gap-2 text-[11px] font-mono font-medium uppercase tracking-widest text-slate-500 mb-6">
          <Link href="/" className="hover:text-brand-navy dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-navy dark:text-white">Digital Delivery</span>
        </div>
        <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-4 leading-tight">
          Instant Digital Delivery.<br className="hidden sm:block" /> Always.
        </h1>
        <p className="mt-4 text-[16px] sm:text-[18px] font-sans text-slate-500 max-w-[600px] leading-relaxed">
          All products on Codalina are delivered digitally. No shipping, no waiting. Your download is available the moment your purchase is confirmed.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Card className="bg-brand-cloud dark:bg-[#161B22]">
          <CardContent className="p-6">
            <Zap size={24} className="text-brand-blue mb-4" strokeWidth={2} />
            <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-2">Instant Access</h3>
            <p className="text-[14px] font-sans text-slate-500 leading-relaxed">
              Download links are generated and attached to your order the moment payment is confirmed. No delays.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-brand-cloud dark:bg-[#161B22]">
          <CardContent className="p-6">
            <Tag size={24} className="text-brand-blue mb-4" strokeWidth={2} />
            <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-2">Clear Licensing</h3>
            <p className="text-[14px] font-sans text-slate-500 leading-relaxed">
              Every product specifies a license type — Personal, Commercial, or Extended — before you purchase.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-brand-cloud dark:bg-[#161B22]">
          <CardContent className="p-6">
            <ShieldCheck size={24} className="text-brand-blue mb-4" strokeWidth={2} />
            <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-2">Secure Downloads</h3>
            <p className="text-[14px] font-sans text-slate-500 leading-relaxed">
              Download links are authenticated and tied to your account. Files are never publicly accessible.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-[24px] sm:text-[28px] font-display font-medium text-brand-navy dark:text-white mb-8">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: '1', icon: Package, title: 'Browse & Purchase', desc: 'Choose your product and complete the checkout. A confirmation may be made for digital orders.' },
            { step: '2', icon: CheckCircle2, title: 'Order Confirmed', desc: 'Once your order is marked Confirmed by our team, the download link is attached to your order in the system.' },
            { step: '3', icon: Download, title: 'Download from Your Orders', desc: 'Visit your Orders page and click the Download button next to the fulfilled order. The file is yours to keep.' },
            { step: '4', icon: BookOpen, title: 'Read the Docs', desc: 'Every product includes documentation links. Use them to get started quickly and get the most from your purchase.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <Card key={step}>
              <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-start gap-5">
                <div className="shrink-0 w-8 h-8 rounded-[4px] bg-brand-cloud dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 text-brand-navy dark:text-white flex items-center justify-center font-mono font-medium text-[13px]">
                  {step}
                </div>
                <div>
                  <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-1 flex items-center gap-2">
                    <Icon size={16} strokeWidth={2} className="text-brand-blue" /> {title}
                  </h3>
                  <p className="text-[14px] font-sans text-slate-500 leading-relaxed mt-2">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* License Types */}
      <div className="mb-16">
        <h2 className="text-[24px] sm:text-[28px] font-display font-medium text-brand-navy dark:text-white mb-8">License Types Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: 'Personal', borderColor: 'border-slate-200 dark:border-white/10', variant: 'default', desc: 'Use the product in personal, non-commercial projects. You may not sell, redistribute, or use in client work.' },
            { type: 'Commercial', borderColor: 'border-brand-blue/30 dark:border-brand-blue/20', variant: 'primary', desc: 'Use in client projects and commercial products. Perfect for freelancers and agencies.' },
            { type: 'Extended', borderColor: 'border-brand-teal/30 dark:border-brand-teal/20', variant: 'success', desc: 'You may resell or include this product in items sold to end-users (e.g., bundled in a SaaS product or theme marketplace).' },
          ].map(({ type, borderColor, variant, desc }) => (
            <Card key={type} className={borderColor}>
              <CardContent className="p-6">
                <Badge variant={variant} className="mb-4">
                  {type} License
                </Badge>
                <p className="text-[14px] font-sans text-slate-500 leading-relaxed">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Refund Policy */}
      <Card className="bg-brand-cloud dark:bg-[#161B22]">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-[20px] font-display font-medium text-brand-navy dark:text-white mb-4">Refund Policy for Digital Products</h2>
          <p className="text-[14px] font-sans text-slate-500 leading-relaxed mb-4">
            Because digital products are delivered instantly and cannot be returned, all sales are final once the download has been served. However, we offer refunds in the following cases:
          </p>
          <ul className="space-y-3 mb-6">
            {[
              'The product files are corrupted or incomplete.',
              'The product description was materially misleading.',
              'A technical issue prevented you from accessing the download within 48 hours of confirmed order.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] font-sans text-brand-navy dark:text-slate-300">
                <CheckCircle2 size={18} className="text-brand-blue mt-0.5 shrink-0" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[14px] font-sans text-slate-500">
            To request a refund, contact us at{' '}
            <a href="mailto:info@codalina.com" className="text-brand-blue hover:underline transition-colors">info@codalina.com</a>
            {' '}with your order ID.
          </p>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
