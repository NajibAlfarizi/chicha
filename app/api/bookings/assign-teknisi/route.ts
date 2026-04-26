import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// PATCH - Assign teknisi to a booking
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, teknisi_id } = body;

    if (!booking_id || !teknisi_id) {
      return NextResponse.json(
        { error: 'booking_id and teknisi_id are required' },
        { status: 400 }
      );
    }

    console.log('Assigning teknisi:', { booking_id, teknisi_id });

    // Get booking details for notification
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get teknisi details
    const { data: teknisi } = await supabaseAdmin
      .from('teknisi')
      .select('*')
      .eq('id', teknisi_id)
      .single();

    if (!teknisi) {
      return NextResponse.json(
        { error: 'Teknisi not found' },
        { status: 404 }
      );
    }

    // Update booking with teknisi
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ teknisi_id })
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // Create notification for teknisi
    try {
      // Get teknisi user_id from users table (teknisi table has id, not user_id)
      const { data: teknisiUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('phone', teknisi.phone)
        .single();

      if (teknisiUser) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: teknisiUser.id,
            title: 'Booking Service Ditugaskan',
            message: `Anda ditugaskan untuk service ${booking.device_name} dari ${booking.customer_name || 'Pelanggan'}`,
            type: 'booking_assigned',
            booking_id: booking_id,
          });
      }
    } catch (tekNotifError) {
      console.error('Error creating teknisi notification:', tekNotifError);
    }

    // Create notification for customer
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: booking.user_id,
          title: 'Teknisi Ditugaskan',
          message: `${teknisi.name} telah ditugaskan untuk mengerjakan service Anda`,
          type: 'booking_assigned',
          booking_id: booking_id,
        });
    } catch (custNotifError) {
      console.error('Error creating customer notification:', custNotifError);
    }

    console.log('Teknisi assigned successfully');

    return NextResponse.json({
      message: 'Teknisi assigned successfully',
      booking: updatedBooking,
    }, { status: 200 });

  } catch (error) {
    console.error('Assign teknisi error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
