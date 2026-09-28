"use client";
import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";

export const CinematicTypography = () => {
  const { scrollYProgress } = useScroll();
  
  // As user scrolls down, text scales up and fades/blurs out for a 3D parallax feel
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const filter = useTransform(scrollYProgress, [0, 0.15], ["blur(0px)", "blur(20px)"]);
  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 z-10 w-full flex flex-col items-center pointer-events-none"
      style={{ top: '38vh', perspective: '1200px' }}
    >
      <motion.div 
        style={{ scale, opacity, filter, willChange: 'transform, opacity, filter' }}
        className="transform-gpu flex flex-col items-center w-full relative"
      >
        <motion.h1 
          className="text-[15vw] md:text-[200px] font-display font-bold tracking-tighter leading-none select-none relative z-10"
          style={{
            transform: 'rotateX(15deg) translateZ(0)',
            transformOrigin: 'bottom center',
            backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.8) 47%, rgba(255,255,255,1) 50%, rgba(34,211,238,1) 53%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0.15) 100%)",
            backgroundSize: "400% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}
          animate={{
            backgroundPosition: ["100% 0%", "0% 0%"]
          }}
          transition={{
            duration: 3.5,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1.5
          }}
        >
          Codalina
        </motion.h1>
        
        {/* 3D Floor Reflection */}
        <motion.h1 
          className="text-[15vw] md:text-[200px] font-display font-bold tracking-tighter leading-none select-none absolute"
          style={{
            top: '100%',
            transform: 'rotateX(-60deg) scaleY(-1) translateY(-10%) translateZ(0)',
            transformOrigin: 'top center',
            backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.15) 47%, rgba(255,255,255,0.3) 50%, rgba(34,211,238,0.3) 53%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.02) 100%)",
            backgroundSize: "400% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: 'blur(12px)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 40%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 40%)',
          }}
          animate={{
            backgroundPosition: ["100% 0%", "0% 0%"]
          }}
          transition={{
            duration: 3.5,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1.5
          }}
        >
          Codalina
        </motion.h1>
      </motion.div>
    </div>
  );
};

export const LaserTypography = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.15], [0, -80]);

  return (
    <div className="absolute top-[65vh] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center pointer-events-none">
      <motion.div 
        style={{ opacity, y, willChange: 'transform, opacity' }}
        className="transform-gpu flex justify-center w-full"
      >
        <style>{`
        .laser-text {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: draw 4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
        @keyframes draw {
          0% { stroke-dashoffset: 800; fill: transparent; filter: drop-shadow(0 0 0px rgba(34,199,232,0)); }
          80% { stroke-dashoffset: 0; fill: transparent; filter: drop-shadow(0 0 15px rgba(34,199,232,0.8)); }
          100% { stroke-dashoffset: 0; fill: rgba(34,199,232,0.1); filter: drop-shadow(0 0 25px rgba(34,199,232,1)); }
        }
      `}</style>
      
      <svg 
        viewBox="0 0 1000 250" 
        className="w-full max-w-[85vw] md:max-w-[1000px] overflow-visible"
      >
        <defs>
          <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C7E8" />
            <stop offset="50%" stopColor="#1D5FD1" />
            <stop offset="100%" stopColor="#22C7E8" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-[120px] md:text-[180px] font-display font-bold tracking-tighter laser-text"
          fill="transparent"
          stroke="url(#cyan-glow)"
          strokeWidth="3"
        >
          Codalina
        </text>
      </svg>
      </motion.div>
    </div>
  );
};
