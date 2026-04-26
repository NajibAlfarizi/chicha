import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

/**
 * Midtrans Notification Handler (Webhook)
 * Called by Midtrans when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📬 Midtrans notification received:', {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      payment_type: body.payment_type,
    });

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Verify signature
    const signatureInput = order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(signatureInput)
      .digest('hex');

    if (calculatedSignature !== signature_key) {
      console.error('❌ Invalid signature hash');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    console.log('✅ Signature verified');

    // Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, payment_status, status, total_amount')
      .eq('midtrans_order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', order_id);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('📦 Order found:', order.id);

    // Determine payment status
    let newPaymentStatus = order.payment_status;
    let newOrderStatus = undefined;

    console.log('🔍 Transaction status:', transaction_status, 'Fraud status:', fraud_status);

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        console.log('✅ Payment successful - setting to paid');
        newPaymentStatus = 'paid';
        newOrderStatus = 'pending'; // Waiting to be processed
      } else {
        console.log('⚠️ Fraud detected - not updating to paid');
      }
    } else if (transaction_status === 'pending') {
      console.log('⏳ Payment still pending');
      newPaymentStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      console.log('❌ Payment failed/denied - setting to failed');
      newPaymentStatus = 'failed';
      newOrderStatus = 'dibatalkan';
    } else {
      console.log('⚠️ Unknown transaction status:', transaction_status);
    }

    // Only update if status actually changed
    const statusChanged = newPaymentStatus !== order.payment_status || newOrderStatus !== undefined;
    
    if (!statusChanged) {
      console.log('ℹ️ No status change needed');
      return NextResponse.json({ 
        success: true,
        message: 'No status change needed' 
      }, { status: 200 });
    }

    console.log('📝 Updating order:', {
      database_id: order.id,
      midtrans_order_id: order_id,
      old_payment_status: order.payment_status,
      new_payment_status: newPaymentStatus,
      old_status: order.status,
      new_status: newOrderStatus,
    });

    // Update order
    const updateData: any = {
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    };
    if (newOrderStatus) {
      updateData.status = newOrderStatus;
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order.id)
      .select();

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
      return NextResponse.json({ error: 'Failed to update order', details: updateError }, { status: 500 });
    }

    console.log('✅ Order updated successfully:', {
      id: updatedOrder?.[0]?.id,
      payment_status: updatedOrder?.[0]?.payment_status,
      status: updatedOrder?.[0]?.status,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Notification processed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
