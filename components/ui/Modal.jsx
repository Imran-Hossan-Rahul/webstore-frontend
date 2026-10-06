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
      <div className={`relative bg-brand-surface  w-full ${maxWidth} mx-4 border border-brand-navy/[0.10]  rounded-[4px] shadow-sm flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-navy/[0.10]  bg-brand-surface ">
          <h2 className="text-[18px] font-display font-medium text-brand-navy ">{title}</h2>
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

