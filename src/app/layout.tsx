import type { ReactNode } from 'react';

// Root layout — just passes through to [locale] layout
// next-intl requires the root layout to be minimal
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
