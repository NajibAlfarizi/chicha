import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('service_code');

    if (!code) {
      return NextResponse.json({ error: 'service_code query param is required' }, { status: 400 });
    }

    // Public endpoint: find booking by service_code using admin client to bypass RLS
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('service_code', code)
      .maybeSingle();

    if (bookingError) {
      console.error('Supabase error fetching booking by code:', bookingError);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Fetch user info
    let user = null;
    if (booking.user_id) {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id, name, phone, email')
        .eq('id', booking.user_id)
        .single();
      user = userData;
    }

    // Fetch teknisi info
    let teknisi = null;
    if (booking.teknisi_id) {
      const { data: teknisiData } = await supabaseAdmin
        .from('teknisi')
        .select('id, name, phone, specialization, status')
        .eq('id', booking.teknisi_id)
        .single();
      teknisi = teknisiData;
    }

    // Combine data
    const result = {
      ...booking,
      user,
      teknisi
    };

    return NextResponse.json({ booking: result });
  } catch (err) {
    console.error('Unexpected error in track route:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
