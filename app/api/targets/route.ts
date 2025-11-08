import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET user's target
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('targets')
      .select(`
        *,
        user:users(id, name, email)
      `)
      .eq('user_id', userId)
      .single();

    // If no target found, return null instead of error
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - this is OK, user just doesn't have target yet
        return NextResponse.json({ target: null }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ target: data }, { status: 200 });

  } catch (_error) {
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

    // Check if target exists
    const { data: existing } = await supabase
      .from('targets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // Update existing target
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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

