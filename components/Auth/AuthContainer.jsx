import React from 'react';
import { motion } from 'framer-motion';

const AuthContainer = ({ children, title, subtitle, footer }) => {
  return (
    <div className="min-h-screen bg-brand-cloud dark:bg-[#0D1117] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
      {/* Subtle Technical Grid Background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-5 pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          {/* Codalina Logo Mark */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-9 h-9 border border-brand-navy/15 dark:border-white/20 rounded-[4px] bg-brand-navy/5 dark:bg-white/5 relative">
              <div className="w-1.5 h-1.5 bg-brand-cyan absolute top-1 right-1 rounded-full shadow-[0_0_8px_#22C7E8]"></div>
              <span className="font-display font-semibold text-[16px] text-brand-navy dark:text-white">C</span>
            </div>
            <span className="font-display font-semibold text-[18px] text-brand-navy dark:text-white tracking-tight">Codalina</span>
          </div>
          <h1 className="text-[28px] font-display font-medium text-brand-navy dark:text-white tracking-tight mb-2 leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-[#161B22] rounded-[4px] p-8 sm:p-10 border border-slate-200 dark:border-white/10 shadow-sm"
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-[13px] font-sans text-slate-500 dark:text-slate-400"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
