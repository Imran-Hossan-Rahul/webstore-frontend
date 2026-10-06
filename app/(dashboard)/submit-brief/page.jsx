"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Briefcase, Handshake, Code2, ShieldCheck, Zap, CheckCircle, ChevronDown, Upload, X, Clock, Calendar, Check, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@/context/UserContext";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PROJECT_TYPES = ["Website", "Web App", "SaaS Platform", "E-commerce", "Mobile App", "Redesign", "MVP", "Other"];
const TIMELINES = ["ASAP", "Within 1 month", "1–3 months", "3+ months", "Flexible"];
const BUDGETS = ["Under $1k", "$1k–$5k", "$5k–$15k", "$15k–$50k", "$50k+", "Not sure yet"];
const FEATURES = ["Login/Auth", "Payments", "Admin Panel", "Dashboard", "API Integration", "Multi-language", "Real-time/Chat", "AI features", "Other"];
const CONTACT_METHODS = ["Email", "Call", "WhatsApp"];
const HEAR_SOURCES = ["Google Search", "Social Media", "Referral", "Clutch / Directory", "Other"];

const FAQS = [
  { q: "What if I don't have a clear brief?", a: "No problem. Just share the core idea. We'll help you flesh out the details during our discovery call." },
  { q: "How much does a project cost?", a: "It varies widely based on features and complexity. Most of our custom MVPs range from $5k-$15k." },
  { q: "What is the typical timeline?", a: "A standard web app MVP takes about 4-8 weeks from kickoff to launch." },
  { q: "Who owns the code/IP?", a: "You do. Upon final payment, 100% of the Intellectual Property and source code is transferred to you." }
];

