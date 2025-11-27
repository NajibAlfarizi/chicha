import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET all vouchers (admin - all, user - active only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    let query = supabaseAdmin
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    // If not admin, only show active vouchers within valid period
    if (!isAdmin) {
      const now = new Date().toISOString();
      query = query
        .eq('is_active', true)
        .lte('valid_from', now)
        .gte('valid_until', now);  // valid_until must be >= now (not expired yet)
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching vouchers:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ vouchers: data || [] }, { status: 200 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new voucher (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      value,
      min_purchase,
      max_discount,
      quota,
      valid_from,
      valid_until,
      is_active
    } = body;

    // Validation
    if (!code || !name || !type || !value || !quota || !valid_from || !valid_until) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate voucher code uniqueness
    const { data: existing } = await supabaseAdmin
      .from('vouchers')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Kode voucher sudah digunakan' },
        { status: 400 }
      );
    }

    // Create voucher
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .insert({
        code: code.toUpperCase(),
        name,
        description,
        type,
        value: parseFloat(value),
        min_purchase: parseFloat(min_purchase) || 0,
        max_discount: max_discount ? parseFloat(max_discount) : null,
        quota: parseInt(quota),
        used: 0,
        valid_from,
        valid_until,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating voucher:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Voucher berhasil dibuat',
      voucher
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
