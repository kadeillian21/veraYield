'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Simple providers wrapper with SessionProvider
export function Providers({ children }: Props) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
