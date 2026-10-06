import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';

export const metadata = {
  title: 'CodalinaHQ | Admin Command Center',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#080808] text-white font-sans selection:bg-brand-cyan/30">
      <div className="sticky top-0 h-screen shrink-0 z-50">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-40 bg-[#080808]">
          <Topbar />
        </div>
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
