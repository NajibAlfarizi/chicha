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
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-amber-600 dark:text-amber-500">
            <MessageSquare className="h-8 w-8" />
            Chat Customer
          </h1>
          <p className="text-muted-foreground mt-2">
            Komunikasi dengan customer terkait servis
          </p>
        </div>

        <div className="h-[calc(100vh-16rem)] rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Chat List */}
            <div className="lg:col-span-1 border-r">
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
                <div className="h-full flex items-center justify-center bg-muted/20">
                  <div className="text-center p-8">
                    <MessageSquare className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Pilih Chat</h3>
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
