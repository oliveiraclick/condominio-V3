import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', fullWidth = false, className = '', ...props
}) => {
  const baseStyles = 'px-8 py-4 rounded-[22px] font-bold uppercase tracking-[0.2em] text-[10px] transition-all duration-500 flex items-center justify-center gap-3 active:scale-[0.97]';
  const variants = {
    primary: 'bg-slate-950 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:shadow-slate-950/20',
    secondary: 'bg-white border border-slate-100 text-slate-900 shadow-sm hover:bg-slate-50',
    outline: 'border-[1.5px] border-slate-200 text-slate-900 hover:border-slate-950 hover:bg-slate-950 hover:text-white',
    ghost: 'text-slate-500 hover:text-slate-950 hover:bg-slate-50/50',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full bg-slate-50/50 border-[1.5px] border-slate-100 rounded-[22px] px-6 py-5 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 transition-all duration-300 ${className}`}
      {...props}
    />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-50 shadow-[0_20px_40px_rgba(0,0,0,0.03)] rounded-[40px] p-8 transition-all duration-500 hover:shadow-slate-900/5 ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-slate-900 text-white' }) => {
  return (
    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${color}`}>
      {children}
    </span>
  );
};