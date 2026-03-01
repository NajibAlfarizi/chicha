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

// GET all orders (admin only)
export async function GET() {
  try {
    // Use admin client to bypass RLS so admin can see all orders (including cancelled)
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const orders = data || [];
    
    // Auto-cancel expired orders
    const expiredOrders = orders.filter(order => 
      order.status === 'pending' && 
      order.payment_status === 'pending' &&
      isPaymentExpired(order)
    );

    // Update expired orders to 'dibatalkan' status
    if (expiredOrders.length > 0) {
      console.log(`⏰ Auto-cancelling ${expiredOrders.length} expired order(s)...`);
      
      for (const order of expiredOrders) {
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            status: 'dibatalkan',
            payment_status: 'expired',
            cancel_reason: 'Pembayaran melebihi batas waktu (otomatis dibatalkan)',
            cancelled_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Failed to cancel order ${order.id}:`, updateError);
        } else {
          console.log(`✅ Order ${order.id} auto-cancelled due to payment expiry`);
          
          // Restore product stock
          const { data: orderItems } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', order.id);

          if (orderItems) {
            for (const item of orderItems) {
              await supabaseAdmin.rpc('increment_product_stock', {
                product_id: item.product_id,
                qty: item.quantity
              });
            }
            console.log(`✅ Stock restored for order ${order.id}`);
          }
        }
      }

      // Refetch orders after auto-cancelling expired ones
      const { data: updatedData } = await supabaseAdmin
        .from('orders')
        .select(`
          *,
          user:users(id, name, email)
        `)
        .order('created_at', { ascending: false });

      return NextResponse.json({ orders: updatedData || [] }, { status: 200 });
    }

    return NextResponse.json({ orders: orders }, { status: 200 });

  } catch (err) {
    console.error('Fetch orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

