import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET user's orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use supabaseAdmin to bypass RLS
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, name, email),
        order_items:order_items(
          id,
          quantity,
          price,
          product:products(id, name, image_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Orders fetched:', data?.length || 0);
    return NextResponse.json({ orders: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new order (checkout)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, items, payment_method, total_amount, customer_info } = body;

    console.log('📦 Order request received:', { user_id, items, payment_method, total_amount, customer_info });

    // Validate input
    if (!user_id || !items || items.length === 0 || !payment_method || !total_amount) {
      console.error('❌ Validation failed:', { user_id, items, payment_method, total_amount });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order (using admin client to bypass RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id,
        total_amount,
        payment_method,
        status: 'pending',
        customer_info: customer_info || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return NextResponse.json({ error: orderError.message }, { status: 400 });
    }

    console.log('✅ Order created:', order.id);

    // Create order items
    const orderItems = items.map((item: { product_id: string; quantity: number; price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    console.log('📦 Inserting order items:', orderItems);

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Order items insertion failed:', itemsError);
      // Rollback order if items insertion fails
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    // Update product stock
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabaseAdmin
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }

    return NextResponse.json({ 
      message: 'Order created successfully',
      order 
    }, { status: 201 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

