import React from 'react';

const SocialAuth = ({ onGoogle }) => {
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-brand-cloud dark:bg-transparent border border-brand-navy/[0.08] dark:border-white/20 rounded-[4px] text-[14px] font-sans font-medium text-brand-navy dark:text-white hover:bg-slate-100 dark:bg-brand-surface/[0.05] dark:hover:bg-brand-surface/5 transition-all duration-300 active:scale-[0.98]"
      >
        <img src="/google-svgrepo-com.svg" alt="Google" className="w-4 h-4 opacity-80" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default SocialAuth;