const CustomSelect = ({ id, name, options, defaultValue, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <input type="hidden" id={id} name={name} value={selected} />
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${error ? 'border-red-500' : (isOpen ? 'border-brand-navy' : 'border-slate-300')} flex items-center justify-between cursor-pointer transition-colors focus-within:border-brand-navy outline-none`}
        tabIndex={0}
        onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <span className={`text-[15px] ${selected ? 'text-slate-800' : 'text-slate-500'}`}>
          {selected || placeholder}
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
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-[14px] cursor-pointer hover:bg-brand-blue/5 hover:text-brand-blue transition-colors ${selected === option ? 'bg-brand-blue/10 text-brand-blue font-semibold' : 'text-slate-700'}`}
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

export default function SubmitBriefPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  
  const formRef = useRef(null);
  const firstInputRef = useRef(null);



  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (firstInputRef.current) firstInputRef.current.focus();
      }, 500);
    }
  };

  const toggleFeature = (feat) => {
    setSelectedFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      alert("Some files were skipped because they exceed 10MB limit.");
    }
    setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 3));
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.get('name')) errors.name = "Name is required";
    const email = formData.get('email');
    if (!email) errors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = "Invalid email format";
    
    const phone = formData.get('phone');
    if (phone && !/^\+?\d{8,15}$/.test(phone.replace(/[\s-]/g, ''))) errors.phone = "Invalid phone format";
    
    if (!formData.get('projectType')) errors.projectType = "Project type is required";
    if (!formData.get('projectDetails')) errors.projectDetails = "Please provide some project details";
    if (!formData.get('consent')) errors.consent = "You must agree to the Privacy Policy";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const formData = new FormData(e.target);
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = document.getElementById(`error-${firstErrorKey}`);
      if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setFormErrors({});
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with real API endpoint
      // const payload = Object.fromEntries(formData);
      // payload.features = selectedFeatures;
      // await api.post('/briefs', payload);
      
      await new Promise(res => setTimeout(res, 1500));
      
      const generatedRefId = `CB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setRefId(generatedRefId);
      setSubmitted(true);
      window.scrollTo({ top: formRef.current?.offsetTop - 100, behavior: 'smooth' });
    } catch (err) {
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-transparent pb-24">
      {/* Hero Section */}
      <div className="pt-32 lg:pt-40 pb-12 px-6 relative z-10 max-w-[1200px] mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[13px] font-semibold tracking-wide uppercase mb-6">
          <Briefcase size={16} aria-hidden="true" /> Custom Development Brief
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[32px] md:text-[48px] lg:text-[56px] font-display font-medium text-brand-navy mb-6 leading-[1.1] tracking-tight">
          Tell us about your <br className="hidden md:block" />
          <span className="text-brand-blue">Vision</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[16px] md:text-[18px] text-slate-700 max-w-2xl mx-auto leading-relaxed">
          Got a unique idea? Whether it's a custom web app or a scalable SaaS platform, we build it from scratch. Tell us your vision, and we'll handle the rest.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={scrollToForm} className="h-12 px-8 bg-brand-navy text-white rounded-full font-medium text-[15px] hover:bg-brand-blue hover:shadow-lg transition-all focus:ring-0 focus:outline-none focus:ring-4 focus:ring-brand-blue/30">
            Submit Brief
          </button>
        </motion.div>
      </div>

      {/* Social Proof Strip */}
      <div className="hidden max-w-[1200px] mx-auto px-4 md:px-6 mb-12">
        <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[24px] p-6 lg:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b border-brand-navy/10 pb-6 mb-6">
            <div><div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">50+</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Projects Delivered</div></div>
            <div><div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">5+</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Years Experience</div></div>
            <div><div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">99%</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Client Satisfaction</div></div>
            <div><div className="text-[24px] md:text-[32px] font-display font-semibold text-brand-navy">&lt; 24h</div><div className="text-[14px] text-slate-600 mt-1 font-medium">Response Time</div></div>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full">
              <p className="text-[13px] font-bold tracking-wider text-slate-500 uppercase mb-4 text-center lg:text-left">Trusted by companies like</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 opacity-60 grayscale">
                {/* Placeholders */}
                <div className="font-display font-bold text-xl text-slate-800">Acme Corp</div>
                <div className="font-display font-bold text-xl text-slate-800">Globex</div>
                <div className="font-display font-bold text-xl text-slate-800">Soylent</div>
                <div className="font-display font-bold text-xl text-slate-800">Initech</div>
              </div>
            </div>
            <div className="lg:w-[400px] bg-white/60 p-5 rounded-2xl border border-brand-navy/5 shadow-sm italic text-slate-700 text-[14px] font-medium leading-relaxed">
              "Codalina took our rough idea and turned it into a polished, scalable platform. The process was seamless."
              <div className="flex items-center gap-3 mt-4 not-italic">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">JD</div>
                <div>
                  <div className="font-semibold text-brand-navy text-[14px]">John Doe</div>
                  <div className="text-[13px] text-slate-500 font-medium">CEO, TechStartup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Main Content Area (Form is visually dominant on Desktop: 7 cols) */}
        {/* On Mobile, form should be first. order-1 for form, order-2 for cards. */}
        <div className="lg:col-span-7 flex flex-col order-1 lg:order-1">
          <div ref={formRef} className="bg-white/70 backdrop-blur-xl border border-brand-navy/[0.08] shadow-sm rounded-[24px] p-6 sm:p-8 scroll-mt-24">
            
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8" aria-live="polite">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-[24px] font-display font-semibold text-brand-navy mb-2">Brief Received!</h3>
                <p className="text-[15px] text-slate-600 mb-6 font-medium">Reference ID: <span className="font-bold text-brand-navy">{refId}</span></p>
                <div className="bg-white border border-slate-200 rounded-[16px] p-6 text-left max-w-sm mx-auto mb-8 shadow-sm">
                  <h4 className="font-semibold text-brand-navy mb-4">What happens next?</h4>
                  <ol className="space-y-4">
                    <li className="flex gap-3 text-[14px] text-slate-700 font-medium"><span className="font-bold text-brand-blue">1.</span> We will review your brief within 24 hours.</li>
                    <li className="flex gap-3 text-[14px] text-slate-700 font-medium"><span className="font-bold text-brand-blue">2.</span> You'll get an invite for a free discovery call.</li>
                    <li className="flex gap-3 text-[14px] text-slate-700 font-medium"><span className="font-bold text-brand-blue">3.</span> We'll provide a technical proposal and quote.</li>
                  </ol>
                </div>
                <button onClick={() => { setSubmitted(false); setRefId(''); }} className="text-[15px] font-medium text-brand-blue hover:underline focus:outline-none focus:ring-2 focus:ring-brand-blue rounded-md px-2 py-1">Submit another brief</button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-[24px] font-display font-semibold text-brand-navy mb-2">
                  Project Details
                </h3>
                <p className="text-[15px] text-slate-600 mb-8 font-medium">
                  Share a little bit about what you're looking to build. All information is strictly confidential.
                </p>
                
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  
                  {/* Personal Details - 2 Col */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Your Name <span className="text-brand-blue">*</span></label>
                      <input 
                        ref={firstInputRef}
                        id="name"
                        name="name"
                        type="text" 
                        autoComplete="name"
                        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.name ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors`} 
                        placeholder="John Doe" 
                        aria-invalid={!!formErrors.name}
                        aria-describedby={formErrors.name ? "error-name" : undefined}
                      />
                      {formErrors.name && <p id="error-name" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Email Address <span className="text-brand-blue">*</span></label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        autoComplete="email"
                        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.email ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors`} 
                        placeholder="john@example.com" 
                        aria-invalid={!!formErrors.email}
                      />
                      {formErrors.email && <p id="error-email" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Phone <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input 
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue="+880"
                        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.phone ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors`} 
                        placeholder="+880" 
                      />
                      {formErrors.phone && <p id="error-phone" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.phone}</p>}
                    </div>
                    <div>
                      <label htmlFor="whatsapp" className="block text-[14px] font-semibold text-brand-navy mb-1.5">WhatsApp <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input 
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        defaultValue="+880"
                        className={`w-full h-12 px-4 rounded-[12px] bg-white border ${formErrors.whatsapp ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors`} 
                        placeholder="+880" 
                      />
                      {formErrors.whatsapp && <p id="error-whatsapp" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.whatsapp}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="company" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Company Name <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <input 
                        id="company"
                        name="company"
                        type="text" 
                        className="w-full h-12 px-4 rounded-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors" 
                        placeholder="Nexus Digital" 
                      />
                    </div>
                    <div>
                      <label htmlFor="projectType" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Project Type <span className="text-brand-blue">*</span></label>
                      <CustomSelect 
                        id="projectType"
                        name="projectType"
                        options={PROJECT_TYPES}
                        defaultValue=""
                        placeholder="Select project type"
                        error={formErrors.projectType}
                      />
                      {formErrors.projectType && <p id="error-projectType" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.projectType}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="budget" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Estimated Budget</label>
                      <CustomSelect 
                        id="budget"
                        name="budget"
                        options={BUDGETS}
                        defaultValue="Not sure yet"
                      />
                    </div>
                    <div>
                      <label htmlFor="timeline" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Timeline</label>
                      <CustomSelect 
                        id="timeline"
                        name="timeline"
                        options={TIMELINES}
                        defaultValue="Flexible"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reference" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Existing website / links <span className="text-slate-600 font-normal">(Optional)</span></label>
                    <input 
                      id="reference"
                      name="reference"
                      type="url"
                      className="w-full h-12 px-4 rounded-[12px] bg-white border border-slate-300 focus:border-brand-navy focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors" 
                      placeholder="https://..." 
                    />
                  </div>

                  {/* Multi-select features */}
                  <div>
                    <label className="block text-[14px] font-semibold text-brand-navy mb-2">Key Features needed <span className="text-slate-600 font-normal">(Select all that apply)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {FEATURES.map(feat => (
                        <button
                          key={feat}
                          type="button"
                          onClick={() => toggleFeature(feat)}
                          className={`px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors border focus:outline-none focus:ring-0 ${selectedFeatures.includes(feat) ? 'bg-brand-navy border-brand-navy text-white shadow-sm' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'}`}
                        >
                          {feat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label htmlFor="projectDetails" className="block text-[14px] font-semibold text-brand-navy mb-1.5">Project Details <span className="text-brand-blue">*</span></label>
                    <textarea 
                      id="projectDetails"
                      name="projectDetails"
                      rows="5"
                      className={`w-full p-4 rounded-[12px] bg-white border ${formErrors.projectDetails ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-brand-navy'} focus:outline-none text-[15px] text-slate-800 placeholder:text-slate-500 transition-colors resize-none overscroll-none`}
                      onWheel={(e) => e.stopPropagation()}
                      placeholder="Tell us about the core features, your target audience, and main goals..."
                      aria-invalid={!!formErrors.projectDetails}
                      aria-describedby={formErrors.projectDetails ? "error-projectDetails" : undefined}
                    ></textarea>
                    {formErrors.projectDetails && <p id="error-projectDetails" className="text-red-600 text-[13px] font-medium mt-1.5" aria-live="polite">{formErrors.projectDetails}</p>}
                  </div>

                  {/* File Upload Placeholder */}
                  <div>
                    <label className="block text-[14px] font-semibold text-brand-navy mb-1.5">Upload References / Docs <span className="text-slate-600 font-normal">(Max 10MB per file)</span></label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-[12px] p-6 text-center hover:border-brand-blue hover:bg-brand-blue/5 transition-colors group cursor-pointer focus-within:border-brand-navy bg-white/50">
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload files"
                      />
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-brand-blue transition-colors" />
                      <p className="text-[14px] text-slate-700 font-medium">Click or drag files to upload</p>
                      <p className="text-[13px] text-slate-500 mt-1 font-medium">PDF, DOC, PNG, JPG (up to 3 files)</p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-[14px] shadow-sm">
                            <span className="text-slate-700 truncate font-medium max-w-[80%]">{f.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-500 font-medium">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                              <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" aria-label={`Remove file ${f.name}`}>
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Method & Source */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/80">
                    <div>
                      <label className="block text-[14px] font-semibold text-brand-navy mb-2.5">Preferred Contact Method</label>
                      <div className="flex gap-5">
                        {CONTACT_METHODS.map(method => (
                          <label key={method} className="flex items-center gap-2 text-[14px] text-slate-700 cursor-pointer font-medium hover:text-brand-navy">
                            <input type="radio" name="contactMethod" value={method} defaultChecked={method === "Email"} className="w-4 h-4 text-brand-blue focus:ring-brand-blue focus:ring-offset-1 border-slate-300" />
                            {method}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="source" className="block text-[14px] font-semibold text-brand-navy mb-1.5">How did you hear about us? <span className="text-slate-600 font-normal">(Optional)</span></label>
                      <CustomSelect 
                        id="source"
                        name="source"
                        options={HEAR_SOURCES}
                        defaultValue=""
                        placeholder="Select option"
                      />
                    </div>
                  </div>

                  {/* Consent */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="consent" 
                          id="consent" 
                          checked={isConsentChecked}
                          onChange={(e) => setIsConsentChecked(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-brand-blue focus:ring-0 focus:outline-none cursor-pointer accent-brand-blue" 
                        />
                      <span className="text-[14px] text-slate-700 font-medium leading-tight pt-0.5">
                        I agree to the <Link href="/privacy" className="text-brand-blue hover:underline underline-offset-2">Privacy Policy</Link> and <Link href="/terms" className="text-brand-blue hover:underline underline-offset-2">Terms</Link> <span className="text-brand-blue">*</span>
                      </span>
                    </label>
                    {formErrors.consent && <p id="error-consent" className="text-red-600 text-[13px] font-medium mt-1.5 ml-8" aria-live="polite">{formErrors.consent}</p>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 pb-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting || !isConsentChecked}
                      className="w-full h-14 bg-brand-navy text-white rounded-xl font-semibold text-[16px] hover:bg-brand-blue transition-all focus:ring-0 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Submitting Brief...
                        </span>
                      ) : (
                        <>Submit Brief <ArrowRight size={18} /></>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2 mt-5 text-[14px] font-medium text-slate-700">
                      <ShieldCheck size={18} className="text-green-600" />
                      <span>100% Secure & Confidential</span>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Info (Cards & FAQ) - Desktop: 5 cols. Mobile: order-2 */}
        <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-teal" aria-hidden="true" />
              What happens next?
            </h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-blue/30 before:via-brand-blue/10 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Process Steps */}
                <div className="flex items-start gap-5 z-10 w-full relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <span className="font-bold text-sm">1</span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-[16px] font-semibold text-brand-navy">Brief Review</h4>
                    <p className="text-[14px] text-slate-700 font-medium mt-1.5 leading-relaxed">Within 24 hours, our lead engineers analyze your requirements and technical feasibility.</p>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-start gap-5 z-10 w-full relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <span className="font-bold text-sm">2</span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-[16px] font-semibold text-brand-navy">Discovery Call</h4>
                    <p className="text-[14px] text-slate-700 font-medium mt-1.5 leading-relaxed">A 30-min deep dive to align on architecture, user experience, and business goals.</p>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-start gap-5 z-10 w-full relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <span className="font-bold text-sm">3</span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-[16px] font-semibold text-brand-navy">Proposal & Roadmap</h4>
                    <p className="text-[14px] text-slate-700 font-medium mt-1.5 leading-relaxed">You receive a detailed technical proposal, cost breakdown, and sprint timeline.</p>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-start gap-5 z-10 w-full relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-brand-blue text-brand-blue flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <span className="font-bold text-sm">4</span>
                  </div>
                  <div className="pt-2">
                    <h4 className="text-[16px] font-semibold text-brand-navy">Project Kickoff</h4>
                    <p className="text-[14px] text-slate-700 font-medium mt-1.5 leading-relaxed">We set up the repository, staging environments, and begin Sprint 1.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-brand-blue" aria-hidden="true" />
                Confidentiality
              </div>
              <a href="#" className="text-[14px] font-semibold text-brand-blue hover:underline whitespace-nowrap flex items-center gap-1.5">
                <LinkIcon size={14} /> View sample NDA
              </a>
            </h2>
            <p className="text-[15px] text-slate-700 font-medium leading-relaxed mb-5">
              Your ideas are safe. We sign an NDA for every custom project brief submitted. We never reuse proprietary logic or share concepts.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-[15px] font-semibold text-brand-navy"><CheckCircle size={18} className="text-brand-blue" /> Guaranteed NDA protection</li>
              <li className="flex items-center gap-3 text-[15px] font-semibold text-brand-navy"><CheckCircle size={18} className="text-brand-blue" /> You own 100% of the IP</li>
              <li className="flex items-center gap-3 text-[15px] font-semibold text-brand-navy"><CheckCircle size={18} className="text-brand-blue" /> Secure infrastructure</li>
            </ul>
          </div>

          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-[24px] p-6 md:p-8">
            <h2 className="text-[20px] font-display font-medium text-brand-navy mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-brand-navy/10 rounded-xl overflow-hidden bg-white/60">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-[15px] text-brand-navy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue/30"
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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
          </div>

        </div>
        
        {/* Alternative CTA - Full Width */}
        <div className="lg:col-span-12 order-3 mt-4 mb-12 text-center bg-white/50 backdrop-blur-sm border border-brand-navy/[0.08] rounded-[24px] p-8 md:p-12 shadow-sm">
          <h4 className="text-[20px] md:text-[24px] font-display font-semibold text-brand-navy mb-3">Prefer to talk it through?</h4>
          <p className="text-[16px] text-slate-700 font-medium mb-8">Schedule a free 30-minute discovery call with our founder.</p>
          <div className="flex justify-center">
            <Link href="/book-call" className="flex w-full max-w-md h-14 items-center justify-center gap-2 bg-white border border-slate-200 text-brand-navy font-semibold text-[16px] rounded-xl hover:border-brand-blue hover:text-brand-blue transition-colors shadow-sm focus:outline-none">
              Book a free call <Calendar size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
