'use client';

import { useChatRooms, type ChatRoom } from '@/lib/useChat';
import { useAuth } from '@/lib/auth-context';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, User, Wrench, Package, ShoppingBag, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface ChatListProps {
  onSelectRoom: (room: ChatRoom) => void;
  onCreateRoom: () => void;
  selectedRoomId?: string;
  userType?: 'customer' | 'admin' | 'teknisi';
}

export function ChatList({ onSelectRoom, onCreateRoom, selectedRoomId, userType }: ChatListProps) {
  const { user } = useAuth();
  const { teknisi } = useTeknisiAuth();
  
  // Determine user ID and type based on explicit userType prop or context
  let userId: string | undefined;
  let type: 'customer' | 'admin' | 'teknisi';

  if (userType === 'teknisi') {
    userId = teknisi?.id;
    type = 'teknisi';
  } else if (userType === 'admin') {
    userId = user?.id;
    type = 'admin';
  } else if (userType === 'customer') {
    userId = user?.id;
    type = 'customer';
  } else {
    // Auto-detect if no explicit userType
    userId = teknisi?.id || user?.id;
    type = teknisi ? 'teknisi' : user?.role === 'admin' ? 'admin' : 'customer';
  }
  
  const { rooms, loading, totalUnread } = useChatRooms(userId, type);

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Wrench className="h-5 w-5 text-purple-500" />;
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'support':
        return <MessageSquare className="h-5 w-5 text-amber-500" />;
      default:
        return <User className="h-5 w-5 text-green-500" />;
    }
  };

  const getRoomTitle = (room: ChatRoom) => {
    // For admin/teknisi, show customer name + order/booking info
    if (type === 'admin' || type === 'teknisi') {
      const customerName = room.customer?.name || 'Unknown Customer';
      
      if (room.type === 'order' && room.order_id) {
        return `${customerName} - Order #${room.order_id.slice(0, 8)}`;
      }
      
      if (room.type === 'booking' && room.booking_id) {
        return `${customerName} - Booking #${room.booking_id.slice(0, 8)}`;
      }
      
      return customerName;
    }
    
    // For customer, show teknisi/admin name or support
    if (room.name) return room.name;
    
    if (room.teknisi) {
      return room.teknisi.name;
    }
    
    if (room.admin) {
      return room.admin.name || 'Admin';
    }
    
    return room.type === 'support' ? 'Customer Support' : 'Chat';
  };

  const getRoomSubtitle = (room: ChatRoom) => {
    if (room.type === 'booking' && room.booking_id) {
      return `Servis Booking`;
    }
    if (room.type === 'order' && room.order_id) {
      return `Pesanan Produk`;
    }
    if (room.type === 'support') {
      return 'Customer Support';
    }
    return room.type.charAt(0).toUpperCase() + room.type.slice(1);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-card/50 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            <span className="hidden sm:inline">Chat</span>
          </h2>
          <Button
            onClick={onCreateRoom}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 h-8 sm:h-9"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
        {totalUnread > 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {rooms.length === 0 ? (
          <div className="p-4 sm:p-8 text-center">
            <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground mb-4">No chats yet</p>
            <Button
              onClick={onCreateRoom}
              variant="outline"
              size="sm"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start a Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-1 p-1 sm:p-2">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`p-2.5 sm:p-3 cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
                  selectedRoomId === room.id
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : room.unread_count && room.unread_count > 0
                    ? 'bg-blue-500/5 border-blue-500/20'
                    : ''
                }`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5 sm:mt-1">
                    {getRoomIcon(room.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-semibold truncate">
                        {getRoomTitle(room)}
                      </h3>
                      {room.unread_count && room.unread_count > 0 && (
                        <div className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                          {room.unread_count > 9 ? '9+' : room.unread_count}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {getRoomSubtitle(room)}
                    </p>

                    {room.last_message && (
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {room.last_sender_name && (
                          <span className="font-medium">{room.last_sender_name}: </span>
                        )}
                        {room.last_message}
                      </p>
                    )}

                    <span className="text-xs text-muted-foreground mt-0.5 block">
                      {formatDistanceToNow(new Date(room.last_message_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
