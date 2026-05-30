import type { ReactNode } from 'react';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>;
}
