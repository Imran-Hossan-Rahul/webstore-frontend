import React from 'react';
import Link from 'next/link';

export default function MarketSEOContent() {
  return (
    <div className="w-full bg-transparent pt-12 pb-8 px-6 md:px-12 text-[#1d1d1f] font-sans">
      <div className="max-w-[980px] mx-auto space-y-8">
        
        {/* Section 1: Creator Credibility */}
        <section className="bg-[#f5f5f7] p-8 rounded-[24px] mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 bg-gray-200 border-2 border-white shadow-md">
              {/* Optional: Add actual avatar image here if available */}
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Creator Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-[20px] md:text-[24px] font-bold mb-2">Built by a Software Engineer for Creators</h2>
              <p className="text-[15px] leading-relaxed text-[#424245] mb-4">
                Hi, I'm the creator behind Codalina. I build production-ready SaaS templates, reliable automation scripts, and clean UI kits that actually work. With over 5+ years of full-stack engineering experience, I don't just sell code—I use these exact same tools to ship my own products faster. Every template here is architected for scalability, clean code, and developer happiness.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/imranhossan" target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-[#0071e3] hover:underline flex items-center gap-1">
                  GitHub Profile <span className="text-[12px]">↗</span>
                </a>
                <Link href="/portfolio" className="text-[14px] font-semibold text-[#0071e3] hover:underline flex items-center gap-1">
                  View Past Work <span className="text-[12px]">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Product Types */}
        <section>
          <h2 className="text-[18px] md:text-[22px] font-semibold mb-3">Premium Next.js & React SaaS Templates</h2>
          <p className="text-[14px] leading-relaxed text-[#424245]">
            Stop wasting weeks setting up authentication, database schemas, and payment gateways. Our SaaS boilerplates come pre-configured with the modern stack (Next.js, Tailwind, Prisma/Mongoose, Stripe) so you can focus entirely on your core business logic. Whether you're building an AI tool, a dashboard, or a marketplace, our templates get you to revenue in days, not months.
          </p>
        </section>

        {/* Section 3: Scripts */}
        <section>
          <h2 className="text-[18px] md:text-[22px] font-semibold mb-3">Automation Scripts & Developer Tools</h2>
          <p className="text-[14px] leading-relaxed text-[#424245]">
            Time is money. Our collection of Python and Node.js automation scripts helps you streamline repetitive tasks—from web scraping and data processing to automated social media posting. Each script is rigorously tested, thoroughly documented, and easy to integrate into your existing CI/CD pipelines or cron jobs.
          </p>
        </section>

        {/* Section 4: Value Proposition */}
        <section>
          <h2 className="text-[18px] md:text-[22px] font-semibold mb-3">Why Developers Choose Codalina Assets?</h2>
          <ul className="list-disc pl-5 text-[14px] leading-relaxed text-[#424245] space-y-2">
            <li><strong>Clean Architecture:</strong> We follow best practices. No spaghetti code. Period.</li>
            <li><strong>Lifetime Updates:</strong> When frameworks upgrade, so do our templates. You get free access to new versions.</li>
            <li><strong>Comprehensive Documentation:</strong> Every product comes with a detailed setup guide and API reference.</li>
            <li><strong>Direct Support:</strong> Get unblocked fast by talking directly to the engineer who wrote the code.</li>
          </ul>
        </section>

        {/* Section 5: FAQ */}
        <section className="pt-4 border-t border-[#e8e8ed]">
          <h2 className="text-[20px] md:text-[24px] font-bold mb-6 mt-4">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[15px] mb-2">1. What do I get when I purchase a template?</h3>
              <p className="text-[14px] text-[#424245]">You get immediate access to a secure download link containing the full source code repository, environmental variable templates, and a comprehensive README for local setup and deployment.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-[15px] mb-2">2. What is the difference between Personal and Commercial licenses?</h3>
              <p className="text-[14px] text-[#424245]">A Personal License is for non-profit/hobby projects or learning. A Commercial License allows you to use the code to build a product that generates revenue (e.g., selling a SaaS to users). You can read the full details on our EULA page.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[15px] mb-2">3. Do you offer refunds?</h3>
              <p className="text-[14px] text-[#424245]">Due to the non-returnable nature of digital source code, we generally do not offer refunds once the code has been downloaded. However, if you encounter a critical technical defect that we cannot fix, we will issue a refund within 7 days of purchase.</p>
            </div>

            <div>
              <h3 className="font-semibold text-[15px] mb-2">4. How do I get updates when a new version is released?</h3>
              <p className="text-[14px] text-[#424245]">All customers receive free lifetime updates for the product they purchased. When a new version is released (e.g., upgrading from Next.js 14 to 15), you will receive an email notification with a fresh download link.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-[15px] mb-2">5. Can I hire you to customize a template for me?</h3>
              <p className="text-[14px] text-[#424245]">Yes! If you need specific features integrated into one of our boilerplates, feel free to reach out via the contact page for custom freelance development rates.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
