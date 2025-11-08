import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Logout failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

