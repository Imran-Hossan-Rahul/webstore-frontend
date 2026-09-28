"use client";

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import AppleSpinner from '@/components/ui/AppleSpinner';

export default function GlobalTransitionLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handlePageLoaded = () => {
      setIsNavigating(false);
    };
    window.addEventListener('nextPageReady', handlePageLoaded);

    const handlePathChange = () => {
      setTimeout(() => {
        if (!window.isFetchingData) {
          setIsNavigating(false);
        }
      }, 100);
    };
    
    handlePathChange();

    return () => {
      window.removeEventListener('nextPageReady', handlePageLoaded);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClick = async (e) => {
      const anchor = e.target.closest('a');
      
      if (!anchor) return;
      if (anchor.target === '_blank') return;
      
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      
      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      if (!isInternal) return;

      if (anchor.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const url = new URL(anchor.href, window.location.origin);
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
      }

      // Allow default Next.js navigation but trigger our loader instantly
      setIsNavigating(true);
    };

    const handlePopState = () => {
        setIsNavigating(false);
    };
    
    const handleStartNavigation = async () => {
        setIsNavigating(true);
    };

    document.addEventListener('click', handleClick, { capture: true });
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('startNavigation', handleStartNavigation);

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('startNavigation', handleStartNavigation);
    };
  }, [router]);

  if (!isNavigating) return null;

  return (
    <div id="global-loader" className="fixed inset-0 z-[40] bg-brand-surface/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 pointer-events-none">
      <AppleSpinner size={48} />
    </div>
  );
}
