import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET complaints and reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('complaints')
      .select(`
        *,
        user:users(id, name, email),
        order:orders(id, total_amount, status),
        product:products(id, name, image_url)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ complaints: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new complaint or review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, order_id, product_id, message, rating } = body;

    if (!user_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate rating if provided (for reviews)
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const insertData: {
      user_id: string;
      message: string;
      status: string;
      order_id?: string | null;
      product_id?: string | null;
      rating?: number | null;
    } = {
      user_id,
      message,
      status: 'belum dibaca',
    };

    if (order_id) insertData.order_id = order_id;
    if (product_id) insertData.product_id = product_id;
    if (rating) insertData.rating = rating;

    const { data, error } = await supabase
      .from('complaints')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: product_id ? 'Review submitted successfully' : 'Complaint submitted successfully',
      complaint: data 
    }, { status: 201 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

