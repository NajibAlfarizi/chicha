'use client';

import { useNotifications, type Notification } from '@/lib/useNotifications';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, Package, Wrench, Target, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'booking':
      case 'booking_new':
      case 'booking_assigned':
        return <Wrench className="h-5 w-5 text-purple-500" />;
      case 'target':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'complaint_reply':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-amber-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'order' && (notification.order_id || notification.related_id)) {
      router.push(`/client/akun?tab=orders`);
    } else if ((notification.type === 'booking' || notification.type === 'booking_new' || notification.type === 'booking_assigned') && (notification.booking_id || notification.related_id)) {
      router.push(`/client/akun?tab=bookings`);
    } else if (notification.type === 'target' && (notification.related_id)) {
      router.push(`/client/akun?tab=targets`);
    } else if (notification.type === 'complaint_reply' && notification.related_id) {
      router.push(`/client/akun?tab=reviews`);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-20 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Bell className="h-6 md:h-8 w-6 md:w-8 text-amber-500" />
              Notifikasi
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/10 text-xs md:text-sm"
            >
              <CheckCheck className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Tandai Semua</span>
              <span className="sm:hidden">Tandai</span>
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2 md:space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-6 md:p-8 text-center">
              <Bell className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">Belum ada notifikasi</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-3 md:p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? 'bg-amber-500/5 border-amber-500/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5 md:mt-1">{getIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm md:text-base font-semibold line-clamp-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
