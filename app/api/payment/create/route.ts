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
    const { order_id, gross_amount, customer_details, item_details } = body;

    console.log('Creating Midtrans transaction:', { order_id, gross_amount });

    // Validate required fields
    if (!order_id || !gross_amount || !customer_details || !item_details) {
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
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/client/akun?tab=orders&payment=success`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/client/checkout?payment=error`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/client/akun?tab=orders&payment=pending`,
      },
    };

    console.log('Midtrans parameter:', JSON.stringify(parameter, null, 2));

    // Create transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);
    
    console.log('Midtrans transaction created:', transaction);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
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
