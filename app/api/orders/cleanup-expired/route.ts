import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// Helper function to check if payment is expired
function isPaymentExpired(order: any): boolean {
  if (!order.payment_expired_at) {
    // Fallback: if no payment_expired_at, check if more than 24 hours since order creation
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }
  
  const expiredAt = new Date(order.payment_expired_at);
  return new Date() > expiredAt;
}

// POST - Cleanup expired orders (admin only)
export async function POST() {
  try {
    console.log('🔍 Starting cleanup of expired orders...');

    // Get all pending orders with pending payment
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`📊 Found ${orders.length} pending orders with pending payment`);

    // Filter expired orders
    const expiredOrders = orders.filter(order => isPaymentExpired(order));

    console.log(`⏰ Found ${expiredOrders.length} expired orders to cancel`);

    if (expiredOrders.length === 0) {
      return NextResponse.json({ 
        message: 'No expired orders found', 
        cancelled: 0,
        details: []
      }, { status: 200 });
    }

    let successCount = 0;
    let failCount = 0;
    const details = [];

    // Process each expired order
    for (const order of expiredOrders) {
      const orderId = order.id.substring(0, 8);
      
      try {
        // Update order status
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'dibatalkan',
            payment_status: 'expired',
            cancel_reason: 'Pembayaran melebihi batas waktu (otomatis dibatalkan sistem)',
            cancelled_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`❌ Failed to update order ${orderId}:`, updateError.message);
          failCount++;
          details.push({
            orderId: orderId,
            status: 'failed',
            error: updateError.message
          });
          continue;
        }

        // Restore product stock
        const { data: orderItems, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error(`⚠️ Failed to fetch order items for ${orderId}:`, itemsError.message);
        } else if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            await supabaseAdmin.rpc('increment_product_stock', {
              product_id: item.product_id,
              qty: item.quantity
            });
          }
          console.log(`✅ Stock restored for order ${orderId}`);
        }

        console.log(`✅ Order ${orderId} cancelled successfully`);
        successCount++;
        details.push({
          orderId: orderId,
          status: 'success',
          createdAt: order.created_at,
          totalAmount: order.total_amount
        });

      } catch (err: any) {
        console.error(`❌ Error processing order ${orderId}:`, err.message);
        failCount++;
        details.push({
          orderId: orderId,
          status: 'failed',
          error: err.message
        });
      }
    }

    console.log(`✅ Cleanup completed: ${successCount} success, ${failCount} failed`);

    return NextResponse.json({
      message: 'Cleanup completed',
      cancelled: successCount,
      failed: failCount,
      total: expiredOrders.length,
      details: details
    }, { status: 200 });

  } catch (err: any) {
    console.error('❌ Cleanup failed:', err);
    return NextResponse.json({ error: 'Cleanup failed', message: err.message }, { status: 500 });
  }
}
