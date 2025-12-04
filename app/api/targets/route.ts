import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET user's target
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    console.log('[API Targets] GET request for user_id:', userId);

    if (!userId) {
      console.log('[API Targets] Error: User ID is required');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('targets')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    // If error (not just no rows), return error
    if (error) {
      console.log('[API Targets] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If no data, user doesn't have target yet (will auto-create on first paid order)
    if (!data) {
      console.log('[API Targets] No target found for user - will auto-create on first paid order');
      return NextResponse.json({ target: null }, { status: 200 });
    }

    console.log('[API Targets] Target found:', data?.id);
    return NextResponse.json({ target: data }, { status: 200 });

  } catch (error) {
    console.error('[API Targets] Internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create or update target
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, target_amount } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if target exists (use supabaseAdmin to bypass RLS)
    const { data: existing } = await supabaseAdmin
      .from('targets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Update existing target
      const { data, error } = await supabaseAdmin
        .from('targets')
        .update({ target_amount: target_amount || existing.target_amount })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ target: data }, { status: 200 });
    } else {
      // Create new target
      const { data, error } = await supabaseAdmin
        .from('targets')
        .insert({
          user_id,
          target_amount: target_amount || 10000000,
          current_amount: 0,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ target: data }, { status: 201 });
    }

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

