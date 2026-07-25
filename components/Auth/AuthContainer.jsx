import React from 'react';
import { motion } from 'framer-motion';

const AuthContainer = ({ children, title, subtitle, footer }) => {
  return (
    <div className="min-h-screen bg-apple-canvas dark:bg-apple-canvas flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[450px] z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          {/* Logo Placeholder - Minimalist */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-8 relative">
            <img src="/logo.png" alt="Codalina" className="h-12 w-12 object-contain" />
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-semibold text-apple-ink tracking-tight mb-2 leading-[1.08]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[17px] text-apple-secondary font-normal leading-[1.47]">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-apple-parchment dark:bg-apple-parchment rounded-apple-lg p-8 sm:p-10 border border-apple-hairline"
        >
          {children}
        </motion.div>

        {footer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-[14px] text-apple-secondary"
          >
            {footer}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthContainer;
