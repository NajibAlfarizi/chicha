'use client';

import TeknisiLayout from '@/components/TeknisiLayout';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default function TeknisiChatPage() {
  return (
    <TeknisiLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-amber-700 dark:text-amber-400">Chat Customer</span>
          </h1>
          <p className="text-muted-foreground ml-16">
            Komunikasi dengan customer terkait servis
          </p>
        </div>

        <div className="h-[calc(100vh-16rem)] rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-xl overflow-hidden flex items-center justify-center">
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
              Fitur chat teknisi sedang dalam pemeliharaan sistem dan akan diaktifkan kembali dalam waktu dekat.
            </p>
            <p className="text-sm text-muted-foreground">
              Untuk komunikasi dengan customer, silakan koordinasi melalui admin.
            </p>
          </div>
        </div>
      </div>
    </TeknisiLayout>
  );
}
