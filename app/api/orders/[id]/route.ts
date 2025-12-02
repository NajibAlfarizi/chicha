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
      await notifyOrderStatusChange(orderBefore.user_id, id, status);
    }

    // Update target spending if order completed
    if (status === 'selesai' && orderBefore.status !== 'selesai') {
      console.log('🎯 Updating target spending for user:', orderBefore.user_id);
      
      try {
        // Calculate total spending from completed orders
        const { data: completedOrders } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .eq('user_id', orderBefore.user_id)
          .eq('status', 'selesai');

        const totalSpending = completedOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

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
