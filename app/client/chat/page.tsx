'use client';

import { useState } from 'react';
import ClientLayout from '@/components/ClientLayout';
import { ChatList } from '@/components/ChatList';
import { ChatRoom } from '@/components/ChatRoom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useChatRooms, type ChatRoom as ChatRoomType } from '@/lib/useChat';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuth();
  const { createRoom, fetchRooms } = useChatRooms(user?.id, 'customer');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChatType, setNewChatType] = useState<string>('support');
  const [newChatName, setNewChatName] = useState('');

  const handleSelectRoom = (room: ChatRoomType) => {
    setSelectedRoom(room);
    setShowMobileChat(true);
  };

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="h-[calc(100vh-12rem)] rounded-lg border bg-card shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Chat List - Hide on mobile when chat is open */}
            <div className={`lg:col-span-1 border-r ${showMobileChat ? 'hidden lg:block' : 'block'}`}>
              <ChatList
                onSelectRoom={handleSelectRoom}
                userType="customer"
                onCreateRoom={() => setCreateDialogOpen(true)}
                selectedRoomId={selectedRoom?.id}
              />
            </div>

            {/* Chat Room - Show on mobile when room is selected */}
            <div className={`lg:col-span-2 ${showMobileChat || selectedRoom ? 'block' : 'hidden lg:block'}`}>
              {selectedRoom ? (
                <ChatRoom room={selectedRoom} onBack={handleBack} />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/20">
                  <div className="text-center p-8">
                    <MessageSquare className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
                    <p className="text-muted-foreground">
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
