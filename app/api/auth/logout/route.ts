import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create response
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Delete the user_id cookie
    response.cookies.delete('user_id');

    return response;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Logout failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

