import { useState, useEffect, useCallback } from 'react';

export interface ChatRoom {
  id: string;
  name: string | null;
  type: string;
  customer_id: string;
  admin_id: string | null;
  teknisi_id: string | null;
  booking_id: string | null;
  order_id: string | null;
  last_message_at: string;
  created_at: string;
  unread_count?: number;
  last_message?: string | null;
  last_sender_name?: string | null;
  customer?: { id: string; name: string; email: string };
  admin?: { id: string; name: string; email: string };
  teknisi?: { id: string; name: string; phone: string };
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_type: string;
  sender_id: string;
  sender_name: string;
  message: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function useChatRooms(userId: string | undefined, userType: 'customer' | 'admin' | 'teknisi') {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchRooms = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/chat/rooms?user_id=${userId}&user_type=${userType}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
        
        // Calculate total unread
        const total = data.rooms?.reduce((sum: number, room: ChatRoom) => 
          sum + (room.unread_count || 0), 0
        ) || 0;
        setTotalUnread(total);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, userType]);

  useEffect(() => {
    fetchRooms();
    
    // Poll every 10 seconds for new messages
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const createRoom = async (roomData: {
    type: string;
    customer_id: string;
    admin_id?: string;
    teknisi_id?: string;
    booking_id?: string;
    order_id?: string;
    name?: string;
  }) => {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchRooms(); // Refresh rooms list
        return data.room;
      }
      return null;
    } catch (error) {
      console.error('Failed to create room:', error);
      return null;
    }
  };

  return { rooms, loading, totalUnread, fetchRooms, createRoom };
}

export function useChatMessages(roomId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('[useChat] Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    
    // Poll every 3 seconds for new messages in active chat
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async (messageData: {
    sender_type: string;
    sender_id: string;
    sender_name: string;
    message: string;
    message_type?: string;
    attachment_url?: string;
  }) => {
    if (!roomId) {
      return false;
    }

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        await fetchMessages(); // Refresh messages
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  const markAsRead = async (userId: string) => {
    if (!roomId) return;

    try {
      await fetch(`/api/chat/rooms/${roomId}?user_id=${userId}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return { messages, loading, sendMessage, markAsRead, fetchMessages };
}
