"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, UserCheck, ShieldCheck, Clock, CheckCircle, ArrowRight, Star, Linkedin, Mail, MessageCircle, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { api } from "@/utils/api";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useUser } from "@/context/UserContext";
import OrdersList from "@/components/orders/OrdersList";
import { AlertTriangle } from "lucide-react";


// === CONFIGURATION ===
const CONFIG = {
  SHOW_SOCIAL_PROOF: false, // Set to true when you have clients and projects
  BOOKING_URL: "", // TODO: Add Cal.com or Calendly URL here (e.g., "https://cal.com/username/30min"). If empty, shows custom form.
  FOUNDER_NAME: "Imran Hossan", // TODO: Update name
  FOUNDER_ROLE: "Founder & Lead Engineer",
  FOUNDER_BIO_1: "Full-stack engineer specializing in Next.js & Node.", // TODO: Update bio
  FOUNDER_BIO_2: "Helping startups build scalable, beautiful web apps.", // TODO: Update bio
  FOUNDER_IMAGE: "/images/placeholder-founder.jpg", // TODO: Add actual image to public folder
  FOUNDER_LINK: "https://linkedin.com/in/imran", // TODO: Update URL
  WHATSAPP_NUMBER: "+8801700000000", // TODO: Update number
  CONTACT_EMAIL: "hello@codalina.com", // TODO: Update email
  RESPONSE_TIME_TEXT: "We'll confirm within 24 hours with a calendar link.",
  STATS: {
    projects: "50+", // TODO: Update stat
    experience: "5+", // TODO: Update stat
    rating: "4.9/5" // TODO: Update stat
  },
  TESTIMONIALS: [
    {
      text: "TODO: replace with real testimonial. The strategy call gave us a clear roadmap and saved us months of rework.",
      name: "Jane Smith",
      role: "CEO, TechFlow",
      initials: "JS"
    },
    {
      text: "TODO: replace with real testimonial. Highly technical and incredibly practical advice.",
      name: "Mark Johnson",
      role: "CTO, DataSync",
      initials: "MJ"
    }
  ],
  LOGOS: ["Acme Corp", "Globex", "Soylent", "Initech"], // TODO: Replace with real company names or images
  PORTFOLIO_URL: "/portfolio", // TODO: Update with your actual portfolio or work page URL
  FAQS: [
    { q: "Is the call really free?", a: "Yes, the 30-minute discovery call is completely free and comes with no obligations." },
    { q: "What if I don't have a budget yet?", a: "That's perfectly fine. We can discuss your idea and I can give you a rough estimate to help you plan." },
    { q: "Who will I be speaking with?", a: `You'll be speaking directly with the founder.` },
    { q: "How long until I hear back?", a: "We typically respond within 24 hours with a calendar link to book your slot." },
    { q: "Do I need to prepare anything?", a: "Just bring your ideas! Any reference links, rough budgets, or timelines are helpful but not required." }
  ]
};

const PROJECT_TYPES = ["Website", "SaaS / Web App", "E-commerce", "Mobile App", "Other"];
const BUDGET_RANGES = ["Not sure yet", "< $5k", "$5k - $10k", "$10k - $25k", "$25k+"];
const TIMELINES = ["Flexible", "Asap (< 1 month)", "1-3 months", "3-6 months"];

