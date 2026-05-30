import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-3 rounded-[8px] bg-sky-100 p-3 text-sky-700">{icon}</div>
      <h2 className="text-xl font-black text-slate-800">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
