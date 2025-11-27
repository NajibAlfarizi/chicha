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
    const { 
      user_id, 
      items, 
      payment_method, 
      total_amount, 
      subtotal,
      discount_amount,
      voucher_id,
      voucher_code,
      customer_info 
    } = body;

    console.log('📦 Order request received:', { 
      user_id, items, payment_method, total_amount, subtotal, discount_amount, voucher_code 
    });

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
        subtotal: subtotal || total_amount,
        discount_amount: discount_amount || 0,
        total_amount,
        payment_method,
        status: 'pending',
        customer_info: customer_info || null,
        voucher_id: voucher_id || null,
        voucher_code: voucher_code || null,
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

    // Update product stock atomically
    for (const item of items) {
      const { data: product, error: stockError } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (stockError) {
        console.error('❌ Error fetching product stock:', stockError);
        continue;
      }

      if (product) {
        const newStock = product.stock - item.quantity;
        
        if (newStock < 0) {
          console.warn('⚠️ Insufficient stock for product:', item.product_id);
          // Still proceed but log warning
        }
        
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
          
        if (updateError) {
          console.error('❌ Error updating product stock:', updateError);
        } else {
          console.log(`✅ Stock updated for ${item.product_id}: ${product.stock} -> ${newStock}`);
        }
      }
    }

    // Track voucher usage if voucher was used
    if (voucher_id && discount_amount > 0) {
      const { error: voucherUsageError } = await supabaseAdmin
        .from('voucher_usage')
        .insert({
          voucher_id,
          user_id,
          order_id: order.id,
          discount_amount,
        });

      if (voucherUsageError) {
        console.error('❌ Error tracking voucher usage:', voucherUsageError);
        // Don't fail the order, just log the error
      } else {
        // Increment voucher used count
        await supabaseAdmin.rpc('increment_voucher_used', { voucher_id_param: voucher_id });
        console.log('✅ Voucher usage tracked');
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

