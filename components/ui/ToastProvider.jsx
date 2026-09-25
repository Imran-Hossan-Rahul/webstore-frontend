"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle strokeWidth={1.5} className="w-[18px] h-[18px] text-brand-teal shrink-0" />,
  error: <AlertCircle strokeWidth={1.5} className="w-[18px] h-[18px] text-red-500 shrink-0" />,
  warning: <AlertTriangle strokeWidth={1.5} className="w-[18px] h-[18px] text-brand-amber shrink-0" />,
  info: <Info strokeWidth={1.5} className="w-[18px] h-[18px] text-brand-blue shrink-0" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message, type = "info", title = null, duration = 4000) => {
    let finalMessage = message;
    if (message instanceof Error) {
      finalMessage = message.message;
    } else if (typeof message === 'object' && message !== null) {
      finalMessage = message.message || message.error || JSON.stringify(message);
    } else if (typeof message !== 'string') {
      finalMessage = String(message);
    }

    const id = Date.now() + Math.random();
    setToasts((prev) => [
      ...prev,
      { id, message: finalMessage, type, title, duration },
    ]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastContainer = (
    <>
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[999999] flex flex-col items-center gap-3 w-max max-w-[90vw] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 dark:bg-[#1d1d1f]/90 backdrop-blur-2xl border border-apple-hairline shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto animate-slide-up"
            style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            {icons[toast.type]}
            <div className="flex items-center gap-2">
              {toast.title && (
                <span className="text-[14px] font-semibold text-apple-ink">
                  {toast.title}
                </span>
              )}
              {toast.title && <span className="text-apple-muted/50">•</span>}
              <span className="text-[14px] font-normal text-apple-ink">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-2 text-apple-muted hover:text-apple-ink transition-colors p-1"
            >
              <X strokeWidth={2} className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      {mounted && typeof document !== 'undefined' ? createPortal(toastContainer, document.body) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
