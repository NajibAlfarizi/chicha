import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { notifyBookingStatusChange } from '@/lib/notification-helper';

// GET single booking with progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        user:users!bookings_user_id_fkey(id, name, email, phone),
        teknisi:teknisi!bookings_teknisi_id_fkey(id, name, phone, specialization),
        service_progress:service_progress(
          id,
          description,
          progress_status,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ booking: data }, { status: 200 });

  } catch (err) {
    console.error('Fetch booking error:', err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PUT update booking (assign teknisi, update status, update progress)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('Update booking request:', { id, body });
    
    const { 
      teknisi_id, 
      status, 
      progress_status, 
      progress_notes, 
      estimated_completion 
    } = body;

    // Get booking before update to check user_id and status change
    const { data: bookingBefore } = await supabaseAdmin
      .from('bookings')
      .select('user_id, status, progress_status')
      .eq('id', id)
      .single();

    const updateData: Record<string, unknown> = {};
    if (teknisi_id !== undefined) updateData.teknisi_id = teknisi_id;
    if (status !== undefined) updateData.status = status;
    if (progress_status !== undefined) {
      updateData.progress_status = progress_status;
      // Auto-set completed_at when status is completed
      if (progress_status === 'selesai') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (progress_notes !== undefined) updateData.progress_notes = progress_notes;
    if (estimated_completion !== undefined) updateData.estimated_completion = estimated_completion;

    console.log('Update data to be sent:', updateData);

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message, code: error.code, details: error.details }, { status: 400 });
    }

    // Create notification if progress_status changed
    if (bookingBefore && progress_status !== undefined && bookingBefore.progress_status !== progress_status) {
      await notifyBookingStatusChange(bookingBefore.user_id, id, progress_status);
      console.log('✅ Customer notified about booking status change:', progress_status);
    }

    return NextResponse.json({ 
      message: 'Booking updated successfully',
      booking: data 
    }, { status: 200 });

  } catch (err) {
    console.error('Update booking error:', err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// PATCH assign teknisi to booking (with notifications)
export async function PATCH(
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
      console.error('Booking not found:', bookingError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get teknisi details
    const { data: teknisi, error: teknisiError } = await supabaseAdmin
      .from('teknisi')
      .select('id, name, phone, specialization, email, username')
      .eq('id', teknisi_id)
      .single();

    if (teknisiError || !teknisi) {
      console.error('Teknisi not found:', teknisiError);
      return NextResponse.json({ error: 'Teknisi not found' }, { status: 404 });
    }

    // Get teknisi user_id from users table (teknisi are synced to users with role 'teknisi')
    const teknisiEmail = teknisi.email || `${teknisi.username}@teknisi.local`;
    const { data: teknisiUser, error: teknisiUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', teknisiEmail)
      .eq('role', 'teknisi')
      .single();

    if (teknisiUserError || !teknisiUser) {
      console.error('Teknisi user not found in users table:', teknisiUserError);
      console.log('Trying to find by email:', teknisiEmail);
      // Continue without notification to teknisi if user not found
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

    let teknisiNotified = false;
    let customerNotified = false;

    // 1. Notification to TEKNISI (if user exists in users table)
    if (teknisiUser) {
      const { error: teknisiNotifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: teknisiUser.id,
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
        teknisiNotified = true;
      }
    } else {
      console.log('⚠️ Teknisi user not found in users table, skipping notification');
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
      customerNotified = true;
    }

    return NextResponse.json({
      message: 'Teknisi assigned successfully',
      booking: updatedBooking,
      notifications: {
        teknisi: teknisiNotified,
        customer: customerNotified,
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
