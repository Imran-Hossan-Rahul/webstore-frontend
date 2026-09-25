import { useEffect } from "react";

export default function Form() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-cloud dark:bg-[#0a0a0a] p-5">
      <div className="login-container w-full max-w-[420px]">
        <div className="login-card bg-white dark:bg-[#111] rounded-2xl p-10 shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300">
          <div className="login-header text-center mb-10">
            <div className="neu-icon w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-xl bg-brand-cloud dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <div className="icon-inner w-8 h-8 flex items-center justify-center text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-full h-full"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please sign in to continue</p>
          </div>

          <form id="loginForm" className="login-form" noValidate>
            {/* Email Input */}
            <div className="form-group mb-6 relative">
              <div className="neu-input relative bg-brand-cloud dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 transition-all focus-within:border-brand-blue/50">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder=" "
                  className="w-full bg-transparent border-none p-4 pl-12 text-slate-900 dark:text-white text-base font-medium outline-none"
                />
                <label
                  htmlFor="email"
                  className="absolute left-12 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none transition-all"
                >
                  Email address
                </label>
                <div className="input-icon absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
              <span
                className="error-message text-red-500 text-xs mt-2 ml-5 opacity-0 transition-all"
                id="emailError"
              ></span>
            </div>

            {/* Password Input */}
            {/* Similar structure as email input, including toggle button */}
            {/* Social login, buttons, and success message also follow the same pattern */}
          </form>
        </div>
      </div>
    </div>
  );
}
