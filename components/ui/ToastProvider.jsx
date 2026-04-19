"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const bgClasses = {
  success: "border-green-200 bg-green-50",
  error: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

const titleClasses = {
  success: "text-green-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", title = null, duration = 4000) => {
    const id = Date.now() + Math.random();
    const defaultTitles = {
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
    };
    setToasts((prev) => [
      ...prev,
      { id, message, type, title: title || defaultTitles[type], duration },
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

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgClasses[toast.type]} animate-slide-in`}
            style={{ animation: "slideIn 0.3s ease-out" }}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-grow min-w-0">
              <p className={`text-sm font-semibold ${titleClasses[toast.type]}`}>
                {toast.title}
              </p>
              <p className="text-sm text-gray-700 mt-0.5 break-words">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
