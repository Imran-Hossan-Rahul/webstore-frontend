import React from 'react';
import { Github } from 'lucide-react';

const SocialAuth = ({ onGoogle, onGithub }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-10">
      <button
        type="button"
        onClick={onGoogle}
        className="group relative flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-600 transition-all duration-300 active:scale-[0.98] shadow-sm overflow-hidden"
      >
        <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img src="/google-svgrepo-com.svg" alt="Google" className="w-5 h-5 relative z-10" />
        <span className="relative z-10">Google</span>
      </button>
      <button
        type="button"
        onClick={onGithub}
        className="group relative flex items-center justify-center gap-3 py-4 px-4 bg-slate-950 dark:bg-white border border-slate-950 dark:border-white rounded-2xl font-bold text-white dark:text-slate-950 hover:bg-black dark:hover:bg-slate-100 transition-all duration-300 active:scale-[0.98] shadow-sm overflow-hidden"
      >
        <Github className="w-5 h-5 relative z-10" />
        <span className="relative z-10">GitHub</span>
      </button>
    </div>
  );
};

export default SocialAuth;
