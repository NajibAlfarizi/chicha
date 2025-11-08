import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET all targets (admin only) - for CRM dashboard
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('targets')
      .select(`
        *,
        user:users(id, name, email, phone)
      `)
      .order('current_amount', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ targets: data }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

