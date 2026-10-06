import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Tag, Code2, Rocket, Server, ChevronRight, CheckCircle2, Zap, MonitorPlay } from 'lucide-react';
import GlassBackground from '@/components/dashboard/market/GlassBackground';

export const metadata = {
  title: 'Delivery & Hand-off Policy - Codalina',
  description: 'How we deliver custom web projects and premium templates at Codalina Agency.',
};

export default function DeliveryPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-sans pb-24 selection:bg-brand-navy selection:text-white">
      <GlassBackground />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 xl:px-12 pt-28 md:pt-36">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm text-brand-navy text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-[20px] mb-6">
            Delivery & Hand-off
          </div>
          <h1 className="text-[36px] md:text-[52px] font-bold text-brand-navy font-display leading-[1.1] mb-4 tracking-tight max-w-[800px]">
            How We Deliver <span className="text-brand-blue">Excellence</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-slate-500 max-w-[600px] leading-relaxed">
            Whether you are purchasing a premium digital template or commissioning a custom web application, our delivery process is fast, secure, and transparent.
          </p>
        </div>

        {/* Custom Web Development Delivery */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-[28px] md:text-[32px] font-bold text-brand-navy font-display">
              Custom Agency Projects
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1200px] mx-auto">
            {[
              { icon: MonitorPlay, title: 'Staging Environment', desc: 'During development, you get access to a live staging server to monitor progress and provide feedback in real-time.' },
              { icon: CheckCircle2, title: 'Milestone Approvals', desc: 'Large projects are divided into milestones. We only proceed to the next phase after your explicit sign-off on the current one.' },
              { icon: Rocket, title: 'Final Deployment', desc: 'Upon final approval, we handle the complete deployment to your production servers, domain configuration, and SSL setup.' }
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div 
                key={idx} 
                className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-6 hover:shadow-md hover:border-brand-blue/20 transition-all duration-300"
              >
                <h3 className="text-[16px] font-semibold text-brand-navy font-display mb-2">
                  {title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Assets & Templates Delivery */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-[28px] md:text-[32px] font-bold text-brand-navy font-display">
              Premium Templates & Assets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-[1200px] mx-auto">
            {[
              { icon: Download, title: 'Instant Downloads', desc: 'Download links are generated and attached to your order the absolute second your payment is confirmed. No delays.' },
              { icon: ShieldCheck, title: 'Secure Access', desc: 'Your purchased files are tied to your account and securely hosted. They are never publicly accessible.' },
              { icon: Server, title: 'Lifetime Updates', desc: 'When we push an update to a template you own, you can download the latest version from your dashboard instantly.' }
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div 
                key={idx} 
                className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-6 hover:shadow-md hover:border-brand-blue/20 transition-all duration-300"
              >
                <h3 className="text-[16px] font-semibold text-brand-navy font-display mb-2">
                  {title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* License Types Explained */}
        <div className="mb-20">
          <h2 className="text-[24px] sm:text-[28px] font-bold text-brand-navy font-display mb-8 text-center">
            Software License Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
            {[
              { type: 'Personal', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-brand-navy/[0.08]', desc: 'Use the product in personal, non-commercial projects. You may not sell, redistribute, or use in client work.' },
              { type: 'Commercial', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', desc: 'Use in client projects and commercial products. Perfect for freelancers and agencies building for clients.' },
              { type: 'Extended', color: 'text-brand-navy', bg: 'bg-brand-navy/10', border: 'border-brand-navy/20', desc: 'You may resell or include this product in items sold to end-users (e.g., bundled in a SaaS product or theme).' },
            ].map(({ type, color, bg, border, desc }) => (
              <div key={type} className={`bg-white/40 backdrop-blur-md border ${border} shadow-sm rounded-[20px] p-8`}>
                <div className={`inline-flex px-3 py-1 rounded-full ${bg} ${color} text-[12px] font-bold tracking-wide uppercase mb-4`}>
                  {type} License
                </div>
                <p className="text-[14px] font-sans text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="max-w-[800px] mx-auto text-center bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-8 md:p-12">
          <h2 className="text-[20px] font-display font-medium text-brand-navy mb-4">Have questions about a delivery?</h2>
          <p className="text-[15px] font-sans text-slate-500 leading-relaxed mb-6">
            If you're having trouble downloading your assets or need an update on your custom project milestone, our support team is available.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="px-6 py-3 bg-brand-navy text-white text-[14px] font-medium rounded-xl hover:bg-brand-blue transition-colors">
              Contact Support
            </Link>
            <Link href="/warranty" className="px-6 py-3 bg-white text-brand-navy border border-brand-navy/20 text-[14px] font-medium rounded-xl hover:bg-slate-50 transition-colors">
              View Warranty
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
