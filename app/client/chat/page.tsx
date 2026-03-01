'use client';

// ============================================================================
// CHAT FEATURE DISABLED TEMPORARILY
// ============================================================================
// All chat functionality has been disabled. The original code has been removed
// but can be restored from git history if needed.
// 
// To re-enable chat:
// 1. Uncomment chat menu items in:
//    - components/ClientHeader.tsx
//    - components/MobileDockbar.tsx
// 2. Restore the original chat page code from git
// 3. Uncomment chat routing in middleware.ts
// ============================================================================

import ClientLayout from '@/components/ClientLayout';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function ChatPage() {
  return (
    <ClientLayout>
      <div className="fixed inset-0 top-16 bottom-20 lg:relative lg:inset-auto lg:top-auto lg:bottom-auto lg:container lg:mx-auto lg:px-4 lg:py-8 lg:max-w-7xl">
        <div className="h-full lg:h-[calc(100vh-12rem)] lg:rounded-lg border-t lg:border bg-card lg:shadow-lg overflow-hidden flex items-center justify-center">
          <div className="text-center p-8">
            <div className="relative inline-block mb-6">
              <MessageSquare className="h-24 w-24 text-muted-foreground" />
              <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-amber-600 dark:text-amber-500">
              Fitur Chat Dinonaktifkan Sementara
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-2">
              Fitur chat sedang dalam pemeliharaan sistem dan akan diaktifkan kembali dalam waktu dekat.
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Untuk bantuan, silakan hubungi kami melalui halaman keluhan atau customer support.
            </p>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
