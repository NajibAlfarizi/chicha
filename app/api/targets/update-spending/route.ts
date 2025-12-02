import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// POST update customer spending in targets table
export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Calculate total spending for this user from completed orders
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('user_id', user_id)
      .eq('status', 'selesai');

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 400 });
    }

    const totalSpending = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Check if target exists for this user
    const { data: existingTarget, error: targetError } = await supabaseAdmin
      .from('targets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (targetError && targetError.code !== 'PGRST116') {
      // PGRST116 = not found, which is okay
      return NextResponse.json({ error: targetError.message }, { status: 400 });
    }

    if (existingTarget) {
      // Update existing target
      const targetAmount = Number(existingTarget.target_amount);
      const newStatus = totalSpending >= targetAmount ? 'achieved' : 'active';

      const { error: updateError } = await supabaseAdmin
        .from('targets')
        .update({
          current_amount: totalSpending,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // Create new target
      const defaultTarget = 10000000; // 10 juta
      const newStatus = totalSpending >= defaultTarget ? 'achieved' : 'active';

      const { error: insertError } = await supabaseAdmin
        .from('targets')
        .insert({
          user_id,
          target_amount: defaultTarget,
          current_amount: totalSpending,
          status: newStatus
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      message: 'Target spending updated successfully',
      total_spending: totalSpending 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating target spending:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
