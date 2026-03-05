import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// POST assign teknisi to booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { teknisi_id } = body;

    if (!teknisi_id) {
      return NextResponse.json({ error: 'teknisi_id is required' }, { status: 400 });
    }

    console.log('Assigning teknisi:', { booking_id: id, teknisi_id });

    // Get booking details including user_id
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        user_id,
        device_name,
        issue,
        booking_date,
        service_code,
        customer_name,
        user:users!bookings_user_id_fkey(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get teknisi details
    const { data: teknisi, error: teknisiError } = await supabaseAdmin
      .from('teknisi')
      .select('id, name, phone, specialization, user_id')
      .eq('id', teknisi_id)
      .single();

    if (teknisiError || !teknisi) {
      return NextResponse.json({ error: 'Teknisi not found' }, { status: 404 });
    }

    // Update booking with teknisi_id
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ teknisi_id })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // =========================================
    // SEND NOTIFICATIONS
    // =========================================

    // 1. Notification to TEKNISI
    const { error: teknisiNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: teknisi.user_id,
        booking_id: booking.id,
        title: 'Service Baru Ditugaskan',
        message: `Anda telah ditugaskan untuk service ${booking.device_name}. Keluhan: ${booking.issue}. Kode Service: ${booking.service_code || 'N/A'}`,
        type: 'booking_assignment',
        is_read: false,
      });

    if (teknisiNotifError) {
      console.error('Error creating teknisi notification:', teknisiNotifError);
    } else {
      console.log('✅ Notification sent to teknisi');
    }

    // 2. Notification to CUSTOMER
    const { error: customerNotifError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: booking.user_id,
        booking_id: booking.id,
        title: 'Teknisi Ditugaskan',
        message: `Teknisi ${teknisi.name} telah ditugaskan untuk service ${booking.device_name} Anda. Teknisi akan segera menghubungi Anda.`,
        type: 'booking_assignment',
        is_read: false,
      });

    if (customerNotifError) {
      console.error('Error creating customer notification:', customerNotifError);
    } else {
      console.log('✅ Notification sent to customer');
    }

    return NextResponse.json({
      message: 'Teknisi assigned successfully',
      booking: updatedBooking,
      notifications: {
        teknisi: !teknisiNotifError,
        customer: !customerNotifError,
      },
    }, { status: 200 });

  } catch (err) {
    console.error('Assign teknisi error:', err);
    return NextResponse.json({ 
      error: 'Failed to assign teknisi',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
