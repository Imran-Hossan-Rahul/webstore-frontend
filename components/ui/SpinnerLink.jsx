"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import AppleSpinner from '@/components/ui/AppleSpinner';

export default function SpinnerLink({ 
  href, 
  children, 
  className = '', 
  spinnerColor = 'text-[#0071e3]',
  spinnerSize = 16,
  ...props 
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  return (
    <Link 
      href={href} 
      onClick={() => setIsNavigating(true)} 
      style={{ pointerEvents: isNavigating ? 'none' : 'auto' }}
      className={`relative inline-flex items-center justify-center ${className}`}
      {...props}
    >
      <span className={`inline-flex items-center justify-center ${isNavigating ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isNavigating && (
        <span className="absolute inset-0 flex items-center justify-center">
          <AppleSpinner size={spinnerSize} className={spinnerColor} />
        </span>
      )}
    </Link>
  );
}
