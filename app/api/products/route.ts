import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

// GET all products with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name)
      `)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category_id, price, stock, image_url, description } = body;

    // Validation
    if (!name || !category_id || price === undefined) {
      return NextResponse.json({ 
        error: 'Nama produk, kategori, dan harga wajib diisi' 
      }, { status: 400 });
    }

    console.log('Creating product:', { name, category_id, price, stock, image_url, description });

    // Use supabaseAdmin to bypass RLS for admin operations
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        category_id,
        price: Number(price),
        stock: Number(stock) || 0,
        image_url: image_url || null,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('Product created:', data);
    return NextResponse.json({ product: data }, { status: 201 });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

