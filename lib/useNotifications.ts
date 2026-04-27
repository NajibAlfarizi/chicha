'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'booking_new' | 'booking_assigned' | 'target' | 'general' | 'complaint_reply';
  related_id?: string;
  booking_id?: string;
  order_id?: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      console.log('⚠️ No userId provided to useNotifications');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching notifications for userId:', userId);
      const response = await fetch(`/api/notifications?user_id=${userId}`);
      console.log('📡 API response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notifications received:', data);
        const notifs = data.notifications || [];
        console.log('📊 Total notifications:', notifs.length, 'Unread:', notifs.filter((n: Notification) => !n.is_read).length);
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length);
      } else {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial fetch and setup realtime subscription
  useEffect(() => {
    if (!userId) {
      console.warn('⚠️ useNotifications: No userId provided, skipping setup');
      setLoading(false);
      return;
    }

    console.log('📡 Setting up notification system for user:', userId);

    // Initial fetch
    fetchNotifications();

    // Setup realtime subscription using Supabase Realtime
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('🔔 Real-time notification change received:', {
            event: payload.eventType,
            table: payload.table,
            new: payload.new?.id,
          });
          // Refresh notifications when there's a change
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription SUBSCRIBED for user:', userId);
        } else if (status === 'CLOSED') {
          console.log('❌ Real-time subscription CLOSED');
        } else {
          console.log('📡 Subscription status:', status);
        }
      });

    // Add fallback polling mechanism (every 60 seconds)
    // This is a true fallback in case realtime subscription fails
    const pollInterval = setInterval(() => {
      console.log('⏱️ Polling for notifications (60s fallback)');
      fetchNotifications();
    }, 60000);

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up notification subscription for user:', userId);
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
