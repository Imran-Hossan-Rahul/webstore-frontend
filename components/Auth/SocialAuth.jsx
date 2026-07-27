import React from 'react';

const SocialAuth = ({ onGoogle }) => {
  return (
    <div className="mb-10">
      <button
        type="button"
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-[12px] text-[15px] font-medium text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-300 active:scale-95 shadow-sm"
      >
        <img src="/google-svgrepo-com.svg" alt="Google" className="w-5 h-5" />
        <span>Continue with Google</span>
      </button>
    </div>
  );
};

export default SocialAuth;
