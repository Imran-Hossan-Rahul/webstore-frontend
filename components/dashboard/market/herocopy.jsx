"use client";
import { motion } from "framer-motion";

// floorCoords: { y, x, textWidth } — passed from MarketClientView via the floor-position event
const HeroBackground = ({
  floorCoords = { y: 0, x: null, textWidth: 500 },
}) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black overflow-hidden">
      {/* Background Effects - Ultra Premium Glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-blue/20 blur-[120px] rounded-full"></div>
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-brand-cyan/10 blur-[100px] rounded-full"></div>

      {/* Deep Tech Subtle Radial Glow Behind Particles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3.5, ease: "easeOut", delay: 3.5 }}
        className="absolute top-[45vh] -translate-y-1/2 w-[600px] h-[500px] bg-brand-blue/15 blur-[120px] rounded-full z-0 pointer-events-none"
        style={{
          left: floorCoords.x ? `${floorCoords.x}px` : "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* 3D Ground Plane Grid (Cyberspace Floor) */}
      <div
        className="absolute left-0 right-0 bottom-0 overflow-hidden z-0 pointer-events-none"
        style={{
          top: floorCoords.y ? `${floorCoords.y}px` : "58vh",
          perspective: "800px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          initial={{ rotateX: -20, z: 1200, y: -200, scale: 1.5, opacity: 0 }}
          animate={{ rotateX: 75, z: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.05, 1, 0.1, 1], delay: 0.1 }}
          className="absolute left-[-50%] right-[-50%] top-0 h-[200vh]"
          style={{
            transformOrigin: floorCoords.x
              ? `${floorCoords.x + (typeof window !== "undefined" ? window.innerWidth : 1920) * 0.5}px top`
              : "top center",
            backgroundSize: "80px 80px",
            backgroundImage: `linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)`,
            maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Sharp Horizon Line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, scaleX: 1, filter: "blur(1px)" }}
        transition={{ duration: 0.6, ease: "circOut", delay: 0.8 }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-cyan/80 to-transparent z-0 pointer-events-none origin-center"
        style={{ top: floorCoords.y ? `${floorCoords.y}px` : "58vh" }}
      />

      {/* Letter-Specific Synchronized Reflection Glows */}
      <div
        className="absolute h-[100px] z-0 pointer-events-none origin-bottom"
        style={{
          width: floorCoords.textWidth ? `${floorCoords.textWidth}px` : "500px",
          top: floorCoords.y ? `${floorCoords.y - 10}px` : "57vh",
          left: floorCoords.x ? `${floorCoords.x}px` : "50%",
          transform: "translateX(-50%) perspective(800px) rotateX(75deg)",
        }}
      >
        {/* Phase 1: 'a', 'i', 'a' (1.5s) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "46%", width: "12%" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "66%", width: "6%" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "86%", width: "14%" }}
        />

        {/* Phase 2: 'o', 'n' (2.5s) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 2.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "17%", width: "14%" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 2.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "72%", width: "14%" }}
        />

        {/* Phase 3: 'C', 'd', 'l' (3.5s) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }}
          className="absolute top-0 h-full bg-brand-cyan/30 blur-[30px] rounded-full"
          style={{ left: "0%", width: "17%" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "31%", width: "14%" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 3.5 }}
          className="absolute top-0 h-full bg-brand-cyan/25 blur-[30px] rounded-full"
          style={{ left: "59%", width: "7%" }}
        />
      </div>
    </div>
  );
};

export default HeroBackground;
