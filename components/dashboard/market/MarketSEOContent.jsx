"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    question: "1. What do I get when I purchase a template?",
    answer: (
      <>
        After your payment is securely verified by our team, you will receive access to a secure download link containing the full source code repository, necessary environmental variable templates, and a comprehensive README for local setup and deployment. You will also be issued a unique <strong>License Key</strong> tied directly to your purchase. This license key grants you the legal right to use the template according to your selected tier. <br /><br />
        Please be aware that any unauthorized sharing, redistribution, or piracy of our products is strictly monitored and prohibited. To learn more about the legal consequences of piracy and license violations, please read our <Link href="/eula" className="text-brand-blue hover:underline font-semibold">End User License Agreement (EULA)</Link>.
      </>
    )
  },
  {
    question: "2. What are the differences between Personal, Commercial, and Extended licenses?",
    answer: (
      <>
        <strong>Personal License:</strong> Ideal for individuals or businesses building their <strong>own website</strong>. You can monetize it, but you cannot use it for client work.<br />
        <strong>Commercial License:</strong> Tailored for freelancers and agencies building a website for a <strong>single client</strong>.<br />
        <strong>Extended License:</strong> Best for freelancers, agencies, and SaaS businesses. It allows you to use the product for an <strong>unlimited number of clients</strong>.<br /><br />
        Please note that all licenses strictly prohibit the direct resale or redistribution of the raw source code. A mandatory footer attribution is required for Personal and Commercial licenses. For full details, please refer to our <Link href="/eula" className="text-brand-blue hover:underline font-semibold">End User License Agreement (EULA)</Link>.
      </>
    )
  },
  {
    question: "3. Do you offer refunds?",
    answer: (
      <>
        Due to the non-returnable nature of digital products and source code, our refund policy is strictly structured as follows:<br /><br />
        <strong>1. Before Payment Verification:</strong> If you have placed an order but your payment is not yet verified (meaning you haven&apos;t received the download link or work hasn&apos;t started), you can get a full refund. However, you MUST call us to request the refund <em>before</em> the payment verification is completed.<br />
        <strong>2. First Installment is Non-Refundable:</strong> Once your payment is verified and you receive access to the code, the first installment (deposit) is never refundable under any circumstances. Since the code is downloaded and work has begun, this amount covers the initial delivery and setup.<br />
        <strong>3. Cancellations & Disputes:</strong> If the project is canceled midway due to issues from either side, you will not be required to pay the remaining installments, but the first installment remains non-refundable.<br />
        <strong>4. Technical Defects:</strong> If you encounter a critical technical defect that we cannot fix, we will refund any extra money paid beyond the first installment. If you paid the full amount upfront, an amount equivalent to the first installment percentage will be deducted and kept, and the rest will be refunded.
      </>
    )
  },
  {
    question: "4. How do I get updates when a new version is released?",
    answer: "Whenever a major update or new version is released, we will send an email notification to all verified buyers. If your download link has expired or reached its download limit, you can request a refreshed secure download link by contacting our support team with your License Key."
  },
  {
    question: "5. Can I hire you to customize a template for me?",
    answer: "Yes! If you need specific features integrated into one of our boilerplates, feel free to reach out via the contact page for custom freelance development rates."
  }
];

export default function MarketSEOContent() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="w-full px-4 md:px-8 pb-8 pt-8 font-sans relative z-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[32px] md:rounded-[40px] shadow-sm relative overflow-hidden p-8 md:p-12 lg:p-16">
          
          <section className="max-w-[980px] mx-auto">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-brand-navy mb-8 mt-2">
              Frequently Asked Questions
            </h2>
            
            <div className="divide-y divide-brand-navy/[0.08] border-b border-brand-navy/[0.08]">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="py-5 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between gap-4 text-left group focus:outline-none cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-base md:text-lg text-brand-navy group-hover:text-brand-blue transition-colors">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-slate-400 group-hover:text-brand-blue transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-brand-blue" : ""
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 pb-2">
                            <p className="text-base md:text-[17px] leading-relaxed text-slate-600">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
