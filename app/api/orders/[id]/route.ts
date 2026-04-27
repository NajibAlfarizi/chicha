import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { notifyOrderStatusChange, createNotification } from '@/lib/notification-helper';

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, name, email, phone),
        order_items:order_items(
          id,
          quantity,
          price,
          product:products(id, name, image_url, description)
        ),
        voucher:vouchers(id, code, name, type, value, min_purchase, max_discount)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ order: data }, { status: 200 });

  } catch (err) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH update order fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('📝 Updating order:', id, body);

    // Get order before update to check payment_status change
    const { data: orderBefore } = await supabaseAdmin
      .from('orders')
      .select('user_id, payment_status')
      .eq('id', id)
      .single();

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Order updated:', order.id);

    // Update target if payment_status changed to 'paid'
    if (orderBefore && body.payment_status === 'paid' && orderBefore.payment_status !== 'paid') {
      console.log('🎯 Payment status changed to paid, updating target for user:', orderBefore.user_id);
      
      try {
        // Calculate total spending from paid orders
        const { data: paidOrders } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .eq('user_id', orderBefore.user_id)
          .eq('payment_status', 'paid');

        const totalSpending = paidOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

        // Get or create target
        const { data: existingTarget } = await supabaseAdmin
          .from('targets')
          .select('*')
          .eq('user_id', orderBefore.user_id)
          .single();

        if (existingTarget) {
          // Update existing target
          const targetAmount = Number(existingTarget.target_amount);
          const wasActive = existingTarget.status === 'active';
          const newStatus = totalSpending >= targetAmount ? 'achieved' : 'active';

          await supabaseAdmin
            .from('targets')
            .update({
              current_amount: totalSpending,
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', orderBefore.user_id);

          console.log('✅ Target updated with current_amount:', totalSpending);

          // Send notification if target just achieved
          if (wasActive && newStatus === 'achieved') {
            await createNotification({
              user_id: orderBefore.user_id,
              title: '🎉 Target Tercapai!',
              message: `Selamat! Anda telah mencapai target belanja sebesar Rp ${targetAmount.toLocaleString('id-ID')}. Cek halaman akun untuk melihat reward Anda!`,
              type: 'target',
              related_id: existingTarget.id
            });
            console.log('✅ Target achievement notification sent');
          }
        } else {
          // Create new target
          const defaultTarget = 10000000; // 10 juta
          const newStatus = totalSpending >= defaultTarget ? 'achieved' : 'active';

          const { data: newTarget } = await supabaseAdmin
            .from('targets')
            .insert({
              user_id: orderBefore.user_id,
              target_amount: defaultTarget,
              current_amount: totalSpending,
              status: newStatus
            })
            .select()
            .single();

          console.log('✅ New target auto-created with current_amount:', totalSpending);

          // Send notification if target achieved on creation
          if (newStatus === 'achieved' && newTarget) {
            await createNotification({
              user_id: orderBefore.user_id,
              title: '🎉 Target Tercapai!',
              message: `Selamat! Anda telah mencapai target belanja sebesar Rp ${defaultTarget.toLocaleString('id-ID')}. Cek halaman akun untuk melihat reward Anda!`,
              type: 'target',
              related_id: newTarget.id
            });
          }
        }
      } catch (targetError) {
        console.error('⚠️ Failed to update target:', targetError);
        // Don't fail the order update if target update fails
      }
    }

    return NextResponse.json({ order }, { status: 200 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, cancel_reason } = await request.json();

    // Get order with items before update for potential stock rollback
    const { data: orderBefore } = await supabaseAdmin
      .from('orders')
      .select(`
        user_id, 
        status,
        order_items:order_items(product_id, quantity)
      `)
      .eq('id', id)
      .single();

    if (!orderBefore) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Define valid status transitions - status can only move forward
    const validTransitions: Record<string, string[]> = {
      'pending': ['dikirim', 'dibatalkan'],      // From pending, can go to shipped or cancelled
      'dikirim': ['selesai', 'dibatalkan'],     // From shipped, can go to completed or cancelled
      'selesai': [],                             // Completed, no progression
      'dibatalkan': [],                          // Cancelled, no progression
    };

    // Validate status transition
    const currentStatus = orderBefore.status;
    const allowedNextStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedNextStatuses.includes(status)) {
      console.warn(`❌ Invalid status transition: ${currentStatus} → ${status}`);
      return NextResponse.json({
        error: `Tidak dapat mengubah status dari '${currentStatus}' ke '${status}'`,
        details: `Status pesanan hanya dapat bergerak maju dalam alur: pending → dikirim → selesai. Pesanan tidak dapat dikembalikan ke status sebelumnya.`,
        currentStatus,
        requestedStatus: status,
        allowedNextStatuses
      }, { status: 400 });
    }

    console.log(`✅ Valid status transition approved: ${currentStatus} → ${status}`);

    // Prepare update data
    const updateData: { status: string; cancel_reason?: string; cancelled_at?: string } = { status };
    
    // If cancelling order, add cancel info and rollback stock
    if (status === 'dibatalkan' && orderBefore.status !== 'dibatalkan') {
      updateData.cancel_reason = cancel_reason || 'Dibatalkan oleh admin';
      updateData.cancelled_at = new Date().toISOString();

      console.log('🔄 Rolling back stock for cancelled order:', id);

      // Rollback stock for each item
      if (orderBefore.order_items) {
        for (const item of orderBefore.order_items) {
          const { data: product } = await supabaseAdmin
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            const newStock = product.stock + item.quantity;
            await supabaseAdmin
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.product_id);
            
            console.log(`✅ Stock rolled back for product ${item.product_id}: +${item.quantity} (new stock: ${newStock})`);
          }
        }
      }
    }

    // Update order
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create notification if status changed
    if (orderBefore.status !== status) {
      try {
        console.log('📨 Creating order status update notification for customer:', orderBefore.user_id);
        const notifResult = await notifyOrderStatusChange(orderBefore.user_id, id, status);
        if (notifResult) {
          console.log('✅ Customer status notification created');
        } else {
          console.warn('⚠️ Customer status notification failed to create');
        }
      } catch (notifError) {
        console.error('❌ Error creating customer status notification:', notifError);
        // Don't fail the order update if notification fails
      }

      // Create notification for all admins about status change
      try {
        console.log('📨 Fetching admin users for status update notifications...');
        const { data: adminUsers, error: adminError } = await supabaseAdmin
          .from('users')
          .select('id, name, role')
          .eq('role', 'admin');

        console.log('🔍 Admin query result:', {
          error: adminError?.message,
          count: adminUsers?.length,
          users: adminUsers?.map(u => ({ id: u.id.slice(0, 8), name: u.name, role: u.role }))
        });

        if (adminError) {
          console.error('❌ Error fetching admin users:', adminError);
        } else if (!adminUsers || adminUsers.length === 0) {
          console.warn('⚠️ No admin users found in database');
        } else {
          console.log(`Found ${adminUsers.length} admin(s), creating status notifications...`);
          
          // Map status to status message
          const statusMessages: Record<string, { title: string; message: string }> = {
            pending: {
              title: 'Pesanan Menunggu Pembayaran',
              message: `Pesanan #${id} menunggu konfirmasi pembayaran dari pelanggan.`,
            },
            dikirim: {
              title: 'Pesanan Dikirim',
              message: `Pesanan #${id} sedang dalam perjalanan ke pelanggan.`,
            },
            selesai: {
              title: 'Pesanan Selesai',
              message: `Pesanan #${id} telah selesai dan diterima oleh pelanggan.`,
            },
            dibatalkan: {
              title: 'Pesanan Dibatalkan',
              message: `Pesanan #${id} telah dibatalkan.`,
            },
          };
          
          const statusInfo = statusMessages[status.toLowerCase()];
          
          if (statusInfo) {
            // Create notification for each admin
            const adminNotifications = adminUsers.map(admin => ({
              user_id: admin.id,
              title: statusInfo.title,
              message: statusInfo.message,
              type: 'order',
              order_id: id,
            }));

            console.log('📋 Creating status notifications:', {
              count: adminNotifications.length,
              sample: adminNotifications[0]
            });

            const { data: notifData, error: notifError } = await supabaseAdmin
              .from('notifications')
              .insert(adminNotifications)
              .select();
            
            if (notifError) {
              console.error('❌ Error creating admin status notifications:', notifError);
            } else {
              console.log(`✅ Created ${notifData?.length || adminNotifications.length} admin status notifications`);
              console.log('✅ Admin notification IDs:', notifData?.map(n => n.id.slice(0, 8)));
            }
          }
        }
      } catch (adminNotifError) {
        console.error('❌ Error in admin status notification process:', adminNotifError);
        // Don't fail the order update if admin notifications fail
      }
    }

    // Update target spending if order completed or paid
    const shouldUpdateTarget = (status === 'selesai' && orderBefore.status !== 'selesai');
    
    if (shouldUpdateTarget) {
      console.log('🎯 Updating target spending for user:', orderBefore.user_id);
      
      try {
        // Calculate total spending from completed orders (paid orders)
        const { data: paidOrders } = await supabaseAdmin
          .from('orders')
          .select('total_amount, payment_status')
          .eq('user_id', orderBefore.user_id)
          .eq('payment_status', 'paid');

        const totalSpending = paidOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

        // Get or create target
        const { data: existingTarget } = await supabaseAdmin
          .from('targets')
          .select('*')
          .eq('user_id', orderBefore.user_id)
          .single();

        if (existingTarget) {
          // Update existing target
          const targetAmount = Number(existingTarget.target_amount);
          const wasActive = existingTarget.status === 'active';
          const newStatus = totalSpending >= targetAmount ? 'achieved' : 'active';

          await supabaseAdmin
            .from('targets')
            .update({
              current_amount: totalSpending,
              status: newStatus,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', orderBefore.user_id);

          console.log('✅ Target spending updated:', totalSpending);

          // Send notification if target just achieved
          if (wasActive && newStatus === 'achieved') {
            await createNotification({
              user_id: orderBefore.user_id,
              title: '🎉 Target Tercapai!',
              message: `Selamat! Anda telah mencapai target belanja sebesar Rp ${targetAmount.toLocaleString('id-ID')}. Cek halaman akun untuk melihat reward Anda!`,
              type: 'target',
              related_id: existingTarget.id
            });
            console.log('✅ Target achievement notification sent');
          }
        } else {
          // Create new target
          const defaultTarget = 10000000; // 10 juta
          const newStatus = totalSpending >= defaultTarget ? 'achieved' : 'active';

          await supabaseAdmin
            .from('targets')
            .insert({
              user_id: orderBefore.user_id,
              target_amount: defaultTarget,
              current_amount: totalSpending,
              status: newStatus
            });

          console.log('✅ New target created with spending:', totalSpending);
        }
      } catch (targetError) {
        console.error('⚠️ Failed to update target spending:', targetError);
        // Don't fail the order update if target update fails
      }
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order: data 
    }, { status: 200 });

  } catch (err) {
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
