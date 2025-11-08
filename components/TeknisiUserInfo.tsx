'use client';

import { useTeknisiAuth } from '@/lib/teknisi-auth-context';

export function TeknisiUserInfo() {
  const { teknisi } = useTeknisiAuth();

  if (!teknisi) return null;

  return (
    <div className="text-right">
      <p className="text-sm font-semibold">{teknisi.name}</p>
      <p className="text-xs text-muted-foreground">@{teknisi.username}</p>
    </div>
  );
}
