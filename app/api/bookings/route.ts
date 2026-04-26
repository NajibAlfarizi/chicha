import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const teknisiId = searchParams.get('teknisi_id');
    const status = searchParams.get('status');

    console.log('=== BOOKINGS GET REQUEST ===');
    console.log('Filters:', { userId, teknisiId, status });

    // Use supabaseAdmin to bypass RLS and get all bookings
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id, user_id, device_name, issue, booking_date, progress_status, 
        customer_name, customer_phone, customer_email, teknisi_id, 
        biaya_perbaikan, status, created_at,
        teknisi:teknisi_id(id, name, phone, specialization)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
      console.log('Filtering by user_id:', userId);
    }

    if (teknisiId) {
      query = query.eq('teknisi_id', teknisiId);
      console.log('Filtering by teknisi_id:', teknisiId);
    }

    if (status) {
      query = query.eq('status', status);
      console.log('Filtering by status:', status);
    }

    const { data, error } = await query;

    console.log('Query result:', { 
      dataCount: data?.length || 0, 
      error: error?.message,
      sample: data?.[0] ? {
        id: data[0].id.slice(0, 8),
        user_id: data[0].user_id,
        progress_status: data[0].progress_status,
        device_name: data[0].device_name,
      } : null
    });

    if (error) {
      console.error('RLS/Query Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ bookings: data || [] }, { status: 200 });

  } catch (_error) {
    console.error('Bookings GET error:', _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, device_name, issue, booking_date, teknisi_id, customer_name, customer_phone, customer_email } = body;

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
      progress_status: string;
      customer_name?: string;
      customer_phone?: string;
      customer_email?: string;
      teknisi_id?: string;
    } = {
      user_id,
      device_name,
      issue,
      booking_date,
      progress_status: 'pending', // Set initial progress status
    };

    // Add customer info if provided (for display purposes)
    if (customer_name) insertData.customer_name = customer_name;
    if (customer_phone) insertData.customer_phone = customer_phone;
    if (customer_email) insertData.customer_email = customer_email;

    // Add teknisi_id only if provided and not empty
    if (teknisi_id && teknisi_id !== '' && teknisi_id !== 'auto') {
      insertData.teknisi_id = teknisi_id;
    }

    console.log('Insert data to be sent:', insertData);

    const { data, error } = await supabase
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

    // Create notification for admin about new booking
    try {
      console.log('🔔 Starting notification creation...');
      
      // Get all admin users
      const { data: adminUsers, error: adminError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, role')
        .eq('role', 'admin');

      console.log('Admin users query result:', {
        count: adminUsers?.length || 0,
        error: adminError?.message,
        adminIds: adminUsers?.map(a => a.id.slice(0, 8)) || []
      });

      if (adminError) {
        console.error('Error fetching admin users:', adminError);
        throw adminError;
      }

      if (adminUsers && adminUsers.length > 0) {
        console.log(`Found ${adminUsers.length} admin(s), creating notifications...`);
        
        // Create notification for each admin
        const notifications = adminUsers.map(admin => ({
          user_id: admin.id,
          title: 'Booking Service Baru',
          message: `${insertData.customer_name || 'Pelanggan'} membuat booking service untuk ${insertData.device_name}`,
          type: 'booking_new',
          booking_id: data.id,
        }));

        console.log('Notifications to insert:', {
          count: notifications.length,
          sample: notifications[0]
        });

        const { data: notifData, error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications)
          .select();
        
        if (notifError) {
          console.error('Error inserting notifications:', notifError);
          throw notifError;
        }

        console.log('✅ Admin notifications created successfully:', {
          count: notifData?.length || notifications.length
        });
      } else {
        console.warn('⚠️ No admin users found to notify');
      }
    } catch (notifError) {
      console.error('❌ Error creating notifications:', notifError);
      // Don't fail the booking if notification fails
    }

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

