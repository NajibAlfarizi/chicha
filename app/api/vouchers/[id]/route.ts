import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET single voucher
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ voucher: data }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update voucher
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // If code is changing, check uniqueness
    if (code) {
      const { data: existing } = await supabaseAdmin
        .from('vouchers')
        .select('id')
        .eq('code', code.toUpperCase())
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Kode voucher sudah digunakan' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (min_purchase !== undefined) updateData.min_purchase = parseFloat(min_purchase);
    if (max_discount !== undefined) updateData.max_discount = max_discount ? parseFloat(max_discount) : null;
    if (quota !== undefined) updateData.quota = parseInt(quota);
    if (valid_from !== undefined) updateData.valid_from = valid_from;
    if (valid_until !== undefined) updateData.valid_until = valid_until;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Voucher berhasil diupdate',
      voucher
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE voucher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if voucher has been used
    const { data: usage } = await supabaseAdmin
      .from('voucher_usage')
      .select('id')
      .eq('voucher_id', id)
      .limit(1);

    if (usage && usage.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus voucher yang sudah pernah digunakan' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('vouchers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Voucher berhasil dihapus'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
