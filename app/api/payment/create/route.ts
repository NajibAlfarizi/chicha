import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';

// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gross_amount, customer_details, item_details, order_id: dbOrderId } = body;

    // Use database order_id if provided, otherwise generate new one
    const order_id = dbOrderId || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating Midtrans transaction:', { order_id, gross_amount, using_db_order: !!dbOrderId });

    // Validate required fields
    if (!gross_amount || !customer_details || !item_details) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transaction parameter
    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount,
      },
      customer_details: {
        first_name: customer_details.name || '',
        email: customer_details.email || '',
        phone: customer_details.phone || '',
      },
      item_details: item_details,
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://chicha-mobile.me'}/client/checkout/success?order_id=${order_id}`,
      },
    };

    console.log('Midtrans parameter:', JSON.stringify(parameter, null, 2));
    
    // Log voucher discount if present
    const voucherItem = item_details.find((item: { id: string; price: number }) => item.id === 'VOUCHER-DISCOUNT');
    if (voucherItem) {
      console.log('🎫 Voucher discount applied:', {
        discount_amount: Math.abs(voucherItem.price),
        final_amount: gross_amount,
      });
    }

    // Create transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    console.log('Midtrans transaction created:', transaction);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: order_id, // Return order_id for reference
    }, { status: 200 });

  } catch (error) {
    console.error('Midtrans error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
