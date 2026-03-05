import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import { notifyAdminsNewBooking, notifyCustomerNewBooking } from '@/lib/notification-helper';

// GET bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const teknisiId = searchParams.get('teknisi_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('bookings')
      .select(`
        *,
        user:users!bookings_user_id_fkey(id, name, email, phone),
        teknisi:teknisi!bookings_teknisi_id_fkey(id, name, phone, specialization)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (teknisiId) {
      query = query.eq('teknisi_id', teknisiId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ bookings: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, device_name, issue, booking_date, customer_name, customer_phone, customer_email } = body;

    if (!user_id || !device_name || !issue || !booking_date) {
      console.log('Missing fields validation failed:', { user_id, device_name, issue, booking_date });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: { user_id: !!user_id, device_name: !!device_name, issue: !!issue, booking_date: !!booking_date }
      }, { status: 400 });
    }

    const insertData: {
      user_id: string;
      device_name: string;
      issue: string;
      booking_date: string;
      status: string;
      customer_name?: string;
      customer_phone?: string;
      customer_email?: string;
    } = {
      user_id,
      device_name,
      issue,
      booking_date,
      status: 'baru',
    };

    // Add customer info if provided (for display purposes)
    if (customer_name) insertData.customer_name = customer_name;
    if (customer_phone) insertData.customer_phone = customer_phone;
    if (customer_email) insertData.customer_email = customer_email;

    // Note: teknisi_id will be assigned by admin later
    // Customers can no longer select teknisi during booking

    console.log('Insert data to be sent:', insertData);

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ 
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 400 });
    }

    console.log('Booking created successfully:', data);

    // =========================================
    // SEND NOTIFICATIONS
    // =========================================

    // Get customer name for notifications
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user_id)
      .single();

    const customerNameForNotif = customer_name || userData?.name || 'Pelanggan';

    // 1. Notify customer about new booking
    await notifyCustomerNewBooking(user_id, data.id, {
      deviceName: device_name,
      bookingDate: booking_date,
      serviceCode: data.service_code,
    });
    console.log('✅ Customer notified about new booking');

    // 2. Notify all admins about new booking
    await notifyAdminsNewBooking(data.id, {
      customerName: customerNameForNotif,
      deviceName: device_name,
      issue: issue,
      serviceCode: data.service_code,
    });
    console.log('✅ Admins notified about new booking');

    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking: data 
    }, { status: 201 });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

