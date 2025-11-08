'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatMessages, type ChatRoom } from '@/lib/useChat';
import { useAuth } from '@/lib/auth-context';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, User, Wrench, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ChatRoomProps {
  room: ChatRoom;
  onBack: () => void;
}

export function ChatRoom({ room, onBack }: ChatRoomProps) {
  const { user } = useAuth();
  const { teknisi } = useTeknisiAuth();
  const { messages, sendMessage, markAsRead } = useChatMessages(room.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current user info
  const currentUser = user || teknisi;
  const currentUserId = user?.id || teknisi?.id;
  const currentUserName = user?.name || teknisi?.name;
  const currentUserType = teknisi ? 'teknisi' : user?.role === 'admin' ? 'admin' : 'customer';

  // Auto-scroll to bottom only if container is visible
  useEffect(() => {
    if (messages.length > 0 && containerRef.current && messagesEndRef.current) {
      // Check if container is actually visible
      const isVisible = containerRef.current.offsetParent !== null;
      if (isVisible) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Mark messages as read when opening room
  useEffect(() => {
    if (currentUserId) {
      markAsRead(currentUserId);
    }
  }, [room.id, currentUserId, markAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !currentUserId || !currentUserName) return;

    setSending(true);
    const success = await sendMessage({
      sender_type: currentUserType,
      sender_id: currentUserId,
      sender_name: currentUserName,
      message: newMessage.trim(),
    });

    if (success) {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getRoomTitle = () => {
    // Admin/Teknisi sees customer name + order/booking info
    if (currentUserType === 'admin' || currentUserType === 'teknisi') {
      const customerName = room.customer?.name || 'Customer';
      
      if (room.type === 'order' && room.order_id) {
        return `${customerName} - Order #${room.order_id.slice(0, 8)}`;
      }
      
      if (room.type === 'booking' && room.booking_id) {
        return `${customerName} - Booking #${room.booking_id.slice(0, 8)}`;
      }
      
      return customerName;
    }
    
    // Customer sees teknisi or admin name
    if (room.name) return room.name;
    
    if (room.teknisi) {
      return room.teknisi.name;
    }
    
    if (room.admin) {
      return room.admin.name || 'Admin';
    }
    
    return 'Customer Support';
  };

  const getRoomSubtitle = () => {
    if (room.type === 'order') return 'Chat Pesanan';
    if (room.type === 'booking') return 'Chat Servis';
    if (room.type === 'support') return 'Customer Support';
    return 'Direct Chat';
  };

  const getRoomIcon = () => {
    if (room.type === 'order') {
      return <ShoppingBag className="h-6 w-6 text-blue-500" />;
    }
    if (room.type === 'booking' || room.teknisi) {
      return <Wrench className="h-6 w-6 text-purple-500" />;
    }
    return <User className="h-6 w-6 text-amber-500" />;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-card/50 flex items-center gap-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          {getRoomIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="font-bold truncate">{getRoomTitle()}</h2>
          <p className="text-xs text-muted-foreground">
            {getRoomSubtitle()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const showTimestamp = 
                index === 0 || 
                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 minutes

              return (
                <div key={message.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-muted-foreground my-2">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  )}
                  
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}>
                      {!isOwnMessage && (
                        <p className="text-xs text-muted-foreground mb-1 ml-2">
                          {message.sender_name}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-amber-500 text-white rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      </div>
                      <p className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'} px-2`}>
                        {new Date(message.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isOwnMessage && message.is_read && ' • Read'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-amber-500 hover:bg-amber-600 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
