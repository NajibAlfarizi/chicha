import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('service_code');

    if (!code) {
      return NextResponse.json({ error: 'service_code query param is required' }, { status: 400 });
    }

    // Public endpoint: find booking by service_code and return sanitized fields
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `id, user_id, device_name, issue, notes, booking_date, service_code, teknisi_id, progress_status, progress_notes, estimated_completion, completed_at, created_at, users(id, name, phone, email), teknisi(id, name, phone, specialization, status)`
      )
      .eq('service_code', code)
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching booking by code:', error);
      return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Sanitize response: do not return teknisi.password_hash or other sensitive fields
    if (data.teknisi && 'password_hash' in data.teknisi) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...sanitizedTeknisi } = data.teknisi as Record<string, unknown>;
      (data as Record<string, unknown>).teknisi = sanitizedTeknisi;
    }

    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error('Unexpected error in track route:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
