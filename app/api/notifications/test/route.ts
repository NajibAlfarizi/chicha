import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    console.log('🧪 Test API - User ID:', userId);

    // Test 1: Get all notifications (no filter)
    const { data: allNotifs, error: allError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('📋 All notifications (first 5):', allNotifs);
    console.log('❌ Error fetching all:', allError);

    // Test 2: Get notifications for specific user (if provided)
    let userNotifs = null;
    let userError = null;
    if (userId) {
      const result = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      userNotifs = result.data;
      userError = result.error;
      
      console.log(`📧 User ${userId} notifications:`, userNotifs);
      console.log('❌ Error fetching user notifs:', userError);
    }

    // Test 3: Get unique user_ids in notifications table
    const { data: uniqueUsers, error: uniqueError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .limit(100);

    const userIds = uniqueUsers ? [...new Set(uniqueUsers.map(n => n.user_id))] : [];
    console.log('👥 Unique user_ids in notifications:', userIds);

    return NextResponse.json({
      test_results: {
        total_notifications: allNotifs?.length || 0,
        all_notifications_sample: allNotifs,
        all_notifications_error: allError,
        user_notifications_count: userNotifs?.length || 0,
        user_notifications: userNotifs,
        user_notifications_error: userError,
        unique_user_ids: userIds,
        tested_user_id: userId,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
