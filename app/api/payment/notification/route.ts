import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    
    console.log('Midtrans notification received:', notification);

    // Get transaction status directly from notification
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log('Transaction notification:', {
      orderId,
      transactionStatus,
      fraudStatus,
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

    // Update order status in database
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`Order ${orderId} updated to ${paymentStatus}`);

    return NextResponse.json({
      success: true,
      message: 'Notification processed',
    }, { status: 200 });

  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
