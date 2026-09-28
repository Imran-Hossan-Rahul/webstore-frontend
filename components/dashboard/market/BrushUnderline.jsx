"use client";
import { motion } from 'framer-motion';

// Custom Animated Brush Underline (Engineered to match the specific swoosh aesthetic)
const BrushUnderline = ({ colorClass, delay }) => {
  return (
    <span className="absolute left-0 -bottom-1.5 md:-bottom-2 w-full h-[10px] md:h-[12px] pointer-events-none flex items-center justify-center overflow-hidden">
      <motion.svg
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className={`w-full h-full ${colorClass}`}
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main thick brush body */}
        <path d="M 2 9 L 6 3 Q 50 1 96 4 L 100 8 Q 50 6 2 9 Z" fill="currentColor" />
        {/* Left bristle detail */}
        <path d="M 0 10 L 4 5 Q 15 4 25 4 Q 15 6 0 10 Z" fill="currentColor" opacity="0.8" />
        {/* Right bristle detail */}
        <path d="M 75 5 Q 85 5 98 7 L 94 10 Q 85 7 75 5 Z" fill="currentColor" opacity="0.8" />
      </motion.svg>
    </span>
  );
};

export default BrushUnderline;
