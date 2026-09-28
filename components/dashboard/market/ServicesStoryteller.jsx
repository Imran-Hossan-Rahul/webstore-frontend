"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Network, Server, ShoppingCart, Rocket, MonitorPlay, Check, ArrowRight } from 'lucide-react';
import { useLenis } from 'lenis/react';
import Link from 'next/link';

export default function ServicesStoryteller() {
  const containerRef = useRef(null);
  
  // Track scroll inside the h-[400vh] container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [phase, setPhase] = useState(0); 
  const [visibleCount, setVisibleCount] = useState(0);
  const lenis = useLenis();
  
  const isAnimatingRef = useRef(false);
  const stickyRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Block ALL scrolling (including native scroll) during animation cooldown
      // Placed before getBoundingClientRect to prevent layout thrashing
      if (isAnimatingRef.current) {
         e.preventDefault();
         return;
      }

      const rect = container.getBoundingClientRect();
      const isPinned = rect.top <= 0 && rect.bottom >= window.innerHeight;
      
      if (!isPinned) return; // Let native scroll happen if not pinned
      
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;
      
      const isAtTop = rect.top >= -10;
      
      const canAdvanceForward = visibleCount < 5 || phase === 0;
      const canAdvanceBackward = (phase === 1 && isAtTop) || (phase === 0 && visibleCount > 0);

      if ((isScrollingDown && canAdvanceForward) || (isScrollingUp && canAdvanceBackward)) {
         e.preventDefault(); // Freeze native page scroll!
         if (Math.abs(e.deltaY) < 15) return; // Ignore tiny accidental trackpad movements

         isAnimatingRef.current = true;
         let cooldown = 250;

         if (isScrollingDown) {
           if (visibleCount < 5) setVisibleCount(v => v + 1);
           else if (phase === 0) {
              const targetY = container.getBoundingClientRect().top + window.scrollY;
              if (lenis) {
                 lenis.scrollTo(targetY, { immediate: true });
              } else {
                 window.scrollTo(0, targetY);
              }
              setPhase(1);
              cooldown = 800; // Hard lock to absorb hyper-scroll momentum!
           }
         } else {
           if (phase === 1) {
              const targetY = container.getBoundingClientRect().top + window.scrollY;
              if (lenis) {
                 lenis.scrollTo(targetY, { immediate: true });
              } else {
                 window.scrollTo(0, targetY);
              }
              setPhase(0);
              cooldown = 800;
           }
           else if (visibleCount > 0) setVisibleCount(v => v - 1);
         }
         
         // Cooldown before next action can be triggered or native scroll resumes
         setTimeout(() => { isAnimatingRef.current = false; }, cooldown);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isAnimatingRef.current) {
         e.preventDefault();
         return;
      }

      const rect = container.getBoundingClientRect();
      const isPinned = rect.top <= 0 && rect.bottom >= window.innerHeight;
      
      if (!isPinned) return;

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      
      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      
      const isAtTop = rect.top >= -10;
      
      const canAdvanceForward = visibleCount < 5 || phase === 0;
      const canAdvanceBackward = (phase === 1 && isAtTop) || (phase === 0 && visibleCount > 0);

      if ((isScrollingDown && canAdvanceForward) || (isScrollingUp && canAdvanceBackward)) {
         e.preventDefault();
         if (Math.abs(deltaY) < 20) return;

         isAnimatingRef.current = true;
         let cooldown = 250;
         
         if (isScrollingDown) {
           if (visibleCount < 5) setVisibleCount(v => v + 1);
           else if (phase === 0) {
              const targetY = container.getBoundingClientRect().top + window.scrollY;
              if (lenis) {
                 lenis.scrollTo(targetY, { immediate: true });
              } else {
                 window.scrollTo(0, targetY);
              }
              setPhase(1);
              cooldown = 800; // Hard lock to absorb swipe momentum!
           }
         } else {
           if (phase === 1) {
              const targetY = container.getBoundingClientRect().top + window.scrollY;
              if (lenis) {
                 lenis.scrollTo(targetY, { immediate: true });
              } else {
                 window.scrollTo(0, targetY);
              }
              setPhase(0);
              cooldown = 800;
           }
           else if (visibleCount > 0) setVisibleCount(v => v - 1);
         }
         setTimeout(() => { isAnimatingRef.current = false; }, cooldown);
      }
    };

    // Must be passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [visibleCount, phase, lenis]);

  const isStacked = phase === 0;

  const getCardAnim = (index) => {
    if (!isStacked) return { rotate: 0, y: 0, opacity: 1, scale: 1 };
    
    const activeIndex = visibleCount - 1;
    const distance = activeIndex - index;
    
    if (distance === 0) {
       return { rotate: 0, y: 0, opacity: 1, scale: 1 };
    } else if (distance > 0) {
       return { 
          rotate: 0, 
          y: -(distance * 60), 
          opacity: 1, 
          scale: 1 - (distance * 0.05),
          filter: `brightness(${1 - (distance * 0.15)})`
       };
    } else {
       return { rotate: 0, y: 800, opacity: 0, scale: 0.9 };
    }
  };

  const services = [
    {
      title: "Custom Web Platforms",
      icon: <Network className="w-7 h-7 text-brand-cyan" strokeWidth={1.5} />,
      desc: "Strategic corporate websites and platforms built to last. Secure, accessible, and high-performing.",
      bullets: ["Scalable Architecture & Design", "Advanced SEO Optimization", "Multi-language & Localization", "CMS & Headless Integrations"],
      tags: ["React", "Next.js", "Tailwind"],
      metric: { value: "Adapt", label: "Built to" },
      price: "Starts at 2,00,000 BDT",
      glow: "from-brand-cyan/20 to-transparent",
      flex: "1.2"
    },
    {
      title: "SaaS & Web Applications",
      icon: <Server className="w-7 h-7 text-brand-teal" strokeWidth={1.5} />,
      desc: "Transform complex ideas into reliable software. Engineered for security and operational excellence.",
      bullets: ["Custom Admin Dashboards", "Secure REST & GraphQL APIs", "Resilient Backend Infrastructure", "Real-time Data Processing"],
      tags: ["Node.js", "Docker", "PostgreSQL"],
      metric: { value: "Scale", label: "Long-term" },
      price: "Starts at 8,00,000 BDT",
      glow: "from-brand-teal/20 to-transparent",
      flex: "1"
    },
    {
      title: "Enterprise E-Commerce",
      icon: <ShoppingCart className="w-7 h-7 text-brand-blue" strokeWidth={1.5} />,
      desc: "Custom storefronts and payment integrations designed for resilience and continuous growth.",
      bullets: ["Global Payment Gateways", "Automated Inventory Sync", "Security-conscious Checkout", "Omnichannel Ready Setup"],
      tags: ["Stripe", "NextJS", "Redis"],
      metric: { value: "Secure", label: "By Design" },
      price: "Starts at 5,00,000 BDT",
      glow: "from-brand-blue/20 to-transparent",
      flex: "1"
    },
    {
      title: "Internal Tools & APIs",
      icon: <Rocket className="w-7 h-7 text-purple-400" strokeWidth={1.5} />,
      desc: "Streamline operations with bespoke tools. Engineered to integrate seamlessly with your business workflows.",
      bullets: ["Workflow Automation", "Complex Data Pipelines", "Role-based Access Control", "Third-party Integrations"],
      tags: ["Python", "AWS", "GraphQL"],
      metric: { value: "Reliable", label: "Infrastructure" },
      price: "Starts at 3,00,000 BDT",
      glow: "from-purple-500/20 to-transparent",
      flex: "1"
    },
    {
      title: "Proactive Maintenance",
      icon: <MonitorPlay className="w-7 h-7 text-pink-400" strokeWidth={1.5} />,
      desc: "We don't just launch and leave. Ongoing monitoring, patching, and strategic improvements.",
      bullets: ["24/7 Uptime Monitoring", "Critical Security Patching", "Quarterly Performance Audits", "Priority Bug Resolutions"],
      tags: ["DevOps", "CI/CD", "Support"],
      metric: { value: "Care", label: "Proactive" },
      price: "Monthly Retainer",
      glow: "from-pink-500/20 to-transparent",
      flex: "1.2"
    }
  ];

  const CardItem = ({ service, isStacked, index }) => (
    <div className="group relative cursor-pointer w-full h-full transform-gpu will-change-transform">
      <div className={`absolute inset-0 bg-gradient-to-br ${service.glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[16px] transform-gpu will-change-transform`}></div>
      <div className="relative h-full w-full bg-[#080808] backdrop-blur-3xl ring-1 ring-white/10 group-hover:ring-white/30 ring-inset rounded-[16px] px-6 pb-6 pt-5 md:px-8 md:pb-8 md:pt-6 flex flex-col transition-all duration-500 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.8)] transform-gpu will-change-transform" style={{ WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(0)' }}>
        
        {/* Removed Metric Badge as requested */}

        <h3 className="text-[16px] min-[350px]:text-[19px] md:text-[26px] font-display font-medium text-white mb-3 leading-tight relative z-10 transition-all w-full whitespace-nowrap">
          {service.title}
        </h3>
        <p className="text-[14px] md:text-[16px] text-white/60 leading-relaxed mb-6 relative z-10 w-[95%]">
          {service.desc}
        </p>
        
        <ul className="flex flex-col gap-3 mb-auto relative z-10">
          {service.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-[14px] md:text-[15px] text-white/70 font-sans">
              <Check className="w-4 h-4 text-brand-cyan shrink-0 mt-1" />
              <span className="leading-tight">{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-5 border-t border-white/10 flex flex-col gap-4 relative z-10">
          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-2 mb-1">
            {service.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded-[4px] bg-white/5 border border-white/10 text-[10px] text-white/50 font-mono uppercase tracking-wider group-hover:border-white/20 transition-colors">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[14px] md:text-[16px] font-medium text-white/80">{service.price}</span>
            <button className="text-[13px] md:text-[14px] font-medium text-brand-cyan group-hover:text-white flex items-center gap-1.5 transition-colors">
              Explore <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`w-full relative z-40 bg-black ${isStacked ? 'h-[800vh]' : 'h-auto'}`}>
      <div ref={stickyRef} className={`w-full flex flex-col items-center px-[13px] ${isStacked ? 'sticky top-0 h-screen overflow-hidden justify-center' : 'relative h-auto overflow-visible justify-start pt-[26vh] md:pt-[28vh] pb-[2vh]'}`}>
        
        {/* 'Our Services' Heading - Fixed at top of the section */}
        <motion.div 
          className="absolute top-[8vh] md:top-[10vh] w-full flex flex-col items-center text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h3 className="text-[36px] md:text-[48px] font-display font-medium text-white text-center leading-tight tracking-tight">
            Our Services
          </h3>
          <motion.div
            initial={false}
            animate={{ 
              opacity: isStacked ? 0 : 1, 
              height: isStacked ? 0 : 'auto',
              marginTop: isStacked ? 0 : 16
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <h4 className="text-[20px] min-[350px]:text-[24px] min-[400px]:text-[28px] md:text-[36px] lg:text-[42px] font-display font-medium text-white leading-tight tracking-tight whitespace-nowrap">
              Which one do you need?
            </h4>
          </motion.div>
        </motion.div>

        {/* Dynamic Grid / Stack */}
        <div className={`relative z-20 w-full flex flex-col gap-3 justify-center items-center ${isStacked ? 'mt-[18vh] md:mt-[25vh]' : ''}`}>
          
          {/* Row 1 */}
          <div className={`w-full transition-all duration-700 ${isStacked ? 'absolute inset-0 flex items-center justify-center' : 'flex flex-col md:flex-row gap-3'}`}>
            <motion.div 
              layout 
              className={isStacked ? 'absolute w-[95%] max-w-[900px] transform-gpu will-change-transform' : 'w-full transform-gpu will-change-transform'} 
              style={{ flex: isStacked ? 'none' : services[0].flex, zIndex: 1 }}
              animate={getCardAnim(0)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
               <CardItem service={services[0]} isStacked={isStacked} index={0} />
            </motion.div>
            <motion.div 
              layout 
              className={isStacked ? 'absolute w-[95%] max-w-[900px] transform-gpu will-change-transform' : 'w-full transform-gpu will-change-transform'} 
              style={{ flex: isStacked ? 'none' : services[1].flex, zIndex: 2 }}
              animate={getCardAnim(1)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
               <CardItem service={services[1]} isStacked={isStacked} index={1} />
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className={`w-full transition-all duration-700 ${isStacked ? 'absolute inset-0 flex items-center justify-center pointer-events-none' : 'flex flex-col md:flex-row gap-3 pointer-events-auto'}`}>
            <motion.div 
              layout 
              className={isStacked ? 'absolute w-[95%] max-w-[900px] transform-gpu will-change-transform' : 'w-full transform-gpu will-change-transform'} 
              style={{ flex: isStacked ? 'none' : services[2].flex, zIndex: 3 }}
              animate={getCardAnim(2)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
               <CardItem service={services[2]} isStacked={isStacked} index={2} />
            </motion.div>
            <motion.div 
              layout 
              className={isStacked ? 'absolute w-[95%] max-w-[900px] transform-gpu will-change-transform' : 'w-full transform-gpu will-change-transform'} 
              style={{ flex: isStacked ? 'none' : services[3].flex, zIndex: 4 }}
              animate={getCardAnim(3)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
               <CardItem service={services[3]} isStacked={isStacked} index={3} />
            </motion.div>
            <motion.div 
              layout 
              className={isStacked ? 'absolute w-[95%] max-w-[900px] transform-gpu will-change-transform' : 'w-full transform-gpu will-change-transform'} 
              style={{ flex: isStacked ? 'none' : services[4].flex, zIndex: 5 }}
              animate={getCardAnim(4)}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
               <CardItem service={services[4]} isStacked={isStacked} index={4} />
            </motion.div>
          </div>

        </div>

        {/* "Not sure yet?" transition heading */}
        <motion.div
          initial={false}
          animate={{ 
            opacity: isStacked ? 0 : 1, 
            y: isStacked ? 20 : 0,
            height: isStacked ? 0 : 'auto',
            marginTop: isStacked ? 0 : 48
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full flex justify-center overflow-hidden"
        >
          <h2 className="text-[40px] md:text-[64px] font-display font-medium text-white/40 text-center tracking-tight pb-2">
            Not sure yet?
          </h2>
        </motion.div>

      </div>
    </div>
  );
}