// Custom Select Component for Form
const CustomSelect = ({ id, name, options, placeholder, error, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <input type="hidden" name={name} id={id} value={value} />
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${error ? 'border-red-500' : (isOpen ? 'border-brand-navy' : 'border-slate-300')} flex items-center justify-between cursor-pointer transition-colors focus-within:border-brand-navy outline-none`}
        tabIndex={0}
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <span className={`text-[15px] ${value ? 'text-slate-800' : 'text-slate-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-[12px] shadow-lg py-1 max-h-[220px] overflow-y-auto overflow-x-hidden"
            style={{ overscrollBehavior: 'none' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {options.map((option) => (
              <div 
                key={option}
                onClick={() => { onChange(option); setIsOpen(false); }}
                className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-brand-blue/5 hover:text-brand-blue transition-colors ${value === option ? 'bg-brand-blue/10 text-brand-blue font-semibold' : 'text-slate-700'}`}
              >
                {option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function BookCallPage() {
  const { user } = useUser();
  const [submittedRef, setSubmittedRef] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  
  // Form state
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  
  const [openFaq, setOpenFaq] = useState(null);
  const formRef = useRef(null);
  const firstInputRef = useRef(null);

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { if (firstInputRef.current) firstInputRef.current.focus(); }, 500);
    }
  };

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get("/user/admin-profile");
        if (res.success && res.admin) {
          setAdminProfile(res.admin);
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };
    fetchAdmin();
  }, []);

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.get('name')) errors.name = "Name is required";
    const email = formData.get('email');
    if (!email) errors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Invalid email format";
    if (!formData.get('projectType')) errors.projectType = "Please select a project type";
    if (!formData.get('topic')) errors.topic = "Please let us know what you want to discuss";
    return errors;
  };

  // Dummy analytics tracker (Item D17)
  // TODO: Replace this with your actual analytics provider (e.g. PostHog, Mixpanel, Google Analytics)
  // Usage: window.posthog.capture(eventName, properties)
  const track = (eventName, properties = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${eventName}`, properties);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const formData = new FormData(e.target);
    const errors = validateForm(formData);
    
    // Check honeypot field (D15)
    if (formData.get('bot_field')) return;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      track("form_submit_error", { reason: "validation_failed", errors });
      return;
    }
    
    setFormErrors({});
    setIsSubmitting(true);
    track("form_start", { source: "book_call_page" });
    
    const email = formData.get('email');
    
    try {
      const payload = {
          name: formData.get('name'),
          email,
          phone: formData.get('phone') || formData.get('whatsapp'),
          contactMethod: formData.get('whatsapp') ? 'WhatsApp' : 'Email',
          projectType: 'Strategy Call - ' + formData.get('projectType'),
          budget: formData.get('budget'),
          timeline: formData.get('timeline'),
          projectDetails: formData.get('topic'),
          features: [],
          source: 'Strategy Call Booking'
      };

      const res = await api.post('/market/orders/custom-brief', payload);
      
      let generatedRefId = `CB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      if (res && res._id) {
         generatedRefId = `#${res._id.toString().slice(-8).toUpperCase()}`;
      }
      
      if (!user && res && res._id) {
         try {
           const existing = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
           if (!existing.includes(res._id)) {
             existing.push(res._id);
             localStorage.setItem('codalina_guest_orders', JSON.stringify(existing));
           }
         } catch(e) {}
      }

      track("form_submit_success", { projectType: formData.get('projectType') });
      setSubmittedEmail(email);
      setSubmittedRef(generatedRefId);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit request.");
      track("form_submit_error", { reason: "api_error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide distractions specifically on this page */
        .lucide-shopping-cart, .lucide-bell, .chat-widget { display: none !important; }
        /* Try to hide sidebar if standard classes apply */
        aside, #sidebar, .sidebar { display: none !important; }
        main { padding-left: 0 !important; margin-left: 0 !important; width: 100% !important; max-w: 100% !important; }
        .dashboard-content-wrapper { padding-left: 0 !important; }
      `}} />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": CONFIG.FAQS.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />

      <div className="min-h-screen font-sans relative overflow-hidden bg-transparent pb-24">
        {/* TOP SECTION: Hero & Form (Above the fold) */}
        <div className="pt-24 pb-12 px-4 md:px-6 relative z-10 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Col: Hero & Founder Card */}
            <div className="lg:col-span-6 flex flex-col gap-6 pt-4">
              {!submitted ? (
                <>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[12px] font-semibold tracking-wide uppercase mb-2">
                    <Calendar size={14} aria-hidden="true" /> Strategy Call
                  </motion.div>
                  
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[36px] md:text-[48px] lg:text-[56px] font-display font-medium text-brand-navy leading-[1.1] tracking-tight">
                    Talk directly to <br className="hidden md:block" />
                    the <span className="text-brand-blue">founder</span>
                  </motion.h1>
                  
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[16px] md:text-[18px] text-slate-700 leading-relaxed max-w-lg font-medium">
                    30 minutes. One technical roadmap. No pitch.
                    <br/><br/>
                    Share your idea, and walk away with a clear architecture, timeline, and next steps, whether or not we work together.
                  </motion.p>
                  
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="block lg:hidden mt-4">
                    <button onClick={() => { track("cta_click"); scrollToForm(); }} className="w-full h-14 bg-brand-navy text-white rounded-xl font-semibold text-[16px] hover:bg-brand-blue transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/30 shadow-md flex justify-center items-center gap-2">
                      Book Your Free Call <ArrowRight size={18} />
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200 text-green-700 text-[12px] font-semibold tracking-wide uppercase mb-2">
                    <CheckCircle size={14} aria-hidden="true" /> Request Sent
                  </motion.div>
                  
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[36px] md:text-[48px] lg:text-[56px] font-display font-medium text-brand-navy leading-[1.1] tracking-tight">
                    You're all set.
                  </motion.h1>
                  
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[16px] md:text-[18px] text-slate-700 leading-relaxed max-w-lg font-medium">
                    Here's how to get the most out of our 30 minutes.
                  </motion.p>
                </>
              )}

              {/* Founder Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 lg:mt-6 bg-white/60 backdrop-blur-md border border-brand-navy/10 rounded-[24px] p-6 shadow-sm flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0 overflow-hidden border border-slate-300">
                  <img src={adminProfile?.profilePicture ? getOptimizedUrl(adminProfile.profilePicture) : CONFIG.FOUNDER_IMAGE} alt={adminProfile?.fullName || CONFIG.FOUNDER_NAME} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                </div>
                <div>
                  <h3 className="text-[18px] font-display font-semibold text-brand-navy flex items-center gap-2">
                    {adminProfile?.fullName || CONFIG.FOUNDER_NAME}
                    <a href={CONFIG.FOUNDER_LINK} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:opacity-80 transition-opacity" aria-label="LinkedIn Profile">
                      <Linkedin size={18} />
                    </a>
                  </h3>
                  <p className="text-[14px] text-brand-blue font-medium mb-2">{CONFIG.FOUNDER_ROLE}</p>
                  <p className="text-[14px] text-slate-700 leading-snug">{CONFIG.FOUNDER_BIO_1}</p>
                  <p className="text-[14px] text-slate-700 leading-snug">{CONFIG.FOUNDER_BIO_2}</p>
                </div>
              </motion.div>
              
              {/* Expectations */}
              {!submitted ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-2 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5"><UserCheck size={14} className="text-brand-blue" /></div>
                    <span className="text-[15px] font-medium text-slate-700"><strong>No Sales Reps:</strong> Speak directly with the founder.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5"><Clock size={14} className="text-brand-blue" /></div>
                    <span className="text-[15px] font-medium text-slate-700"><strong>30-Min Deep Dive:</strong> Direct advice on architecture & scale.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5"><ShieldCheck size={14} className="text-brand-blue" /></div>
                    <span className="text-[15px] font-medium text-slate-700"><strong>Zero Obligation:</strong> Walk away with a roadmap, no pressure.</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-2 space-y-4">
                  <h4 className="text-[15px] font-semibold text-brand-navy mb-4">What to prepare for the call:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-[14px] font-medium text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Your core project idea</li>
                    <li className="flex items-start gap-2 text-[14px] font-medium text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Rough budget and timeline</li>
                    <li className="flex items-start gap-2 text-[14px] font-medium text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Any reference links or competitors</li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Right Col: Booking Form / Calendar */}
            <div className="lg:col-span-6" ref={formRef}>
              <div className="bg-white/70 backdrop-blur-xl border border-brand-navy/[0.08] shadow-lg rounded-[24px] p-6 sm:p-8 scroll-mt-24 w-full">
                
                {CONFIG.BOOKING_URL ? (
                  <div className="w-full min-h-[500px]">
                    {/* Fallback embedding for Calendly/Cal.com */}
                    <iframe src={CONFIG.BOOKING_URL} width="100%" height="600" frameBorder="0" title="Book a call"></iframe>
                  </div>
                ) : submitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 md:py-12 text-center flex flex-col justify-center h-full" aria-live="polite">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={32} />
                    </div>
                    <h3 tabIndex="-1" ref={(el) => { if(el && submitted) el.focus(); }} className="text-[24px] font-display font-semibold text-brand-navy mb-3 outline-none">Request Received!</h3>
                    <p className="text-[15px] text-slate-600 mb-2">We'll send your calendar link to <strong className="text-brand-navy">{submittedEmail}</strong>.</p>
                    <button onClick={() => setSubmitted(false)} className="text-[13px] text-brand-blue hover:underline mb-8 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded px-1">Wrong email? Go back and edit</button>
                    
                    <div className="text-left bg-white border border-slate-200 rounded-[16px] p-6 max-w-sm mx-auto shadow-sm mb-8">
                      <p className="text-[14px] font-semibold text-brand-navy mb-3">Here's what happens next:</p>
                      <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-[2px] before:bg-brand-blue/10">
                        <li className="flex items-start gap-3 relative z-10"><div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[12px] shrink-0">1</div><span className="text-[14px] text-slate-700 pt-0.5">We review your request.</span></li>
                        <li className="flex items-start gap-3 relative z-10"><div className="w-6 h-6 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center font-bold text-[12px] shrink-0">2</div><span className="text-[14px] text-slate-700 pt-0.5">You get a calendar link within 24h.</span></li>
                        <li className="flex items-start gap-3 relative z-10"><div className="w-6 h-6 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center font-bold text-[12px] shrink-0">3</div><span className="text-[14px] text-slate-700 pt-0.5">We talk for 30 minutes.</span></li>
                      </ul>
                    </div>

                    <div className="space-y-4 max-w-sm mx-auto">
                      <a href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\+/g, '')}?text=Hi%20Codalina,%20I%20just%20submitted%20a%20request%20for%20a%20strategy%20call.`} target="_blank" rel="noopener noreferrer" className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/50">
                        <MessageCircle size={18} /> Message on WhatsApp
                      </a>
                      <div className="flex flex-col gap-2 pt-2">
                        <Link href={CONFIG.PORTFOLIO_URL} className="text-[14px] font-semibold text-brand-blue hover:underline">See our work</Link>
                        <p className="text-[12px] text-slate-500 mt-2">Don't see our email? Check your spam or promotions folder.</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-[22px] font-display font-semibold text-brand-navy mb-2">Book Your Free Call</h3>
                    <p className="text-[14px] text-slate-600 mb-6 font-medium">Timezone auto-detected: <span className="text-brand-navy font-semibold">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></p>
                    
                    {submitError && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[14px] font-medium mb-6 flex items-start gap-2">
                        <CheckCircle size={18} className="shrink-0 mt-0.5 rotate-45" /> {submitError}
                      </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                      {/* Honeypot field for spam bots */}
                      <input type="text" name="bot_field" className="hidden" tabIndex="-1" autoComplete="off" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="name" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Name <span className="text-brand-blue">*</span></label>
                          <input ref={firstInputRef} id="name" name="name" type="text" className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.name ? 'border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 transition-colors`} placeholder="John Doe" />
                          {formErrors.name && <p className="text-red-500 text-[13px] font-medium mt-1.5">{formErrors.name}</p>}
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Email <span className="text-brand-blue">*</span></label>
                          <input id="email" name="email" type="email" className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.email ? 'border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 transition-colors`} placeholder="john@company.com" />
                          {formErrors.email && <p className="text-red-500 text-[13px] font-medium mt-1.5">{formErrors.email}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="phone" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Phone Number</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-[12px] border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-[14px] font-medium">+</span>
                            <input id="phone" name="phone" type="tel" className="w-full h-12 px-3 rounded-r-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 transition-colors" placeholder="123 456 7890" />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="whatsapp" className="block text-[14px] font-semibold text-brand-navy mb-1.5">WhatsApp Number</label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-[12px] border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-[14px] font-medium">+</span>
                            <input id="whatsapp" name="whatsapp" type="tel" className="w-full h-12 px-3 rounded-r-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 transition-colors" placeholder="123 456 7890" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="projectType" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Project Type <span className="text-brand-blue">*</span></label>
                          <CustomSelect id="projectType" name="projectType" options={PROJECT_TYPES} placeholder="Select type" value={projectType} onChange={setProjectType} error={formErrors.projectType} />
                          {formErrors.projectType && <p className="text-red-500 text-[13px] font-medium mt-1.5">{formErrors.projectType}</p>}
                        </div>
                        <div>
                          <label htmlFor="budget" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Budget Range</label>
                          <CustomSelect id="budget" name="budget" options={BUDGET_RANGES} placeholder="Select budget" value={budget} onChange={setBudget} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="timeline" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Timeline</label>
                          <CustomSelect id="timeline" name="timeline" options={TIMELINES} placeholder="Select timeline" value={timeline} onChange={setTimeline} />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="topic" className="block text-[14px] font-semibold text-brand-navy mb-1.5">What would you like to discuss? <span className="text-brand-blue">*</span></label>
                        <textarea id="topic" name="topic" rows="3" className={`w-full p-4 rounded-[12px] bg-white border ${formErrors.topic ? 'border-red-500' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder-slate-500 transition-colors resize-none overscroll-none`} onWheel={e => e.stopPropagation()} placeholder="Tell us a bit about your current challenges or goals..."></textarea>
                        {formErrors.topic && <p className="text-red-500 text-[13px] font-medium mt-1.5">{formErrors.topic}</p>}
                      </div>

                      
                      {!user && (
                        <div className="flex items-start gap-3 p-4 mb-4 rounded-[12px] bg-amber-50 border border-amber-200/50">
                          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[12.5px] leading-relaxed text-amber-700/80 font-medium">
                            <strong className="text-amber-800">You are not logged in.</strong> Please note that if you clear your browser data, you might lose access to track this request. Be sure to save the Reference ID provided after submission!
                          </p>
                        </div>
                      )}
                      <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full h-14 bg-brand-navy text-white rounded-xl font-semibold text-[16px] hover:bg-brand-blue transition-all focus:outline-none flex items-center justify-center gap-2 disabled:opacity-70 shadow-md">
                          {isSubmitting ? (
                            <span className="flex items-center gap-3"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</span>
                          ) : (
                            <>Book Your Free Call <ArrowRight size={18} /></>
                          )}
                        </button>
                        <p className="text-center text-[13px] text-slate-500 mt-4 font-medium flex items-center justify-center gap-1.5">
                          <ShieldCheck size={14} className="text-green-600" /> Your info is private. No spam. {CONFIG.RESPONSE_TIME_TEXT}
                        </p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Social Proof & FAQ */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 md:mt-24">
          
          {/* Stats & Logos */}
          
        {/* Tracking List */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-16 md:mt-24">
          <div className="mb-8">
            <h2 className="text-[24px] font-display font-medium text-brand-navy">Your Strategy Calls & Briefs</h2>
            {!user && <p className="text-[14px] text-slate-500 mt-1">Showing requests stored on this device.</p>}
          </div>
          <OrdersList isEmbedded={true} isCustomMode={true} />
        </div>

        {CONFIG.SHOW_SOCIAL_PROOF && (
            <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[24px] p-8 lg:p-10 mb-12">
              <div className="grid grid-cols-3 gap-6 text-center border-b border-brand-navy/10 pb-8 mb-8">
                <div><div className="text-[28px] md:text-[36px] font-display font-semibold text-brand-navy">{CONFIG.STATS.projects}</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Projects Delivered</div></div>
                <div><div className="text-[28px] md:text-[36px] font-display font-semibold text-brand-navy">{CONFIG.STATS.experience}</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Years Experience</div></div>
                <div><div className="text-[28px] md:text-[36px] font-display font-semibold text-brand-navy flex items-center justify-center gap-1"><Star className="w-6 h-6 text-yellow-500 fill-yellow-500" /> {CONFIG.STATS.rating}</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Client Rating</div></div>
              </div>
              <p className="text-[14px] font-bold tracking-wider text-slate-500 uppercase mb-6 text-center">Trusted by innovative teams</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale">
                {CONFIG.LOGOS.map((logo, i) => (
                  <div key={i} className="font-display font-bold text-xl text-slate-800">{logo}</div>
                ))}
              </div>
            </div>
          )}

          <div className={CONFIG.SHOW_SOCIAL_PROOF ? "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12" : "max-w-3xl mx-auto"}>
            {/* Testimonials */}
            {CONFIG.SHOW_SOCIAL_PROOF && (
              <div className="space-y-6">
              <h3 className="text-[22px] font-display font-semibold text-brand-navy mb-2">What founders say</h3>
              {CONFIG.TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white border border-brand-navy/10 p-6 rounded-2xl shadow-sm">
                  <div className="flex gap-1 mb-3 text-yellow-500">
                    {[1,2,3,4,5].map(star => <Star key={star} size={14} className="fill-current" />)}
                  </div>
                  <p className="text-[15px] text-slate-700 italic mb-5 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-[14px] shrink-0 border border-brand-blue/20">
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-brand-navy">{t.name}</h4>
                      <p className="text-[13px] text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* FAQ */}
            <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[24px] p-6 md:p-8 shadow-sm">
              <h3 className="text-[22px] font-display font-semibold text-brand-navy mb-6">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {CONFIG.FAQS.map((faq, i) => (
                  <div key={i} className="border border-brand-navy/10 rounded-xl overflow-hidden bg-white/60">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-[15px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue/30"
                      aria-expanded={openFaq === i}
                    >
                      {faq.q}
                      <ChevronDown className={`w-5 h-5 text-brand-blue transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-5 text-[14.5px] font-medium text-slate-700 leading-relaxed border-t border-brand-navy/5 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-brand-navy/10">
                <h4 className="text-[15px] font-semibold text-brand-navy mb-4">What to prepare for the call:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[14px] text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Your core project idea</li>
                  <li className="flex items-start gap-2 text-[14px] text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Any reference links or competitors</li>
                  <li className="flex items-start gap-2 text-[14px] text-slate-700"><Check size={16} className="text-brand-blue shrink-0 mt-0.5" /> Rough budget and timeline</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Alternative Contact */}
          <div className="mt-12 text-center text-slate-600 text-[14px] font-medium">
            Prefer to reach out directly? Email <a href={`mailto:${CONFIG.CONTACT_EMAIL}`} className="text-brand-blue hover:underline">{CONFIG.CONTACT_EMAIL}</a> or message us on <a href={`https://wa.me/${CONFIG.WHATSAPP_NUMBER.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">WhatsApp</a>.
          </div>
        </div>
      </div>
    </>
  );
}
