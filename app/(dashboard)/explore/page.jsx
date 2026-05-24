import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: 'Community - Offline',
  description: 'The community features are temporarily offline for a major system upgrade.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function Explore() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
        <ShieldAlert size={40} className="text-slate-400" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
        Community Offline
      </h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium leading-relaxed">
        We are currently upgrading our community architecture to bring you a more elite, powerful networking experience. Please check back later.
      </p>
      <Link href="/" className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-all shadow-xl">
        Return to Dashboard
      </Link>
    </div>
  );
}
