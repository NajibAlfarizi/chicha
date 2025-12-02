import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    console.log('📨 Midtrans notification received:', notification);

    // Get transaction details
    const orderId = notification.order_id; // This is our database order ID
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;

    // Verify signature key for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hashString = `${orderId}${notification.status_code}${grossAmount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    if (signatureKey !== calculatedSignature) {
      console.error('❌ Invalid signature key');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('✅ Signature verified');
    console.log('Transaction notification:', {
      orderId,
      transactionStatus,
      fraudStatus,
      grossAmount,
    });

    let paymentStatus = 'pending';

    // Determine payment status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'paid';
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'failed';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
    }

    console.log(`💳 Payment status: ${paymentStatus}`);

    // Find order by ID (orderId from notification is our database order ID)
    const { data: order, error: findError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(product_id, quantity)')
      .eq('id', orderId)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('📦 Order found:', order.id);

    // Update order payment status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${order.id} payment status updated to: ${paymentStatus}`);

    // If payment failed/expired, rollback stock and cancel order
    if (paymentStatus === 'failed' && order.status !== 'dibatalkan') {
      console.log('🔄 Rolling back stock for failed payment');

      if (order.order_items) {
        for (const item of order.order_items) {
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

            console.log(`✅ Stock rolled back for product ${item.product_id}: +${item.quantity}`);
          }
        }
      }

      // Update order status to cancelled
      await supabaseAdmin
        .from('orders')
        .update({
          status: 'dibatalkan',
          cancel_reason: `Pembayaran ${transactionStatus === 'expire' ? 'expired' : 'gagal'}`,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      console.log('✅ Order cancelled due to failed payment');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment notification processed successfully',
      order_id: order.id,
      payment_status: paymentStatus,
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
