'use client';

import AdminLayout from '@/components/AdminLayout';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminChatPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col h-screen">
        <div className="p-4 md:p-6 border-b bg-card shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 text-amber-600 dark:text-amber-500">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />
            Customer Chat
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Kelola percakapan dengan customer
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full flex items-center justify-center m-4 md:m-6">
            <div className="text-center p-8 max-w-md">
              <div className="relative inline-block mb-6">
                <MessageSquare className="h-24 w-24 text-muted-foreground" />
                <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-amber-600 dark:text-amber-500">
                Fitur Chat Dinonaktifkan Sementara
              </h3>
              <p className="text-muted-foreground mb-2">
                Fitur chat admin sedang dalam pemeliharaan sistem dan akan diaktifkan kembali dalam waktu dekat.
              </p>
              <p className="text-sm text-muted-foreground">
                Untuk komunikasi dengan customer, silakan gunakan fitur keluhan yang masih aktif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
