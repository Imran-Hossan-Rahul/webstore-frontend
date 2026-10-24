"use client";
import React, { useRef, useState } from 'react';
import { Shield, ShoppingCart, Rocket, MonitorPlay } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import BrushUnderline from './BrushUnderline';

const ProcessSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rawRotate = useTransform(scrollYProgress, [0, 0.8, 1], [0, -360, -360]);
  const carouselRotate = useSpring(rawRotate, { 
    stiffness: 40, 
    damping: 20, 
    mass: 0.8,
    restDelta: 0.001
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(carouselRotate, "change", (latest) => {
    let normalized = Math.abs(latest) % 360;
    if (normalized > 315 || normalized <= 45) setActiveIndex(0);
    else if (normalized > 45 && normalized <= 135) setActiveIndex(1);
    else if (normalized > 135 && normalized <= 225) setActiveIndex(2);
    else if (normalized > 225 && normalized <= 315) setActiveIndex(3);
  });

  const stepData = [
    {
      id: "01",
      title: "Buy / Order & Customize",
      subtitle: "Tailoring to your brand",
      descriptionParts: [
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          After you place an order, our team begins <span className="relative inline">customizing the platform<BrushUnderline colorClass="text-white/60" delay={0} /></span> to align perfectly with your brand vision.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          Development typically takes <span className="relative inline">up to 1–2 months<BrushUnderline colorClass="text-white/40" delay={0.1} /></span> for large-scale projects.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          We maintain <span className="relative inline">100% pricing transparency<BrushUnderline colorClass="text-white/60" delay={0.2} /></span> upfront. Zero hidden charges, ever.
        </p>
      ],
      chips: ["Custom Branding", "Feature Adaptation", "Full UI Retouch"],
      icon: <ShoppingCart size={28} className="text-white" />
    },
    {
      id: "02",
      title: "Deploy & Live Launch",
      subtitle: "Production deployment",
      descriptionParts: [
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          Once customized and thoroughly tested, it&apos;s time to go live. You have <span className="relative inline">full flexibility<BrushUnderline colorClass="text-white/60" delay={0} /></span> in how deployment happens.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          You can <span className="relative inline">deploy it yourself<BrushUnderline colorClass="text-white/40" delay={0.1} /></span> on your own server. We&apos;ll provide complete handover documentation and guide you through the entire process.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          Or, our engineering team can handle <span className="relative inline">full production deployment for you<BrushUnderline colorClass="text-white/60" delay={0.2} /></span>. This covers DNS setup, SSL, server configuration, and go-live verification. <span className="text-white font-medium">No extra charge.</span>
        </p>
      ],
      chips: ["Cloud Architecture", "DNS & SSL Setup", "Performance Tuning"],
      icon: <Rocket size={28} className="text-white" />
    },
    {
      id: "03",
      title: "1 Month Free Care",
      subtitle: "Handover & stabilization",
      descriptionParts: [
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          From the <span className="relative inline">exact day of deployment<BrushUnderline colorClass="text-white/60" delay={0} /></span>, we maintain your website or web app for exactly 30 days. Completely free.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          During this period, we act as your dedicated development team. We fix bugs, push updates, resolve any issues, and ensure <span className="relative inline">zero data or security vulnerabilities<BrushUnderline colorClass="text-white/40" delay={0.1} /></span>.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          This is <span className="relative inline">our offer to you<BrushUnderline colorClass="text-white/60" delay={0.2} /></span>. No obligation. If you&apos;d prefer to manage independently after launch, you&apos;re free to skip this. But if you want peace of mind, we&apos;re here.
        </p>
      ],
      chips: ["30-Day Free Support", "Bug Fixes & Uploads", "Smooth Handover"],
      icon: <Shield size={28} className="text-white" />
    },
    {
      id: "04",
      title: "Ongoing Maintenance",
      subtitle: "3, 6, or 12 Month Contracts",
      descriptionParts: [
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          After the free period, you can choose to <span className="relative inline">collaborate with us long-term<BrushUnderline colorClass="text-white/60" delay={0} /></span>. We offer 3, 6, or 12-month contracts based on what fits you best.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          Our developers will be <span className="relative inline">dedicated to your platform<BrushUnderline colorClass="text-white/40" delay={0.1} /></span>. They fix bugs, ship updates, and resolve new issues. You won&apos;t need to hire a separate developer.
        </p>,
        <p key={Math.random()} className="text-white/95 font-sans text-[13px] min-[350px]:text-[14px] md:text-[15px] leading-[1.6] font-normal">
          Pricing is <span className="relative inline">flexible and project-based<BrushUnderline colorClass="text-white/60" delay={0.2} /></span>. What you pay depends on the scale and complexity of your project. No fixed overpriced packages.
        </p>
      ],
      chips: ["Daily Monitoring", "Regular Upgrades", "Priority SLA"],
      icon: <MonitorPlay size={28} className="text-white" />
    }
  ];

  return (
    <div ref={containerRef} className="h-[500vh] w-full relative bg-[#0E1115] border-t border-white/10 dark:border-white/5">
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden py-12 px-6">
      
      {/* Background Atmosphere - Premium Glow Style */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
        {/* Premium Cyan/Blue Radial Glow for Glass Refraction */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D0D7DF]/15 blur-[120px] rounded-full mix-blend-screen pointer-events-none opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E1E7EE]/15 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        {/* {<TechParticles scatterOnly={true} />} */}
        
        {/* 3D Ground Plane Grid (Cyberspace Floor) */}
        <div 
          className="absolute left-0 right-0 bottom-0 overflow-hidden z-0 pointer-events-none" 
          style={{ top: '58vh', perspective: '800px', transformStyle: 'preserve-3d' }}
        >
          <div 
            className="absolute left-[-50%] right-[-50%] top-0 h-[200vh]" 
            style={{ 
              transform: 'rotateX(75deg)',
              transformOrigin: 'top center',
              backgroundSize: '80px 80px',
              backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)`,
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)'
            }}>
          </div>
        </div>
      </div>

      {/* Floating Section Title */}
      <div className="absolute top-[8%] md:top-[10%] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none w-full px-6 text-center">
        <h2 className="text-[22px] min-[330px]:text-[26px] min-[400px]:text-[36px] md:text-[48px] font-display font-medium text-white text-center leading-tight tracking-tight whitespace-nowrap">
          How We Collaborate
        </h2>
      </div>

      {/* 3D Carousel Stage */}
      <div 
        className="relative z-20 w-full mx-auto flex items-center justify-center h-[540px] sm:h-[480px] md:h-[500px] mt-6 md:mt-10" 
        style={{ perspective: "1200px", "--tz": "clamp(200px, 35vw, 300px)" }}
      >
        <div style={{ transform: "translateZ(calc(-1 * var(--tz)))", transformStyle: "preserve-3d" }} className="w-full h-full flex justify-center items-center pointer-events-none">
          <motion.div
            style={{ 
              rotateY: carouselRotate, 
              transformStyle: "preserve-3d", 
              willChange: "transform"
            }}
            className="relative w-[260px] sm:w-[320px] md:w-[360px] h-[530px] sm:h-[460px] md:h-[480px] cursor-grab active:cursor-grabbing transform-gpu pointer-events-auto"
          >
          {stepData.map((step, index) => {
            const rotateY = index * 90; // 0, 90, 180, 270
            return (
                <div
                  key={step.id}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    transform: `rotateY(${rotateY}deg) translateZ(var(--tz))`,
                    transformStyle: "preserve-3d"
                  }}
                >
                {/* Front Face */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-[32px] p-6 sm:p-8 md:p-10 flex flex-col transform-gpu"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    WebkitFontSmoothing: "antialiased", 
                    transform: "translateZ(0)",
                    willChange: "transform",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)",
                    backdropFilter: "blur(32px) saturate(180%)",
                    WebkitBackdropFilter: "blur(32px) saturate(180%)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.18)"
                  }}
                >
                  {/* Card Content Stack */}
                  <div className="flex flex-col">
                    <span className="text-white/50 font-sans text-[12px] uppercase tracking-[0.15em] font-semibold mb-3">
                      Step {step.id}
                    </span>
                    <h3 className="text-white font-sans text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] leading-tight mb-4 drop-shadow-md">
                      {step.title}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {step.descriptionParts.map((part, i) => (
                        <React.Fragment key={i}>{part}</React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Back Face */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-[32px] flex items-center justify-center"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    transform: "rotateY(180deg) translateZ(0)", 
                    WebkitFontSmoothing: "antialiased",
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%)",
                    backdropFilter: "blur(32px) saturate(180%)",
                    WebkitBackdropFilter: "blur(32px) saturate(180%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 0 1px rgba(255,255,255,0.18)"
                  }}
                >
                  <span className="text-white/10 font-sans font-semibold text-8xl tracking-tighter select-none">{step.id}</span>
                </div>

                {/* Genie Pop-out Chips */}
                <div 
                  className="absolute inset-0 w-full h-full pointer-events-none hidden min-[810px]:block" 
                  style={{ transform: "translateZ(-2px)", backfaceVisibility: "hidden" }}
                >
                  <AnimatePresence>
                    {activeIndex === index && step.chips.map((chip, i) => {
                      // Different layouts for each card index so they don&apos;t look repetitive
                      const layouts = [
                        [ // Card 1
                          { left: "calc(-15% - 60px)", top: "15%", rotate: -12 }, 
                          { left: "calc(115% + 60px)", top: "50%", rotate: 10 },  
                          { left: "calc(-10% - 40px)", top: "85%", rotate: 5 },   
                        ],
                        [ // Card 2
                          { left: "calc(115% + 50px)", top: "20%", rotate: 8 },  
                          { left: "calc(-15% - 70px)", top: "45%", rotate: -10 }, 
                          { left: "calc(110% + 40px)", top: "75%", rotate: -4 },  
                        ],
                        [ // Card 3
                          { left: "calc(-20% - 40px)", top: "25%", rotate: -8 }, 
                          { left: "calc(120% + 50px)", top: "35%", rotate: 12 },  
                          { left: "calc(-15% - 50px)", top: "70%", rotate: 6 },   
                        ],
                        [ // Card 4
                          { left: "calc(110% + 60px)", top: "15%", rotate: 14 }, 
                          { left: "calc(-10% - 60px)", top: "60%", rotate: -8 },  
                          { left: "calc(115% + 30px)", top: "85%", rotate: -5 },  
                        ]
                      ];
                      
                      const positions = layouts[index % layouts.length];
                      const pos = positions[i] || positions[0];

                      return (
                        <motion.div
                          key={`chip-${i}`}
                          initial={{ opacity: 0, scale: 0.01, x: "-50%", y: 120, rotate: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            x: "-50%",
                            y: "-50%", 
                            rotate: pos.rotate 
                          }}
                          exit={{ opacity: 0, scale: 0.01, x: "-50%", y: 120, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 240,
                            damping: 18,
                            delay: 0.2 + i * 0.12
                          }}
                          className="absolute px-4 py-2.5 bg-[#171B21]/95 border border-[rgba(255,255,255,0.18)] backdrop-blur-xl rounded-xl shadow-[0_10px_30px_rgba(17,20,24,0.20)] whitespace-nowrap transform-gpu"
                          style={{ 
                            left: pos.left, 
                            top: pos.top,
                            backfaceVisibility: "hidden",
                            WebkitFontSmoothing: "antialiased",
                            transformStyle: "preserve-3d",
                            willChange: "transform"
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-xl pointer-events-none"></div>
                          <div className="relative z-10 flex items-center gap-2 transform-gpu" style={{ transform: "translateZ(1px)" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] shadow-[0_0_8px_rgba(14,124,134,0.8)]"></span>
                            <span className="text-white font-mono text-[12px] md:text-[13px] font-medium tracking-wide uppercase drop-shadow-sm antialiased">{chip}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </motion.div>
        </div>
      </div>

      {/* Interactive Scroll Helper Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-500 text-[11px] font-mono uppercase tracking-widest pt-1 z-30">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] animate-ping"></span>
        <span>Scroll to Rotate</span>
      </div>

      </div>
    </div>
  );
};

export default ProcessSection;
