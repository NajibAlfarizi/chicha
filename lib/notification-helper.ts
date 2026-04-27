import { supabaseAdmin } from './supabaseClient';

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'booking_new' | 'booking_assigned' | 'target' | 'general' | 'complaint_reply';
  related_id?: string;
  booking_id?: string;
  order_id?: string;
}

/**
 * Helper function to create a notification
 * Call this when you want to notify a user about something
 * Uses supabaseAdmin to bypass RLS
 */
export async function createNotification({
  user_id,
  title,
  message,
  type,
  related_id,
  booking_id,
  order_id,
}: CreateNotificationParams) {
  try {
    const notificationData: any = {
      user_id,
      title,
      message,
      type,
      is_read: false,
    };

    if (related_id) notificationData.related_id = related_id;
    if (booking_id) notificationData.booking_id = booking_id;
    if (order_id) notificationData.order_id = order_id;

    console.log('📨 Creating notification:', notificationData);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create notification:', error);
      return null;
    }

    console.log('✅ Notification created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
}

/**
 * Create notification for order status change
 */
export async function notifyOrderStatusChange(
  userId: string,
  orderId: string,
  status: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    pending: {
      title: 'Pesanan Menunggu Pembayaran',
      message: 'Pesanan Anda sedang menunggu konfirmasi pembayaran.',
    },
    dikirim: {
      title: 'Pesanan Sedang Dikirim',
      message: 'Pesanan Anda sedang dalam perjalanan. Mohon tunggu hingga pesanan tiba.',
    },
    selesai: {
      title: 'Pesanan Selesai',
      message: 'Pesanan Anda telah selesai. Terima kasih telah berbelanja!',
    },
    dibatalkan: {
      title: 'Pesanan Dibatalkan',
      message: 'Pesanan Anda telah dibatalkan.',
    },
  };

  const statusInfo = statusMessages[status.toLowerCase()];
  if (!statusInfo) {
    console.warn('⚠️ Unknown order status:', status);
    return null;
  }

  console.log('📨 Creating order status notification:', { userId, orderId, status });

  return createNotification({
    user_id: userId,
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'order',
    order_id: orderId,
  });
}

/**
 * Create notification for booking status change
 */
export async function notifyBookingStatusChange(
  userId: string,
  bookingId: string,
  status: string
) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    pending: {
      title: 'Booking Menunggu',
      message: 'Permintaan booking Anda sedang menunggu teknisi.',
    },
    confirmed: {
      title: 'Booking Dikonfirmasi',
      message: 'Booking Anda telah dikonfirmasi oleh teknisi.',
    },
    in_progress: {
      title: 'Servis Sedang Dikerjakan',
      message: 'Teknisi sedang mengerjakan servis Anda.',
    },
    completed: {
      title: 'Servis Selesai',
      message: 'Servis Anda telah selesai. Terima kasih!',
    },
    cancelled: {
      title: 'Booking Dibatalkan',
      message: 'Booking Anda telah dibatalkan.',
    },
  };

  const statusInfo = statusMessages[status.toLowerCase()];
  if (!statusInfo) return null;

  return createNotification({
    user_id: userId,
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'booking',
    related_id: bookingId,
  });
}

/**
 * Create notification for target assignment/update
 */
export async function notifyTargetUpdate(
  userId: string,
  targetId: string,
  action: 'assigned' | 'updated' | 'completed'
) {
  const actionMessages: Record<string, { title: string; message: string }> = {
    assigned: {
      title: 'Target Baru',
      message: 'Anda mendapatkan target baru dari admin',
    },
    updated: {
      title: 'Target Diperbarui',
      message: 'Target Anda telah diperbarui oleh admin',
    },
    completed: {
      title: 'Target Tercapai',
      message: 'Selamat! Anda telah mencapai target',
    },
  };

  const actionInfo = actionMessages[action];
  if (!actionInfo) return null;

  return createNotification({
    user_id: userId,
    title: actionInfo.title,
    message: actionInfo.message,
    type: 'target',
    related_id: targetId,
  });
}
