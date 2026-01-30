import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon' | 'danger' | 'secondary';
  active?: boolean;
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'ghost', 
  active = false, 
  className = '', 
  tooltip,
  ...props 
}) => {
  const baseStyles = "transition-colors duration-150 rounded-md flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 px-4 py-1.5 shadow-sm",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 px-4 py-1.5",
    danger: "bg-red-500 text-white hover:bg-red-600 px-4 py-1.5 shadow-sm focus:ring-red-500/50",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5",
    icon: "p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800",
  };

  const activeStyles = active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${activeStyles} ${className}`}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
};