import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_APP_URL = process.env.NEXT_PUBLIC_MIDTRANS_APP_URL || 'https://app.sandbox.midtrans.com/snap/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.log('🔍 Getting payment token for order:', order_id);

    // First, try to get the order from our database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        midtrans_order_id,
        snap_token,
        total_amount,
        customer_info,
        order_items:order_items(
          quantity,
          price,
          product:products(id, name)
        )
      `)
      .eq('midtrans_order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found in database:', {
        midtrans_order_id: order_id,
        error: orderError
      });
      return NextResponse.json({ 
        error: 'Order not found',
        details: 'Order dengan ID Midtrans ini tidak ditemukan di database'
      }, { status: 404 });
    }

    console.log('✅ Order found:', {
      order_id: order.id,
      midtrans_order_id: order.midtrans_order_id,
      has_snap_token: !!order.snap_token,
      total_amount: order.total_amount
    });

    // Return stored snap_token if available
    if (order.snap_token) {
      console.log('✅ Snap token retrieved from database');
      return NextResponse.json({ 
        token: order.snap_token
      }, { status: 200 });
    }

    // If no snap_token stored, create new transaction with Midtrans
    console.log('⚠️ No snap_token found, creating new Midtrans transaction...');
    
    try {
      // Import midtrans client
      const midtransClient = require('midtrans-client');
      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
        serverKey: MIDTRANS_SERVER_KEY,
      });

      // Prepare item details from order
      const itemDetails = order.order_items?.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })) || [];

      const parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: order.total_amount,
        },
        customer_details: {
          first_name: order.customer_info?.name || order.customer_info?.recipient_name || 'Customer',
          email: order.customer_info?.email || order.customer_info?.recipient_email || '',
          phone: order.customer_info?.phone || order.customer_info?.recipient_phone || '',
        },
        item_details: itemDetails,
      };

      const transaction = await snap.createTransaction(parameter);
      console.log('✅ New Midtrans transaction created');

      // Save snap_token to database
      await supabaseAdmin
        .from('orders')
        .update({ snap_token: transaction.token })
        .eq('id', order.id);

      console.log('✅ Snap token saved to database');

      return NextResponse.json({ 
        token: transaction.token
      }, { status: 200 });

    } catch (midtransError) {
      console.error('❌ Failed to create new Midtrans transaction:', midtransError);
      return NextResponse.json({ 
        error: 'Failed to create payment token. Please create a new order.',
        details: midtransError instanceof Error ? midtransError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Get payment token error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
