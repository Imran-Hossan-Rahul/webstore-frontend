import React from 'react';
import { ShieldCheck, Zap, Package, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Zap size={32} className="text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Fast Delivery",
      description: "Get your digital and physical products delivered almost instantly with our optimized pipeline."
    },
    {
      icon: <ShieldCheck size={32} className="text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Secure Payments",
      description: "Your transactions are protected by industry-leading encryption and top-tier security standards."
    },
    {
      icon: <Package size={32} className="text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "Quality Assured",
      description: "Every product on Codalina is thoroughly tested to guarantee the highest quality."
    },
    {
      icon: <Headphones size={32} className="text-[#1d1d1f] mb-4" strokeWidth={1.5} />,
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help you with any issues or queries."
    }
  ];

  return (
    <section className="w-full bg-[#f5f5f7] py-24 px-6 md:px-12 border-t border-[#e8e8ed] font-sans">
      <div className="max-w-[980px] mx-auto text-center">
        {/* Apple Style Header */}
        <p className="uppercase text-[12px] tracking-[0.12em] font-semibold text-brand-blue mb-4">
          Who We Are
        </p>
        <h2 className="text-[40px] md:text-[56px] font-bold text-[#1d1d1f] tracking-[-0.02em] leading-tight mb-6">
          Codalina. <br className="hidden md:block" /> Built for excellence.
        </h2>
        <p className="text-[21px] text-[#86868b] font-normal max-w-[640px] mx-auto mb-16 leading-relaxed">
          We provide the most premium digital and physical products with an unwavering commitment to quality, speed, and design.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 text-center mb-16">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {feature.icon}
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight mb-2">
                {feature.title}
              </h3>
              <p className="text-[15px] text-[#86868b] leading-[1.47] font-normal max-w-[260px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Apple Style Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/auth/register"
            className="inline-flex items-center justify-center bg-brand-blue text-white text-[17px] font-normal px-[22px] py-[11px] rounded-[980px] hover:bg-[#005bb5] transition-colors"
          >
            Join Codalina
          </Link>
          <Link 
            href="/about"
            className="inline-flex items-center justify-center bg-transparent border border-brand-blue text-brand-blue text-[17px] font-normal px-[22px] py-[11px] rounded-[980px] hover:bg-brand-blue hover:text-white transition-colors"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
