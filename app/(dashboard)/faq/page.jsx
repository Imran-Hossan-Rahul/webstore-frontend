"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
      >
        <span className="text-[16px] font-sans font-medium text-brand-navy dark:text-white group-hover:text-brand-blue transition-colors">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-[15px] font-sans text-slate-500 leading-relaxed max-w-[800px]">
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const faqs = [
    {
      category: "Purchasing & Licenses",
      items: [
        {
          question: "What is the difference between a Personal and Commercial license?",
          answer: "A Personal license is for non-commercial projects, meaning you cannot charge users or include ads. A Commercial license allows you to use the product in a project that generates revenue, either for yourself or for one client. For SaaS platforms where you charge end-users, you need an Extended license."
        },
        {
          question: "Can I use a purchased template for multiple clients?",
          answer: "No. Our standard Commercial license covers use for a single client or end product. If you wish to build multiple distinct projects for different clients using the same template, you must purchase a separate license for each."
        },
        {
          question: "How do I download my digital products after purchase?",
          answer: "Once your payment is successfully processed, the files are immediately available in your account dashboard under 'Orders' or 'Downloads'. We will also send a secure download link to your registered email address."
        }
      ]
    },
    {
      category: "Support & Updates",
      items: [
        {
          question: "Do you provide technical support for digital products?",
          answer: "Yes, we provide 6 months of basic technical support with every digital purchase. This covers bug fixes and guidance on standard installation. It does not cover custom development, server configuration, or modifying the code beyond its original intended use."
        },
        {
          question: "Are updates included with my purchase?",
          answer: "Yes. When you purchase a software product, UI kit, or template, you receive lifetime access to all future updates for that specific major version."
        },
        {
          question: "Can I hire Codalina to customize a template for me?",
          answer: "Absolutely. Codalina operates as a full-service digital agency. You can contact our sales team through the Support page to discuss custom development, architecture, and maintenance plans."
        }
      ]
    },
    {
      category: "Refunds & Warranty",
      items: [
        {
          question: "Can I get a refund if I change my mind?",
          answer: "Due to the non-returnable nature of digital assets, we do not offer 'change of mind' refunds once the product has been downloaded or the license key revealed. Refunds are strictly limited to verified technical defects that our team cannot resolve."
        },
        {
          question: "How does the hardware warranty work?",
          answer: "All hardware purchased through the Codalina Marketplace comes with a verified manufacturer warranty. You can check the status of your warranty at any time using our Warranty Lookup tool with your serial number."
        }
      ]
    }
  ];

  return (
    <PageContainer maxWidth="max-w-[800px]" className="py-16 md:py-24">
      <header className="text-center mb-16">
        <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
          Knowledge Base
        </p>
        <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
          Frequently Asked Questions
        </h1>
        <p className="text-[17px] font-sans text-slate-500 dark:text-slate-400 max-w-[640px] mx-auto leading-relaxed mb-8">
          Answers to the most common questions about licensing, purchasing, and using Codalina digital products.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/support" className="text-[13px] font-sans font-medium text-brand-blue hover:underline">
            Contact Support
          </Link>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
          <Link href="/legal" className="text-[13px] font-sans font-medium text-brand-blue hover:underline">
            Legal Resources
          </Link>
        </div>
      </header>

      <div className="space-y-12">
        {faqs.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-[14px] font-mono font-medium uppercase tracking-widest text-slate-400 mb-4 px-2">
              {section.category}
            </h2>
            <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] px-6">
              {section.items.map((item, itemIdx) => (
                <FAQItem key={itemIdx} question={item.question} answer={item.answer} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageContainer>
  );
}
