import type { ReactNode } from 'react';

function ClientLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
