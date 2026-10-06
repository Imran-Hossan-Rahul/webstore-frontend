import React from 'react';

export const PageContainer = ({ children, className = '', maxWidth = 'max-w-[1400px]', ...props }) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

