import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;

/**
 * Midtrans Notification Handler (Webhook)
 * This endpoint is called by Midtrans when payment status changes
 * Documentation: https://docs.midtrans.com/en/after-payment/http-notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📬 Midtrans notification received:', {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      payment_type: body.payment_type,
      fraud_status: body.fraud_status,
    });

    // Verify signature hash
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    // Create signature hash for verification
    const signatureInput = order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY;
    const calculatedSignature = crypto
      .createHash('sha512')
      .update(signatureInput)
      .digest('hex');

    // Verify signature
    if (calculatedSignature !== signature_key) {
      console.error('❌ Invalid signature hash');
      return NextResponse.json({ 
        error: 'Invalid signature' 
      }, { status: 403 });
    }

    console.log('✅ Signature verified');

    // Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, payment_status, total_amount')
      .eq('midtrans_order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', order_id);
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 });
    }

    console.log('📦 Order found:', order.id);

    // Determine payment status based on transaction status and fraud status
    let newPaymentStatus = order.payment_status;
    let newOrderStatus = undefined;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newPaymentStatus = 'paid';
        newOrderStatus = 'pending'; // Waiting to be processed/shipped
      }
    } else if (transaction_status === 'settlement') {
      newPaymentStatus = 'paid';
      newOrderStatus = 'pending'; // Waiting to be processed/shipped
    } else if (transaction_status === 'pending') {
      newPaymentStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      newPaymentStatus = 'failed';
      newOrderStatus = 'dibatalkan';
    } else if (transaction_status === 'expire') {
      newPaymentStatus = 'expired';
      newOrderStatus = 'dibatalkan';
    }

    console.log('📝 Updating order:', {
      order_id: order.id,
      old_payment_status: order.payment_status,
      new_payment_status: newPaymentStatus,
      new_order_status: newOrderStatus,
    });

    // Update order payment status
    const updateData: {
      payment_status: string;
      status?: string;
      payment_method?: string;
    } = {
      payment_status: newPaymentStatus,
    };

    if (newOrderStatus) {
      updateData.status = newOrderStatus;
    }

    if (payment_type) {
      updateData.payment_method = payment_type;
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order.id);

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update order' 
      }, { status: 500 });
    }

    console.log('✅ Order updated successfully');

    // Update target if payment is successful
    if (newPaymentStatus === 'paid' && order.payment_status !== 'paid') {
      console.log('🎯 Payment successful, updating target spending...');
      
      try {
        // Calculate total spending from paid orders
        const { data: paidOrders } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .eq('user_id', order.user_id)
          .eq('payment_status', 'paid');

        const totalSpending = paidOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

        // Get or create target
        const { data: existingTarget } = await supabaseAdmin
          .from('targets')
          .select('*')
          .eq('user_id', order.user_id)
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
            .eq('user_id', order.user_id);

          console.log('✅ Target updated:', totalSpending);

          // Send notification if target just achieved
          if (wasActive && newStatus === 'achieved') {
            await supabaseAdmin
              .from('notifications')
              .insert({
                user_id: order.user_id,
                title: '🎉 Target Tercapai!',
                message: `Selamat! Anda telah mencapai target belanja sebesar Rp ${targetAmount.toLocaleString('id-ID')}. Cek halaman akun untuk melihat reward Anda!`,
                type: 'target',
                related_id: existingTarget.id
              });
          }
        } else {
          // Create new target
          const defaultTarget = 10000000; // 10 juta
          const newStatus = totalSpending >= defaultTarget ? 'achieved' : 'active';

          await supabaseAdmin
            .from('targets')
            .insert({
              user_id: order.user_id,
              target_amount: defaultTarget,
              current_amount: totalSpending,
              status: newStatus
            });

          console.log('✅ Target created:', totalSpending);
        }
      } catch (targetError) {
        console.error('⚠️ Failed to update target:', targetError);
        // Don't fail the notification if target update fails
      }

      // Send notification to customer about successful payment
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: order.user_id,
          order_id: order.id,
          title: '💰 Pembayaran Berhasil',
          message: `Pembayaran untuk order senilai Rp ${Number(order.total_amount).toLocaleString('id-ID')} telah berhasil. Pesanan Anda akan segera diproses.`,
          type: 'payment',
        });

      console.log('✅ Payment notification sent to customer');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notification processed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Midtrans notification error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
