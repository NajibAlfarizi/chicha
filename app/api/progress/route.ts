import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET progress for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('service_progress')
      .select('*')
      .eq('booking_id', bookingId)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ progress: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST add new progress update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, description, progress_status } = body;

    if (!booking_id || !description || !progress_status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('service_progress')
      .insert({
        booking_id,
        description,
        progress_status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update booking status if progress indicates completion
    if (progress_status === 'Selesai') {
      await supabase
        .from('bookings')
        .update({ status: 'selesai' })
        .eq('id', booking_id);
    } else if (progress_status === 'Dalam Proses' || progress_status === 'Sedang Dikerjakan') {
      await supabase
        .from('bookings')
        .update({ status: 'proses' })
        .eq('id', booking_id);
    }

    return NextResponse.json({ 
      message: 'Progress added successfully',
      progress: data 
    }, { status: 201 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

