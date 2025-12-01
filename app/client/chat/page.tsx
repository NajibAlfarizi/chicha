'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { ChatList } from '@/components/ChatList';
import { ChatRoom } from '@/components/ChatRoom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useChatRooms, type ChatRoom as ChatRoomType } from '@/lib/useChat';
import { toast } from 'sonner';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { rooms, createRoom, fetchRooms } = useChatRooms(user?.id, 'customer');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChatType, setNewChatType] = useState<string>('support');
  const [newChatName, setNewChatName] = useState('');
  const hasAutoSelected = useRef(false);

  const handleSelectRoom = useCallback((room: ChatRoomType) => {
    setSelectedRoom(room);
    setShowMobileChat(true);
  }, []);

  // Auto-select room from URL parameter
  useEffect(() => {
    const roomId = searchParams?.get('room');
    if (roomId && rooms.length > 0 && !hasAutoSelected.current) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        console.log('🎯 Auto-selecting room from URL:', room.id);
        hasAutoSelected.current = true;
        // Use setTimeout to avoid setState in effect body
        setTimeout(() => {
          setSelectedRoom(room);
          setShowMobileChat(true);
        }, 0);
      }
    }
  }, [searchParams, rooms]);

  const handleBack = () => {
    setShowMobileChat(false);
    setSelectedRoom(null);
  };

  const handleCreateRoom = async () => {
    if (!user) return;

    try {
      const roomData = {
        type: newChatType,
        customer_id: user.id,
        name: newChatName || `${newChatType.charAt(0).toUpperCase() + newChatType.slice(1)} Chat`,
      };

      const room = await createRoom(roomData);
      
      if (room) {
        toast.success('Chat created', {
          description: 'New chat room has been created successfully.',
        });
        setCreateDialogOpen(false);
        setNewChatName('');
        setNewChatType('support');
        setSelectedRoom(room);
        setShowMobileChat(true);
        await fetchRooms();
      } else {
        toast.error('Failed to create chat', {
          description: 'Please try again later.',
        });
      }
    } catch (error) {
      console.error('Create room error:', error);
      toast.error('An error occurred', {
        description: 'Failed to create chat room.',
      });
    }
  };

  return (
    <ClientLayout>
      <div className="fixed inset-0 top-16 bottom-20 lg:relative lg:inset-auto lg:top-auto lg:bottom-auto lg:container lg:mx-auto lg:px-4 lg:py-8 lg:max-w-7xl">
        {/* Chat container - Fixed height to avoid overlap with dockbar */}
        <div className="h-full lg:h-[calc(100vh-12rem)] lg:rounded-lg border-t lg:border bg-card lg:shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Chat List - Hide on mobile when chat is open */}
            <div className={`lg:col-span-1 lg:border-r h-full overflow-hidden ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
              <ChatList
                onSelectRoom={handleSelectRoom}
                userType="customer"
                onCreateRoom={() => setCreateDialogOpen(true)}
                selectedRoomId={selectedRoom?.id}
              />
            </div>

            {/* Chat Room - Full width on mobile when room is selected */}
            <div className={`lg:col-span-2 h-full overflow-hidden ${showMobileChat || selectedRoom ? 'block' : 'hidden lg:block'}`}>
              {selectedRoom ? (
                <ChatRoom room={selectedRoom} onBack={handleBack} />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20">
                  <div className="text-center p-4 sm:p-8">
                    <MessageSquare className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Select a chat</h3>
                    <p className="text-sm sm:text-base text-muted-foreground px-4">
                      Choose a chat from the list or start a new conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create New Chat Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-500" />
                Start New Chat
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="chat-type">Chat Type</Label>
                <Select value={newChatType} onValueChange={setNewChatType}>
                  <SelectTrigger id="chat-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="direct">Direct Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-name">Chat Name (Optional)</Label>
                <Input
                  id="chat-name"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g., Question about product"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoom}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Create Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="fixed inset-0 top-16 bottom-20 lg:relative lg:inset-auto lg:top-auto lg:bottom-auto lg:container lg:mx-auto lg:px-4 lg:py-8 lg:max-w-7xl">
          <div className="h-full lg:h-[calc(100vh-12rem)] lg:rounded-lg border-t lg:border bg-card lg:shadow-lg overflow-hidden flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
              <p>Loading chat...</p>
            </div>
          </div>
        </div>
      </ClientLayout>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
