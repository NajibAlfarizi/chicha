/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET - Fetch all chat rooms for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userType = searchParams.get('user_type'); // 'customer', 'admin', 'teknisi'

    if (!userId || !userType) {
      return NextResponse.json({ error: 'user_id and user_type are required' }, { status: 400 });
    }

    // Use admin client to bypass RLS
    let query = supabaseAdmin
      .from('chat_rooms')
      .select(`
        *,
        customer:users!chat_rooms_customer_id_fkey(id, name, email),
        admin:users!chat_rooms_admin_id_fkey(id, name, email),
        teknisi:teknisi(id, name, phone)
      `)
      .order('last_message_at', { ascending: false });

    // Filter based on user type
    if (userType === 'customer') {
      query = query.eq('customer_id', userId);
    } else if (userType === 'admin') {
      // Admins can see all rooms
      // No filter needed
    } else if (userType === 'teknisi') {
      console.log('[Chat API] Filtering rooms for teknisi:', userId);
      query = query.eq('teknisi_id', userId).not('teknisi_id', 'is', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Chat API] Fetch chat rooms error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`[Chat API] Found ${data?.length || 0} rooms for ${userType}:`, userId);
    if (userType === 'teknisi' && data) {
      console.log('[Chat API] Teknisi rooms details:', data.map(r => ({ 
        id: r.id, 
        type: r.type, 
        teknisi_id: r.teknisi_id,
        customer_name: r.customer?.name 
      })));
    }

    // Fetch messages separately for each room to get unread count and last message
    const roomsWithUnread = await Promise.all(data?.map(async (room) => {
      // Use admin client to bypass RLS
      const { data: messages } = await supabaseAdmin
        .from('chat_messages')
        .select('id, message, sender_name, sender_id, created_at, is_read')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const { count: unreadCount } = await supabaseAdmin
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      const lastMessage = messages?.[0];
      
      return {
        ...room,
        unread_count: unreadCount || 0,
        last_message: lastMessage?.message || null,
        last_message_at: lastMessage?.created_at || room.last_message_at,
        last_sender_name: lastMessage?.sender_name || null,
      };
    }) || []);

    return NextResponse.json({ rooms: roomsWithUnread || [] }, { status: 200 });

  } catch (error) {
    console.error('Get chat rooms error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
  }
}

// POST - Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      customer_id, 
      admin_id, 
      teknisi_id, 
      booking_id, 
      order_id, 
      name 
    } = body;

    if (!type || !customer_id) {
      return NextResponse.json(
        { error: 'type and customer_id are required' },
        { status: 400 }
      );
    }

    // Check if room already exists for booking or order
    if (booking_id || order_id) {
      let existingQuery = supabaseAdmin
        .from('chat_rooms')
        .select('*, customer:users!chat_rooms_customer_id_fkey(id, name, email), admin:users!chat_rooms_admin_id_fkey(id, name, email), teknisi:teknisi(id, name, phone)')
        .eq('customer_id', customer_id);

      if (booking_id) existingQuery = existingQuery.eq('booking_id', booking_id);
      if (order_id) existingQuery = existingQuery.eq('order_id', order_id);

      const { data: existing } = await existingQuery.maybeSingle();

      if (existing) {
        console.log('[Chat API] Room already exists:', existing.id);
        return NextResponse.json(
          { room: existing, message: 'Room already exists' },
          { status: 200 }
        );
      }
    }

    console.log('[Chat API] Creating new room:', { type, customer_id, admin_id, teknisi_id, order_id, booking_id });

    // Create new room using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('chat_rooms')
      .insert({
        type,
        customer_id,
        admin_id,
        teknisi_id,
        booking_id,
        order_id,
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Chat`,
      })
      .select(`
        *,
        customer:users!chat_rooms_customer_id_fkey(id, name, email),
        admin:users!chat_rooms_admin_id_fkey(id, name, email),
        teknisi:teknisi(id, name, phone)
      `)
      .single();

    if (error) {
      console.error('[Chat API] Create chat room error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[Chat API] Room created successfully:', {
      id: data.id,
      type: data.type,
      teknisi_id: data.teknisi_id,
      booking_id: data.booking_id,
      order_id: data.order_id
    });

    return NextResponse.json({ 
      room: data,
      message: 'Chat room created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Create chat room error:', error);
    return NextResponse.json({ error: 'Failed to create chat room' }, { status: 500 });
  }
}
