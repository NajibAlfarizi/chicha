import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// GET all targets (admin only) - for CRM dashboard
export async function GET() {
  try {
    // Get all customers (role = 'customer')
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, phone')
      .eq('role', 'customer');

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    // Get all existing targets
    const { data: existingTargets, error: targetsError } = await supabaseAdmin
      .from('targets')
      .select('*');

    if (targetsError) {
      return NextResponse.json({ error: targetsError.message }, { status: 400 });
    }

    const existingTargetUserIds = new Set(existingTargets?.map(t => t.user_id) || []);

    // Create targets for users who don't have one yet
    const usersWithoutTargets = users?.filter(u => !existingTargetUserIds.has(u.id)) || [];
    
    if (usersWithoutTargets.length > 0) {
      // For each user without target, calculate their total spending
      for (const user of usersWithoutTargets) {
        const { data: orders } = await supabaseAdmin
          .from('orders')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('status', 'selesai');

        const currentAmount = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
        const targetAmount = 10000000; // Default 10 juta
        const status = currentAmount >= targetAmount ? 'achieved' : 'active';

        await supabaseAdmin
          .from('targets')
          .insert({
            user_id: user.id,
            target_amount: targetAmount,
            current_amount: currentAmount,
            status: status
          });
      }
    }

    // Get all targets with updated data
    const { data: allTargets, error: finalError } = await supabaseAdmin
      .from('targets')
      .select(`
        *,
        user:users(id, name, email, phone)
      `)
      .order('current_amount', { ascending: false });

    if (finalError) {
      return NextResponse.json({ error: finalError.message }, { status: 400 });
    }

    return NextResponse.json({ targets: allTargets }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

