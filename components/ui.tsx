import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';

// --- TOAST SYSTEM ---
export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md
              animate-in slide-in-from-bottom-5 fade-in duration-300
              ${toast.type === 'success' ? 'bg-emerald-900/95 text-emerald-100 border border-emerald-500/30' : ''}
              ${toast.type === 'error' ? 'bg-rose-900/95 text-rose-100 border border-rose-500/30' : ''}
              ${toast.type === 'info' ? 'bg-slate-900/95 text-slate-100 border border-slate-700/30' : ''}
              ${toast.type === 'loading' ? 'bg-slate-900/95 text-slate-100 border border-slate-700/30' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
            {toast.type === 'loading' && <Loader2 size={18} className="text-slate-400 animate-spin shrink-0" />}

            <p className="text-xs font-bold leading-tight">{toast.message}</p>

            <button
              onClick={() => hideToast(toast.id)}
              className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={14} className="opacity-60" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- BASE COMPONENTS ---

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div className={`bg-white rounded-[24px] shadow-sm border border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className = '',
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-slate-300",
    ghost: "text-slate-600 hover:bg-slate-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input
      className={`
        w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 
        text-sm font-medium text-slate-900 placeholder:text-slate-400
        outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all
        ${className}
      `}
      {...props}
    />
  );
};

export const Badge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', children, ...props }) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-black uppercase tracking-wider ${className}`} {...props}>
      {children}
    </span>
  );
};
