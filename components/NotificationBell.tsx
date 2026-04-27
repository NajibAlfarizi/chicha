'use client';

import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useNotifications, type Notification } from '@/lib/useNotifications';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  
  // Get userId from either auth context or localStorage - improved detection
  useEffect(() => {
    // First try: customer from useAuth context
    if (user?.id) {
      console.log('🔔 Detected customer from useAuth context:', user.id.slice(0, 8));
      setUserId(user.id);
      setUserRole(user.role);
      return;
    }
    
    // Second try: admin or teknisi from localStorage['teknisi']
    if (typeof window !== 'undefined') {
      const teknisiData = localStorage.getItem('teknisi');
      console.log('🔔 Checking localStorage teknisi:', teknisiData ? 'exists' : 'not found');
      
      if (teknisiData) {
        try {
          const parsed = JSON.parse(teknisiData);
          console.log('🔔 Parsed teknisi data:', {
            id: parsed.id?.slice(0, 8),
            role: parsed.role,
            name: parsed.name
          });
          
          if (parsed.id && parsed.role) {
            setUserId(parsed.id);
            setUserRole(parsed.role);
            console.log('✅ NotificationBell initialized with:', {
              userId: parsed.id.slice(0, 8),
              userRole: parsed.role
            });
            return;
          }
        } catch (e) {
          console.error('❌ Error parsing teknisi data:', e);
        }
      }
    }
    
    // If we get here, no user found
    console.warn('⚠️ NotificationBell: No user ID found in auth context or localStorage');
    setUserId(undefined);
    setUserRole(undefined);
  }, [user]); // Keep user in deps to trigger on login/logout

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);

  console.log('🔔 NotificationBell render:', { 
    userId: userId?.slice(0, 8), 
    userRole,
    notificationsCount: notifications.length, 
    unreadCount 
  });

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type and user role
    if (notification.type === 'order' && (notification.related_id || notification.order_id)) {
      router.push(`/client/akun?tab=orders`);
    } else if ((notification.type === 'booking' || notification.type === 'booking_new' || notification.type === 'booking_assigned') && (notification.related_id || notification.booking_id)) {
      // Navigate based on user role
      if (userRole === 'teknisi') {
        router.push(`/teknisi/service`);
      } else if (userRole === 'admin') {
        router.push(`/admin/booking`);
      } else {
        router.push(`/client/akun?tab=bookings`);
      }
    } else if (notification.type === 'target' && notification.related_id) {
      router.push(`/client/akun?tab=targets`);
    } else if (notification.type === 'complaint_reply' && notification.related_id) {
      router.push(`/client/akun?tab=reviews`);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" suppressHydrationWarning>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80" suppressHydrationWarning>
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">Notifikasi</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs text-amber-500 hover:text-amber-600"
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Tidak ada notifikasi
            </div>
          ) : (
            recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-4 cursor-pointer ${
                  !notification.is_read ? 'bg-amber-500/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/client/notifications')}
                className="w-full text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
              >
                Lihat Semua Notifikasi
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
