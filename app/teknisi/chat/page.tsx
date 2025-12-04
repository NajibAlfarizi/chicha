'use client';

import { useState } from 'react';
import TeknisiLayout from '@/components/TeknisiLayout';
import { ChatList } from '@/components/ChatList';
import { ChatRoom } from '@/components/ChatRoom';
import { MessageSquare } from 'lucide-react';
import { type ChatRoom as ChatRoomType } from '@/lib/useChat';

export default function TeknisiChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  const handleSelectRoom = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
  };

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

        <div className="h-[calc(100vh-16rem)] rounded-xl border border-amber-200/50 dark:border-amber-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Chat List */}
            <div className="lg:col-span-1 border-r border-amber-200/50 dark:border-amber-900/30">
              <ChatList
                onSelectRoom={handleSelectRoom}
                onCreateRoom={() => {}}
                selectedRoomId={selectedRoom?.id}
                userType="teknisi"
              />
            </div>

            {/* Chat Room */}
            <div className="lg:col-span-2">
              {selectedRoom ? (
                <ChatRoom room={selectedRoom} onBack={handleBack} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
                  <div className="text-center p-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-12 w-12 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Pilih Chat</h3>
                    <p className="text-muted-foreground">
                      Pilih percakapan dari daftar untuk chat dengan customer
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeknisiLayout>
  );
}
