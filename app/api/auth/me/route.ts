import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get user_id from cookie (set during login)
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user profile using admin client (bypass RLS)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userProfile }, { status: 200 });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get user';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

