import { supabase, supabaseAdmin } from './supabaseClient';

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'target' | 'general' | 'booking_assignment' | 'order_status';
  related_id?: string;
  order_id?: string;
  booking_id?: string;
}

/**
 * Helper function to create a notification
 * Call this when you want to notify a user about something
 */
export async function createNotification({
  user_id,
  title,
  message,
  type,
  related_id,
  order_id,
  booking_id,
}: CreateNotificationParams) {
  try {
    const insertData: any = {
      user_id,
      title,
      message,
      type,
      is_read: false,
    };

    // Add optional fields if provided
    if (related_id) insertData.related_id = related_id;
    if (order_id) insertData.order_id = order_id;
    if (booking_id) insertData.booking_id = booking_id;

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
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
  if (!statusInfo) return null;

  return createNotification({
    user_id: userId,
    title: statusInfo.title,
    message: statusInfo.message,
    type: 'order',
    related_id: orderId,
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
    menunggu: {
      title: 'Booking Menunggu',
      message: 'Permintaan booking Anda sedang menunggu pemeriksaan.',
    },
    diproses: {
      title: 'Servis Sedang Diproses',
      message: 'HP Anda sedang dalam proses perbaikan.',
    },
    selesai: {
      title: 'Servis Selesai',
      message: 'Perbaikan HP Anda telah selesai dan siap diambil!',
    },
    dibatalkan: {
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

/**
 * Get all admin user IDs
 */
async function getAdminUserIds(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (error) {
      console.error('Failed to fetch admin users:', error);
      return [];
    }

    return data.map(admin => admin.id);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
}

/**
 * Notify all admins about new order
 */
export async function notifyAdminsNewOrder(orderId: string, orderDetails: {
  customerName?: string;
  totalAmount: number;
  itemCount: number;
}) {
  try {
    const adminIds = await getAdminUserIds();
    
    if (adminIds.length === 0) {
      console.warn('No admin users found to notify');
      return [];
    }

    const notifications = await Promise.all(
      adminIds.map(adminId =>
        createNotification({
          user_id: adminId,
          title: '🛒 Pesanan Baru Masuk',
          message: `Pesanan baru dari ${orderDetails.customerName || 'Pelanggan'} dengan ${orderDetails.itemCount} item (Rp ${orderDetails.totalAmount.toLocaleString('id-ID')})`,
          type: 'order',
          order_id: orderId,
          related_id: orderId,
        })
      )
    );

    console.log(`✅ Notified ${adminIds.length} admins about new order`);
    return notifications;
  } catch (error) {
    console.error('Error notifying admins about new order:', error);
    return [];
  }
}

/**
 * Notify all admins about new booking
 */
export async function notifyAdminsNewBooking(bookingId: string, bookingDetails: {
  customerName?: string;
  deviceName: string;
  issue: string;
  serviceCode?: string;
}) {
  try {
    const adminIds = await getAdminUserIds();
    
    if (adminIds.length === 0) {
      console.warn('No admin users found to notify');
      return [];
    }

    const notifications = await Promise.all(
      adminIds.map(adminId =>
        createNotification({
          user_id: adminId,
          title: '🔧 Booking Service Baru',
          message: `Booking baru dari ${bookingDetails.customerName || 'Pelanggan'} untuk ${bookingDetails.deviceName}${bookingDetails.serviceCode ? ` (${bookingDetails.serviceCode})` : ''}`,
          type: 'booking',
          booking_id: bookingId,
          related_id: bookingId,
        })
      )
    );

    console.log(`✅ Notified ${adminIds.length} admins about new booking`);
    return notifications;
  } catch (error) {
    console.error('Error notifying admins about new booking:', error);
    return [];
  }
}

/**
 * Notify customer about new order confirmation
 */
export async function notifyCustomerNewOrder(userId: string, orderId: string, orderDetails: {
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
}) {
  return createNotification({
    user_id: userId,
    title: '✅ Pesanan Berhasil Dibuat',
    message: `Pesanan Anda dengan ${orderDetails.itemCount} item (Total: Rp ${orderDetails.totalAmount.toLocaleString('id-ID')}) berhasil dibuat. Metode pembayaran: ${orderDetails.paymentMethod}`,
    type: 'order',
    order_id: orderId,
    related_id: orderId,
  });
}

/**
 * Notify customer about new booking confirmation
 */
export async function notifyCustomerNewBooking(userId: string, bookingId: string, bookingDetails: {
  deviceName: string;
  bookingDate: string;
  serviceCode?: string;
}) {
  const bookingDateFormatted = new Date(bookingDetails.bookingDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return createNotification({
    user_id: userId,
    title: '✅ Booking Service Berhasil',
    message: `Booking service untuk ${bookingDetails.deviceName} berhasil dibuat${bookingDetails.serviceCode ? ` (${bookingDetails.serviceCode})` : ''}. Tanggal: ${bookingDateFormatted}. Admin akan segera menugaskan teknisi untuk Anda.`,
    type: 'booking',
    booking_id: bookingId,
    related_id: bookingId,
  });
}
