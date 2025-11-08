import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET all orders (admin only)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ orders: data || [] }, { status: 200 });

  } catch (err) {
    console.error('Fetch orders error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

