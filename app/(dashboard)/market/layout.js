import React from 'react';
import MarketNavbar from '@/components/dashboard/market/MarketNavbar';

export default function MarketLayout({ children }) {
  return (
    <>
      <MarketNavbar />
      {children}
    </>
  );
}