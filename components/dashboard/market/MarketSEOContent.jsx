"use client";
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    question: "1. What do I get when I purchase a template?",
    answer: "You get immediate access to a secure download link containing the full source code repository, environmental variable templates, and a comprehensive README for local setup and deployment."
  },
  {
    question: "2. What is the difference between Personal and Commercial licenses?",
    answer: "A Personal License is for non-profit/hobby projects or learning. A Commercial License allows you to use the code to build a product that generates revenue (e.g., selling a SaaS to users). You can read the full details on our EULA page."
  },
  {
    question: "3. Do you offer refunds?",
    answer: "Due to the non-returnable nature of digital source code, we generally do not offer refunds once the code has been downloaded. However, if you encounter a critical technical defect that we cannot fix, we will issue a refund within 7 days of purchase."
  },
  {
    question: "4. How do I get updates when a new version is released?",
    answer: "All customers receive free lifetime updates for the product they purchased. When a new version is released (e.g., upgrading from Next.js 14 to 15), you will receive an email notification with a fresh download link."
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
    <div className="w-full bg-brand-navy py-16 px-6 md:px-12 font-sans relative z-10">
      <div className="max-w-[980px] mx-auto">
        
        {/* Section: FAQ Accordion */}
        <section className="pt-4 border-t border-white/10">
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-white mb-8 mt-2">
            Frequently Asked Questions
          </h2>
          
          <div className="divide-y divide-white/10 border-b border-white/10">
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
                    <span className="font-semibold text-base md:text-lg text-white group-hover:text-brand-cyan transition-colors">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-slate-400 group-hover:text-brand-cyan transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-brand-cyan" : ""
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
                          <p className="text-base md:text-[17px] leading-relaxed text-slate-300">
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
  );
}
