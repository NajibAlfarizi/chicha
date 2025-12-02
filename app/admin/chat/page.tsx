'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ChatList } from '@/components/ChatList';
import { ChatRoom } from '@/components/ChatRoom';
import { MessageSquare } from 'lucide-react';
import { type ChatRoom as ChatRoomType } from '@/lib/useChat';

export default function AdminChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  const handleSelectRoom = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 md:p-6 border-b bg-card shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 text-amber-600 dark:text-amber-500">
            <MessageSquare className="h-6 w-6 md:h-8 md:w-8" />
            Customer Chat
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Kelola percakapan dengan customer
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full rounded-lg border bg-card shadow-lg overflow-hidden m-4 md:m-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Chat List */}
              <div className={`lg:col-span-1 border-r ${selectedRoom ? 'hidden lg:block' : 'block'} h-full overflow-hidden`}>
                <ChatList
                  onSelectRoom={handleSelectRoom}
                  onCreateRoom={() => {}}
                  selectedRoomId={selectedRoom?.id}
                  userType="admin"
                />
              </div>

              {/* Chat Room */}
              <div className={`lg:col-span-2 ${selectedRoom ? 'block' : 'hidden lg:block'} h-full overflow-hidden`}>
                {selectedRoom ? (
                  <ChatRoom room={selectedRoom} onBack={handleBack} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-muted/20">
                    <div className="text-center p-6 md:p-8">
                      <MessageSquare className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground mx-auto mb-3 md:mb-4" />
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Select a chat</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Pilih percakapan dari daftar untuk membalas customer
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
