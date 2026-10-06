"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Briefcase, Users, Handshake, Code2, Globe, ShieldCheck, Zap, ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import OrdersList from '@/components/orders/OrdersList';
import { api } from '@/utils/api';

// TODO: Replace these placeholders with real data when available
const PARTNER_CONFIG = {
  AGENCIES: "{{AGENCIES}}", // e.g. "50"
  PROJECTS: "{{PROJECTS}}", // e.g. "200"
  RESPONSE_TIME: "{{RESPONSE_TIME}}", // e.g. "< 2h"
  RATING: "{{RATING}}", // e.g. "4.9"
  COMMISSION_PERCENT: "10", // e.g. "20"
  DISCOUNT_PERCENT: "10", // e.g. "30"
};

const PARTNER_LOGOS = [
  // TODO: Add real grayscale logo URLs
  { name: "{{COMPANY_1}}", url: "" },
  { name: "{{COMPANY_2}}", url: "" },
  { name: "{{COMPANY_3}}", url: "" },
  { name: "{{COMPANY_4}}", url: "" }
];

const TESTIMONIAL = {
  quote: "{{TESTIMONIAL_QUOTE}}", // e.g. "Partnering with Codalina has allowed us to take on complex web projects we previously had to turn down."
  name: "{{TESTIMONIAL_NAME}}",
  role: "{{TESTIMONIAL_ROLE}}",
  company: "{{TESTIMONIAL_COMPANY}}",
  avatar: "" // TODO: Add avatar URL
};

const FAQ_ITEMS = [
  { 
    question: "Is there a minimum commitment?", 
    answer: "No, there is no minimum commitment. Our White-Label and Custom Development models operate on a per-project basis. For affiliates, you can refer as many or as few clients as you wish with no strict quotas." 
  },
  { 
    question: "How and when do I get paid (affiliate)?", 
    answer: "Affiliate commissions are calculated upon successful payment verification of the referred order. Payouts are processed on a monthly basis via bank transfer, mobile banking, or your preferred standard payment gateway once the minimum threshold is met." 
  },
  { 
    question: "What does white-label include? Will my client ever see Codalina's name?", 
    answer: "White-label means complete anonymity. We operate entirely behind the scenes. We deliver the final source code, handle deployments, and manage the technical infrastructure, but your client will only ever interact with your agency. Codalina's name, branding, and footprints are strictly removed under the Extended/Custom license." 
  },
  { 
    question: "What types of projects do you handle?", 
    answer: "We specialize in scalable web solutions, including Company Websites, Enterprise E-Commerce storefronts, complex SaaS platforms, Custom Web Applications, and Internal Tools/APIs. We also offer Proactive Maintenance for long-term support." 
  },
  { 
    question: "How long does onboarding take?", 
    answer: "Onboarding is incredibly fast. Once you submit your application, our partnership manager will review and contact you within 24 hours. After a brief alignment call, you can immediately begin referring clients or submitting white-label project briefs." 
  },
  { 
    question: "Do you sign NDAs?", 
    answer: "Absolutely. We take confidentiality very seriously. For all white-label and custom agency projects, we sign strict Non-Disclosure Agreements (NDAs) to protect your intellectual property, client relationships, and business ideas." 
  }
];

