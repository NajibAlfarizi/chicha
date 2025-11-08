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
    const { data: bookingBefore } = await supabase
      .from('bookings')
      .select('user_id, status')
      .eq('id', id)
      .single();

    const updateData: Record<string, unknown> = {};
    if (teknisi_id !== undefined) updateData.teknisi_id = teknisi_id;
    if (status !== undefined) updateData.status = status;
    if (progress_status !== undefined) {
      updateData.progress_status = progress_status;
      // Auto-set completed_at when status is completed
      if (progress_status === 'completed') {
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

    // Create notification if status changed
    if (bookingBefore && status !== undefined && bookingBefore.status !== status) {
      await notifyBookingStatusChange(bookingBefore.user_id, id, status);
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
