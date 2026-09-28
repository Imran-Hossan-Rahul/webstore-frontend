import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export const Drawer = ({ isOpen, onClose, title, children, position = 'right', width = 'w-96' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'right-0 border-l',
    left: 'left-0 border-r',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className={`absolute top-0 bottom-0 bg-brand-surface dark:bg-brand-dark ${width} ${positionClasses[position]} border-brand-navy/[0.10] dark:border-white/10 shadow-sm flex flex-col transform transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/[0.10] dark:border-white/10">
          <h2 className="text-[18px] font-display font-medium text-brand-navy dark:text-white">{title}</h2>
          <IconButton icon={<X size={18} />} variant="ghost" size="sm" onClick={onClose} />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
