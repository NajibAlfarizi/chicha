import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { notifyOrderStatusChange } from '@/lib/notification-helper';

// GET single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        user:users(id, name, email, phone),
        order_items:order_items(
          id,
          quantity,
          price,
          product:products(id, name, image_url, description)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ order: data }, { status: 200 });

  } catch (err) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    // Get order with user info before update
    const { data: orderBefore } = await supabaseAdmin
      .from('orders')
      .select('user_id, status')
      .eq('id', id)
      .single();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create notification if status changed
    if (orderBefore && orderBefore.status !== status) {
      await notifyOrderStatusChange(orderBefore.user_id, id, status);
    }

    return NextResponse.json({ 
      message: 'Order status updated successfully',
      order: data 
    }, { status: 200 });

  } catch (err) {
    console.error('Update order error:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
