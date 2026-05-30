import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ label, icon, className = '', ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