export default function PartnerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedInterest, setSelectedInterest] = useState("White-Label Development");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  const formRef = useRef(null);
  const howItWorksRef = useRef(null);
  const firstInputRef = useRef(null);

  const scrollToForm = (interest = null) => {
    if (interest) setSelectedInterest(interest);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
      }, 500);
    }
  };

  const scrollToHowItWorks = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.get('companyName')) errors.companyName = "Company Name is required";
    if (!formData.get('name')) errors.name = "Name is required";
    const email = formData.get('email');
    if (!email) errors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Invalid email format";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        projectType: 'Partnership - ' + formData.get('partnershipType'),
        budget: formData.get('budget') || 'N/A',
        timeline: formData.get('timeline') || 'Flexible',
        projectDetails: formData.get('message'),
        source: 'Partner Program'
      };

      const res = await api.post('/market/orders/custom-brief', payload);
      
      if (!user && res && res.data && res.data._id) {
         try {
           const existing = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
           if (!existing.includes(res.data._id)) {
             existing.push(res.data._id);
             localStorage.setItem('codalina_guest_orders', JSON.stringify(existing));
           }
         } catch(err) {}
      }

      setIsSubmitting(false);
      setSubmitted(true);
      setOrderId(res.data?._id || res.data?.orderId);
    } catch (err) {
      setIsSubmitting(false);
      alert("Failed to submit application: " + err.message);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-transparent pb-24">
      {/* Hero Section */}
      <div className="pt-24 pb-12 px-6 relative z-10 max-w-[1200px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[12px] font-semibold tracking-wide uppercase mb-6">
          <Handshake size={14} aria-hidden="true" /> Partner Program
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[32px] md:text-[48px] lg:text-[56px] font-display font-medium text-brand-navy mb-6 leading-[1.1] tracking-tight">
          Scale your agency with <br className="hidden md:block" />
          <span className="text-brand-blue">Expert Engineering</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[16px] md:text-[18px] text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Expand your service offerings and deliver premium web solutions to your clients without hiring a full in-house development team.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => scrollToForm()} className="h-12 px-8 bg-brand-navy text-white rounded-full font-medium text-[15px] hover:bg-brand-blue hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-brand-blue/30">
            Become a Partner
          </button>
          <button onClick={scrollToHowItWorks} className="h-12 px-6 text-brand-navy font-medium text-[15px] hover:text-brand-blue transition-colors focus:outline-none focus:underline">
            See how it works
          </button>
        </motion.div>
      </div>

      {/* Social Proof */}
      {/* Temporarily hidden: Social Proof (No clients/projects yet) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hidden max-w-[1200px] mx-auto px-4 md:px-6 mb-16 relative z-10">
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[24px] p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-brand-navy/10 pb-8 mb-8">
            <div>
              <div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">{PARTNER_CONFIG.AGENCIES}+</div>
              <div className="text-[13px] text-slate-600 mt-1">Agencies Partnered</div>
            </div>
            <div>
              <div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">{PARTNER_CONFIG.PROJECTS}+</div>
              <div className="text-[13px] text-slate-600 mt-1">Projects Delivered</div>
            </div>
            <div>
              <div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">{PARTNER_CONFIG.RESPONSE_TIME}</div>
              <div className="text-[13px] text-slate-600 mt-1">Avg. Response Time</div>
            </div>
            <div>
              <div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">{PARTNER_CONFIG.RATING}/5</div>
              <div className="text-[13px] text-slate-600 mt-1">Partner Satisfaction</div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <p className="text-[12px] font-semibold tracking-wider text-slate-500 uppercase mb-4 text-center lg:text-left">Trusted by agencies like</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 opacity-60 grayscale">
                {PARTNER_LOGOS.map((logo, i) => (
                   <div key={i} className="font-display font-bold text-xl text-slate-800">{logo.name}</div>
                ))}
              </div>
            </div>
            <div className="lg:w-[400px] bg-white/60 p-5 rounded-2xl border border-brand-navy/5 shadow-sm italic text-slate-700 text-[14px]">
              "{TESTIMONIAL.quote}"
              <div className="flex items-center gap-3 mt-4 not-italic">
                {TESTIMONIAL.avatar ? (
                  <img src={TESTIMONIAL.avatar} alt={TESTIMONIAL.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                )}
                <div>
                  <div className="font-semibold text-brand-navy text-[13px]">{TESTIMONIAL.name}</div>
                  <div className="text-[12px] text-slate-500">{TESTIMONIAL.role}, {TESTIMONIAL.company}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Content Area (Left) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Partnership Types */}
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-blue" aria-hidden="true" />
              Partnership Models
            </h2>
            <div className="grid md:grid-cols-2 gap-4 xl:gap-6">
              <div 
                onClick={() => scrollToForm("White-Label Development")}
                className={`border-2 p-6 rounded-[16px] transition-all flex flex-col h-full cursor-pointer group relative overflow-hidden ${selectedInterest === "White-Label Development" ? "bg-white border-brand-blue shadow-[0_8px_30px_rgba(29,95,209,0.12)]" : "bg-white/60 border-brand-navy/[0.04] hover:border-brand-blue/30 hover:bg-white/80"}`}
              >
                <div className="flex justify-center items-start mb-4">
                  <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-[11px] font-semibold rounded-full">
                    Up to {PARTNER_CONFIG.DISCOUNT_PERCENT}% margin
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-brand-navy mb-2">White-Label Agency</h3>
                <p className="text-[13px] text-slate-700 leading-relaxed mb-4">
                  Unlike buying an Extended License, we act as your dedicated engineering team. We handle the complex coding, server setup, and maintenance.
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Dedicated team & project manager</li>
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Custom integrations & API setup</li>
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Strict NDA for complete anonymity</li>
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Handover & maintenance support</li>
                </ul>
                <div className={`text-[13px] font-medium flex items-center gap-1.5 transition-all w-fit mt-auto ${selectedInterest === "White-Label Development" ? "bg-brand-blue text-white px-4 py-2 rounded-full shadow-md shadow-brand-blue/20" : "text-brand-blue group-hover:gap-2"}`}>
                  {selectedInterest === "White-Label Development" ? (
                    <><CheckCircle size={14} /> Selected</>
                  ) : (
                    <>Choose this model <ArrowRight size={14} /></>
                  )}
                </div>
              </div>
              
              <div 
                onClick={() => scrollToForm("Affiliate/Referral")}
                className={`border-2 p-6 rounded-[16px] transition-all flex flex-col h-full cursor-pointer group relative overflow-hidden ${selectedInterest === "Affiliate/Referral" ? "bg-white border-brand-blue shadow-[0_8px_30px_rgba(29,95,209,0.12)]" : "bg-white/60 border-brand-navy/[0.04] hover:border-brand-blue/30 hover:bg-white/80"}`}
              >
                <div className="flex justify-center items-start mb-4">
                  <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-[11px] font-semibold rounded-full">
                    Up to {PARTNER_CONFIG.COMMISSION_PERCENT}% commission
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-brand-navy mb-2">Affiliate & Referral</h3>
                <p className="text-[13px] text-slate-700 leading-relaxed mb-4">
                  Not just a standard referral link. We actively help you close high-ticket deals, provide co-branded materials, and pay commissions on recurring contracts.
                </p>
                <ul className="space-y-2 mb-6 flex-1">
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Earn on both sales & recurring retainers</li>
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Assisted sales (We pitch to your leads)</li>
                  <li className="flex items-center gap-2 text-[13px] text-slate-600"><CheckCircle size={14} className="text-brand-blue" /> Co-branded assets & tracking till the last date of partnership</li>
                </ul>
                <div className={`text-[13px] font-medium flex items-center gap-1.5 transition-all w-fit mt-auto ${selectedInterest === "Affiliate/Referral" ? "bg-brand-blue text-white px-4 py-2 rounded-full shadow-md shadow-brand-blue/20" : "text-brand-blue group-hover:gap-2"}`}>
                  {selectedInterest === "Affiliate/Referral" ? (
                    <><CheckCircle size={14} /> Selected</>
                  ) : (
                    <>Choose this model <ArrowRight size={14} /></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-teal" aria-hidden="true" />
              Why Partner With Us?
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-brand-navy">Priority Engineering Support</h4>
                  <p className="text-[14px] text-slate-700 mt-1">Direct access to our senior engineering team, bypassing standard support queues for rapid project delivery and issue resolution.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-brand-navy">Exclusive Wholesale Pricing</h4>
                  <p className="text-[14px] text-slate-700 mt-1">Save up to {PARTNER_CONFIG.DISCOUNT_PERCENT}% on custom development and Extended Licenses, allowing you to maximize your profit margins while staying competitive.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Handshake className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-brand-navy">Seamless Handover & Maintenance</h4>
                  <p className="text-[14px] text-slate-700 mt-1">We handle all the complex infrastructure, deployment, and security setups. We also offer white-labeled maintenance contracts for your clients.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-brand-navy">Beyond Standard Licenses</h4>
                  <p className="text-[14px] text-slate-700 mt-1">An Extended License just gives you the code. A Partnership gives you a dedicated team. You get an assigned project manager, strict NDA-backed rebranding, and custom integrations tailored exactly to your client's needs.</p>
                </div>
              </div>
            </div>
          </div>
          



        </div>

        {/* Sticky Sidebar CTA (Right) */}
        <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
          <div ref={formRef} className="bg-white/60 backdrop-blur-xl border border-brand-navy/[0.08] shadow-sm rounded-[24px] p-6 lg:sticky lg:top-24 scroll-mt-24">
            <h3 className="text-[18px] font-display font-medium text-brand-navy mb-2">
              Ready to collaborate?
            </h3>
            <p className="text-[13px] text-slate-700 mb-5">
              Fill out your details and our partnership manager will get back to you within 24 hours to discuss synergies.
            </p>
            
            <div className="mb-6 flex items-center justify-between px-4 py-3 bg-brand-blue/5 border border-brand-blue/20 rounded-[12px]">
              <span className="text-[13px] text-slate-600 font-medium">Applying for:</span>
              <span className="text-[13px] font-semibold text-brand-blue flex items-center gap-1.5">
                <CheckCircle size={14} className="text-brand-blue" />
                {selectedInterest}
              </span>
            </div>
            
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 border border-green-200 rounded-[16px] p-6 text-center my-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-[15px] font-semibold text-brand-navy mb-2">Application Received!</h4>
                <p className="text-[13px] text-slate-700 mb-4">Thanks! Our partnership manager will contact you within 24 hours.</p>
                <button onClick={() => {
                  if (orderId) {
                    window.location.href = '/orders/' + orderId + '?chat=true';
                  }
                }} className="w-full max-w-sm mx-auto h-12 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 mb-3">
                  <MessageCircle size={18} /> Live Chat
                </button>
                <button onClick={() => { setSubmitted(false); setOrderId(null); }} className="text-[13px] text-slate-500 hover:text-brand-navy hover:underline mt-2 focus:outline-none">Submit another application</button>
              </motion.div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label htmlFor="companyName" className="block text-[13px] font-medium text-brand-navy mb-1.5">Agency / Company Name *</label>
                  <input 
                    ref={firstInputRef}
                    id="companyName"
                    name="companyName"
                    type="text" 
                    autoComplete="organization"
                    className={`w-full h-11 px-4 rounded-[12px] bg-white border ${formErrors.companyName ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors`} 
                    placeholder="e.g. Nexus Digital" 
                  />
                  {formErrors.companyName && <p className="text-red-500 text-[11px] mt-1">{formErrors.companyName}</p>}
                </div>
                <div>
                  <label htmlFor="name" className="block text-[13px] font-medium text-brand-navy mb-1.5">Your Name *</label>
                  <input 
                    id="name"
                    name="name"
                    type="text" 
                    autoComplete="name"
                    className={`w-full h-11 px-4 rounded-[12px] bg-white border ${formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors`} 
                    placeholder="John Doe" 
                  />
                  {formErrors.name && <p className="text-red-500 text-[11px] mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-[13px] font-medium text-brand-navy mb-1.5">Business Email *</label>
                  <input 
                    id="email"
                    name="email"
                    type="email" 
                    autoComplete="email"
                    className={`w-full h-11 px-4 rounded-[12px] bg-white border ${formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors`} 
                    placeholder="john@nexus.com" 
                  />
                  {formErrors.email && <p className="text-red-500 text-[11px] mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label htmlFor="interest" className="block text-[13px] font-medium text-brand-navy mb-1.5">Partnership Interest</label>
                  <select 
                    id="interest"
                    name="interest"
                    value={selectedInterest}
                    onChange={(e) => setSelectedInterest(e.target.value)}
                    className="w-full h-11 px-4 rounded-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[13px] text-slate-800 transition-colors cursor-pointer"
                  >
                    <option value="White-Label Development">White-Label Development</option>
                    <option value="Affiliate/Referral">Affiliate/Referral</option>
                    <option value="Strategic Integration">Strategic Integration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-[13px] font-medium text-brand-navy mb-1.5">Message (Optional)</label>
                  <textarea 
                    id="message"
                    name="message"
                    rows={3} 
                    className="w-full p-4 rounded-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors resize-none" 
                    placeholder="Tell us about your agency and goals..." 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 mt-4 bg-brand-navy hover:bg-brand-blue text-white rounded-[12px] font-medium text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>Submit Application <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                  )}
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2 opacity-80">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span className="text-[12px] text-slate-600">No spam. We reply within 24 hours.</span>
                </div>
              </form>
            )}
            <p className="text-center text-[13px] text-slate-600 mt-6 leading-relaxed">
              By submitting, you agree to our <br/>
              <Link href="/terms" className="font-medium text-brand-navy underline hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded px-1">Terms & Conditions</Link>.
            </p>
          </div>
        </div>

        {/* How It Works Section (Full Width) */}
        <div className="lg:col-span-12 order-3 mt-4 lg:mt-8">
          <div ref={howItWorksRef} className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8 scroll-mt-24">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-8 text-center md:text-left">
              How It Works
            </h2>
            <div className="relative flex flex-col md:flex-row gap-6 md:gap-0 justify-between">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-[24px] left-[10%] right-[10%] h-[2px] bg-brand-blue/10"></div>
              
              <div className="flex flex-col items-center md:w-1/3 relative z-10 text-center">
                <div className="w-12 h-12 bg-white border-2 border-brand-blue text-brand-blue font-bold text-lg rounded-full flex items-center justify-center shadow-sm mb-4">1</div>
                <h4 className="font-semibold text-brand-navy text-[15px] mb-2">Apply</h4>
                <p className="text-[13px] text-slate-600 px-4">Fill out the short application form with your agency details.</p>
              </div>
              
              <div className="flex flex-col items-center md:w-1/3 relative z-10 text-center">
                <div className="w-12 h-12 bg-white border-2 border-brand-blue text-brand-blue font-bold text-lg rounded-full flex items-center justify-center shadow-sm mb-4">2</div>
                <h4 className="font-semibold text-brand-navy text-[15px] mb-2">Onboarding Call</h4>
                <p className="text-[13px] text-slate-600 px-4">We discuss goals, pricing, and workflow within 24 hours.</p>
              </div>
              
              <div className="flex flex-col items-center md:w-1/3 relative z-10 text-center">
                <div className="w-12 h-12 bg-brand-blue text-white font-bold text-lg rounded-full flex items-center justify-center shadow-md shadow-brand-blue/30 mb-4">3</div>
                <h4 className="font-semibold text-brand-navy text-[15px] mb-2">Start Earning</h4>
                <p className="text-[13px] text-slate-600 px-4">Launch your first white-label project or share your referral link.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section (Full Width) */}
        <div className="lg:col-span-12 order-4 mt-4 lg:mt-4">
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-brand-navy/10 rounded-[12px] bg-white/50 overflow-hidden">
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      className="w-full px-5 py-4 text-left flex justify-between items-center focus:outline-none focus:bg-white/80"
                    >
                      <span className="font-medium text-brand-navy text-[14px] pr-4">{item.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          id={`faq-answer-${idx}`}
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 text-[13px] text-slate-600">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}






