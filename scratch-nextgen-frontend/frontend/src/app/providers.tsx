import type { ReactNode } from 'react';
import { HashRouter } from 'react-router-dom';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <HashRouter>{children}</HashRouter>;
}
