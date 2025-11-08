import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET - Fetch all messages in a room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('[Chat API] Fetching messages for room:', roomId);

    // Use admin client to bypass RLS for reading messages
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Chat API] Fetch messages error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[Chat API] Fetched messages:', data?.length || 0);

    return NextResponse.json({ messages: data || [] }, { status: 200 });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a message to a room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { 
      sender_type, 
      sender_id, 
      sender_name, 
      message, 
      message_type = 'text',
      attachment_url 
    } = body;

    if (!sender_type || !sender_id || !sender_name || !message) {
      return NextResponse.json(
        { error: 'sender_type, sender_id, sender_name, and message are required' },
        { status: 400 }
      );
    }

    console.log('[Chat API] Sending message:', { roomId, sender_type, sender_id, sender_name, message: message.substring(0, 50) });

    // Insert message using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_type,
        sender_id,
        sender_name,
        message,
        message_type,
        attachment_url,
      })
      .select()
      .single();

    if (error) {
      console.error('[Chat API] Send message error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('[Chat API] Message sent successfully:', data.id);

    // Update chat room's last_message_at
    const { error: updateError } = await supabaseAdmin
      .from('chat_rooms')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', roomId);

    if (updateError) {
      console.error('[Chat API] Failed to update last_message_at:', updateError);
    }

    return NextResponse.json({ 
      message: data,
      success: 'Message sent successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PUT - Mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Mark all messages in room as read (except sender's own messages) using admin client
    const { error } = await supabaseAdmin
      .from('chat_messages')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark messages as read error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Messages marked as read' 
    }, { status: 200 });

  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
