import React from 'react';
import { motion } from 'framer-motion';

const AuthContainer = ({ children, title, subtitle, footer }) => {
  return (
    <div className="min-h-screen bg-[#FAFBFF] dark:bg-[#030303] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 font-sans">
      <div className="w-full max-w-[450px] z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          {/* Logo Placeholder - Minimalist & Elite */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.25rem] bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-zinc-800 mb-8 relative group overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <img src="/logo.png" alt="Codalina" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/80 dark:border-zinc-800/50"
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10"
          >
            {footer}
          </motion.div>
        )}
      </div>

      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Fine grid pattern */}
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.2]" 
             style={{ backgroundImage: `radial-gradient(#6366f1 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />
      </div>
    </div>
  );
};

export default AuthContainer;
