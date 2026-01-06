
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    outline: 'border-2 border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white',
    ghost: 'text-violet-600 hover:bg-violet-500/10',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-100 shadow-sm rounded-3xl p-5 ${className}`}>
      {children}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-violet-100 text-violet-600' }) => {
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
      {children}
    </span>
  );
};
