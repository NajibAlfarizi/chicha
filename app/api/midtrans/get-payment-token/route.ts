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

    // Get transaction status from Midtrans
    const statusResponse = await fetch(
      `${MIDTRANS_APP_URL.replace('/snap/v1', '/v2')}/${order_id}/status`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64'),
        },
      }
    );

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('❌ Midtrans status error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to get transaction status',
        details: errorText 
      }, { status: 500 });
    }

    const statusData = await statusResponse.json();
    console.log('📊 Transaction status:', statusData);

    // If payment is already success or settlement, redirect to success
    if (statusData.transaction_status === 'settlement' || statusData.transaction_status === 'capture') {
      return NextResponse.json({ 
        redirect: true,
        redirect_url: '/client/checkout/success',
        status: statusData.transaction_status
      }, { status: 200 });
    }

    // Get the snap token (it should be in the transaction data)
    // For pending transactions, we need to get the order from our database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('midtrans_order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // For sandbox/testing, we can use the redirect_url from Midtrans status
    // In production, you might need to store the snap_token in your database
    if (statusData.redirect_url) {
      return NextResponse.json({ 
        token: statusData.redirect_url.split('?')[0].split('/').pop(),
        redirect_url: statusData.redirect_url
      }, { status: 200 });
    }

    // If no redirect_url, return error
    return NextResponse.json({ 
      error: 'Payment token not available. Please create a new order.' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Get payment token error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
