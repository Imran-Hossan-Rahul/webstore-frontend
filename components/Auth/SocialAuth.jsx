import React from 'react';
import { Github } from "lucide-react";

const SocialAuth = ({ onGoogle, onGithub }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-10">
      <button
        type="button"
        onClick={onGoogle}
        className="flex items-center justify-center gap-3 py-3 px-4 bg-apple-canvas dark:bg-apple-surface-dark border border-apple-hairline rounded-apple-sm text-[14px] font-medium text-apple-ink hover:bg-apple-parchment dark:hover:bg-zinc-800 transition-all duration-300 active:scale-95"
      >
        <img src="/google-svgrepo-com.svg" alt="Google" className="w-[18px] h-[18px]" />
        <span>Google</span>
      </button>
      <button
        type="button"
        onClick={onGithub}
        className="flex items-center justify-center gap-3 py-3 px-4 bg-apple-ink border border-apple-ink rounded-apple-sm text-[14px] font-medium text-white dark:text-apple-canvas hover:opacity-80 transition-all duration-300 active:scale-95"
      >
        <Github className="w-[18px] h-[18px]" />
        <span>GitHub</span>
      </button>
    </div>
  );
};

export default SocialAuth;
