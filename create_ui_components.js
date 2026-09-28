const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const components = {
  'Button.jsx': `
import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  leftIcon, 
  rightIcon, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded-[4px] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-blue hover:bg-brand-blue/90 text-white border border-brand-blue",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-brand-navy dark:text-white border border-transparent",
    outline: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-brand-navy dark:text-white border border-slate-200 dark:border-white/10",
    ghost: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-brand-navy dark:text-white border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white border border-red-500"
  };
  
  const sizes = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-12 px-6 text-[15px]"
  };
  
  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});
Button.displayName = 'Button';
`,
  
  'IconButton.jsx': `
import React from 'react';
import { Loader2 } from 'lucide-react';

export const IconButton = React.forwardRef(({ 
  className = '', 
  variant = 'outline', 
  size = 'md', 
  isLoading = false, 
  icon, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[4px] transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-blue hover:bg-brand-blue/90 text-white border border-brand-blue",
    secondary: "bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-brand-navy dark:text-white border border-transparent",
    outline: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white border border-slate-200 dark:border-white/10",
    ghost: "bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-brand-navy dark:hover:text-white border border-transparent"
  };
  
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };
  
  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={\`\${baseStyles} \${variants[variant]} \${sizes[size]} \${className}\`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );
});
IconButton.displayName = 'IconButton';
`,
  
  'Input.jsx': `
import React from 'react';

export const Input = React.forwardRef(({ 
  className = '', 
  label, 
  error, 
  leftElement,
  rightElement,
  id,
  ...props 
}, ref) => {
  const generatedId = id || React.useId();
  
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-[11px] font-mono tracking-widest text-slate-500 uppercase mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {leftElement && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftElement}
          </div>
        )}
        <input 
          id={generatedId}
          ref={ref}
          className={\`w-full bg-white dark:bg-[#0D1117] border \${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-[4px] h-10 text-[14px] font-sans text-brand-navy dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors \${leftElement ? 'pl-10' : 'pl-3'} \${rightElement ? 'pr-10' : 'pr-3'} \${className}\`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="text-[12px] font-sans text-red-500 mt-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
`,

  'Card.jsx': `
import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
  <div className={\`bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] \${className}\`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={\`px-5 pt-5 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between \${className}\`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={\`text-[16px] font-display font-medium text-brand-navy dark:text-white \${className}\`} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={\`p-5 \${className}\`} {...props}>
    {children}
  </div>
);
`,

  'Badge.jsx': `
import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-mono tracking-widest uppercase border";
  
  const variants = {
    default: "bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10",
    primary: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    success: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span className={\`\${baseStyles} \${variants[variant]} \${className}\`} {...props}>
      {children}
    </span>
  );
};
`,

  'Modal.jsx': `
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Dialog */}
      <div className={\`relative bg-brand-cloud dark:bg-[#0D1117] w-full \${maxWidth} mx-4 border border-slate-200 dark:border-white/10 rounded-[4px] shadow-2xl flex flex-col max-h-[90vh]\`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#161B22]">
          <h2 className="text-[18px] font-display font-medium text-brand-navy dark:text-white">{title}</h2>
          <IconButton icon={<X size={18} />} variant="ghost" size="sm" onClick={onClose} />
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(uiDir, name), content.trim() + '\n', 'utf-8');
  console.log('Created:', name);
}
