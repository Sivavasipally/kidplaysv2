import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonTone = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  icon?: ReactNode;
};

const toneClasses: Record<ButtonTone, string> = {
  primary: 'bg-sky-600 text-white hover:bg-sky-700',
  secondary: 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  success: 'bg-grass text-white hover:bg-emerald-600',
};

export function Button({ tone = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
