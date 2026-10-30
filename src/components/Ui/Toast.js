"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(
    () => ({
      success: (message, duration) => addToast({ type: "success", message, duration }),
      error: (message, duration) =>
        addToast({ type: "error", message, duration: duration || 5000 }),
      info: (message, duration) => addToast({ type: "info", message, duration }),
      warning: (message, duration) => addToast({ type: "warning", message, duration }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ── Toast Container ────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// ── Single Toast ───────────────────────────────────
function Toast({ toast, onClose }) {
  const styles = {
    success: {
      bg: "bg-white border-emerald-200 text-emerald-950 shadow-emerald-500/5",
      icon: "text-emerald-600 bg-emerald-50 border border-emerald-100",
      iconPath: "m4.5 12.75 6 6 9-13.5",
    },
    error: {
      bg: "bg-white border-rose-200 text-rose-950 shadow-rose-500/5",
      icon: "text-rose-600 bg-rose-50 border border-rose-100",
      iconPath: "M6 18 18 6M6 6l12 12",
    },
    warning: {
      bg: "bg-white border-amber-200 text-amber-950 shadow-amber-500/5",
      icon: "text-amber-600 bg-amber-50 border border-amber-100",
      iconPath:
        "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
    },
    info: {
      bg: "bg-white border-blue-200 text-blue-950 shadow-blue-500/5",
      icon: "text-[#2563EB] bg-blue-50 border border-blue-100",
      iconPath:
        "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
    },
  };

  const style = styles[toast.type] || styles.info;

  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-sm animate-in slide-in-from-right-full duration-300 sm:w-96 ${style.bg}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
        <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d={style.iconPath} />
        </svg>
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-relaxed text-gray-900">
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Close toast"
      >
        <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
