import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    console.log('📨 Midtrans notification received:', notification);

    // Get transaction details
    const midtransOrderId = notification.order_id; // This is the temp order_id from payment/create
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const grossAmount = notification.gross_amount;

    console.log('Transaction notification:', {
      midtransOrderId,
      transactionStatus,
      fraudStatus,
      grossAmount,
    });

    let paymentStatus = 'pending';
    let shouldCreateOrder = false;

    // Determine payment status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        paymentStatus = 'paid';
        shouldCreateOrder = true;
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'paid';
      shouldCreateOrder = true;
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      paymentStatus = 'failed';
      shouldCreateOrder = false; // Don't create order if payment failed
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
      shouldCreateOrder = false; // Wait for settlement
    }

    console.log(`💳 Payment status: ${paymentStatus}, Create order: ${shouldCreateOrder}`);

    // Check if order already exists with this midtrans_order_id
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('midtrans_order_id', midtransOrderId)
      .single();

    if (existingOrder) {
      // Order already created, just update payment status
      console.log('📦 Order already exists, updating status...');
      
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingOrder.id);

      if (error) {
        console.error('❌ Error updating order:', error);
        return NextResponse.json(
          { error: 'Failed to update order' },
          { status: 500 }
        );
      }

      console.log(`✅ Order ${existingOrder.id} updated to ${paymentStatus}`);

      return NextResponse.json({
        success: true,
        message: 'Order updated',
        order_id: existingOrder.id,
      }, { status: 200 });
    }

    // If payment successful and no order exists, create order from session/notification data
    if (shouldCreateOrder) {
      console.log('📦 Creating new order from successful payment...');

      // In real implementation, you would store order data in a temporary table or session
      // For now, we'll create a minimal order - you should enhance this
      
      // Note: This is a simplified version. In production, you should:
      // 1. Store pending order data in database or cache when payment is initiated
      // 2. Retrieve that data here using midtransOrderId as key
      // 3. Create full order with all items and customer info
      
      const { data: newOrder, error: createError } = await supabaseAdmin
        .from('orders')
        .insert({
          midtrans_order_id: midtransOrderId,
          total_amount: parseInt(grossAmount),
          payment_method: 'midtrans',
          payment_status: paymentStatus,
          status: 'pending',
          // Note: You need to store user_id, items, customer_info somewhere
          // This is incomplete - see comment above
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating order:', createError);
        return NextResponse.json(
          { error: 'Failed to create order' },
          { status: 500 }
        );
      }

      console.log(`✅ Order ${newOrder.id} created with payment ${paymentStatus}`);

      return NextResponse.json({
        success: true,
        message: 'Order created',
        order_id: newOrder.id,
      }, { status: 200 });
    }

    // Payment is pending or failed - do nothing
    console.log(`⏳ Payment ${paymentStatus} - no action taken`);

    return NextResponse.json({
      success: true,
      message: 'Notification received',
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
