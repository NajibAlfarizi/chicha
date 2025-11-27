import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

// POST validate and calculate discount for a voucher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { error: 'Kode voucher dan subtotal harus diisi' },
        { status: 400 }
      );
    }

    // Get user_id from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'User tidak terautentikasi' },
        { status: 401 }
      );
    }

    // Fetch voucher
    const { data: voucher, error } = await supabaseAdmin
      .from('vouchers')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !voucher) {
      return NextResponse.json(
        { error: 'Kode voucher tidak valid' },
        { status: 404 }
      );
    }

    // Validation checks
    const now = new Date();
    const validFrom = new Date(voucher.valid_from);
    const validUntil = new Date(voucher.valid_until);

    // Check if active
    if (!voucher.is_active) {
      return NextResponse.json(
        { error: 'Voucher tidak aktif' },
        { status: 400 }
      );
    }

    // Check valid period
    if (now < validFrom) {
      return NextResponse.json(
        { error: 'Voucher belum dapat digunakan' },
        { status: 400 }
      );
    }

    if (now > validUntil) {
      return NextResponse.json(
        { error: 'Voucher sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Check quota
    if (voucher.used >= voucher.quota) {
      return NextResponse.json(
        { error: 'Kuota voucher sudah habis' },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (subtotal < voucher.min_purchase) {
      return NextResponse.json(
        { 
          error: `Minimum pembelian Rp ${voucher.min_purchase.toLocaleString('id-ID')} untuk menggunakan voucher ini` 
        },
        { status: 400 }
      );
    }

    // Check if user already used this voucher
    const { data: usageCheck } = await supabaseAdmin
      .from('voucher_usage')
      .select('id')
      .eq('voucher_id', voucher.id)
      .eq('user_id', userId);

    if (usageCheck && usageCheck.length > 0) {
      return NextResponse.json(
        { error: 'Anda sudah pernah menggunakan voucher ini' },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;

    if (voucher.type === 'percentage') {
      discountAmount = (subtotal * voucher.value) / 100;
      
      // Apply max discount if set
      if (voucher.max_discount && discountAmount > voucher.max_discount) {
        discountAmount = voucher.max_discount;
      }
    } else if (voucher.type === 'fixed') {
      discountAmount = voucher.value;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const finalAmount = subtotal - discountAmount;

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        type: voucher.type,
        value: voucher.value,
      },
      discount: discountAmount,
      final_amount: finalAmount,
      message: `Voucher berhasil diaplikasikan! Hemat Rp ${discountAmount.toLocaleString('id-ID')}`
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Voucher validation error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memvalidasi voucher' },
      { status: 500 }
    );
  }
}
