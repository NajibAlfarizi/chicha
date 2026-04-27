import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';

// GET user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📥 Fetching notifications for user:', userId);
    console.log('⏰ Unread only:', unreadOnly);

    // Use admin client to bypass RLS
    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Notifications fetched:', {
      total: data?.length || 0,
      unread: data?.filter(n => !n.is_read).length || 0,
      types: data?.reduce((acc: Record<string, number>, n: any) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
    });

    return NextResponse.json({ notifications: data || [] }, { status: 200 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_id } = body;

    if (!notification_id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    console.log('📝 Marking notification as read:', notification_id);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error marking notification as read:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Notification marked as read');

    return NextResponse.json({ 
      message: 'Notification marked as read',
      notification: data 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('📝 Marking all notifications as read for user:', user_id);

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user_id)
      .eq('is_read', false);

    if (error) {
      console.error('❌ Error marking all notifications as read:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ All notifications marked as read');

    return NextResponse.json({ 
      message: 'All notifications marked as read'
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
