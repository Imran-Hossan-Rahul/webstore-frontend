import React from 'react';
import { Button } from './Button';

export const CTASection = ({ 
  title, 
  description, 
  primaryAction, 
  secondaryAction, 
  className = '' 
}) => (
  <div className={`w-full bg-brand-navy dark:bg-[#161B22] border-y border-brand-navy dark:border-white/10 py-24 ${className}`}>
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-[32px] md:text-[40px] font-display font-medium text-white mb-6 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] md:text-[18px] font-sans text-slate-300 mb-10 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {primaryAction && (
          <Button size="lg" className="w-full sm:w-auto" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/5" 
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  </div>
);
