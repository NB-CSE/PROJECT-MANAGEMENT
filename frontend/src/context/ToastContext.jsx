import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, toast: {
      success: (msg) => addToast(msg, 'success'),
      error: (msg) => addToast(msg, 'error'),
      info: (msg) => addToast(msg, 'info')
    }}}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-card border transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === 'success'
                ? 'bg-white border-lime-dark/30 text-charcoal'
                : t.type === 'error'
                ? 'bg-white border-red-200 text-charcoal'
                : 'bg-white border-charcoal-200 text-charcoal'
            }`}
          >
            {t.type === 'success' && (
              <div className="p-1 rounded-full bg-lime text-charcoal mt-0.5">
                <CheckCircle2 size={16} />
              </div>
            )}
            {t.type === 'error' && (
              <div className="p-1 rounded-full bg-red-100 text-red-600 mt-0.5">
                <AlertCircle size={16} />
              </div>
            )}
            {t.type === 'info' && (
              <div className="p-1 rounded-full bg-charcoal-100 text-charcoal mt-0.5">
                <Info size={16} />
              </div>
            )}
            <div className="flex-1 text-sm font-medium">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-charcoal-400 hover:text-charcoal transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
