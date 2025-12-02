import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createNotification } from '@/lib/notification-helper';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// PUT update target reward or target_amount (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reward, reward_claimed, target_amount } = await request.json();

    // Get current target data
    const { data: currentTarget, error: fetchError } = await supabaseAdmin
      .from('targets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    const hadReward = currentTarget.reward;
    
    if (reward !== undefined) updateData.reward = reward;
    if (reward_claimed !== undefined) updateData.reward_claimed = reward_claimed;
    if (target_amount !== undefined) {
      updateData.target_amount = target_amount;
      // Recalculate status based on new target
      const current = Number(currentTarget.current_amount);
      const newTarget = Number(target_amount);
      updateData.status = current >= newTarget ? 'achieved' : 'active';
    }

    const { data, error } = await supabaseAdmin
      .from('targets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send notification if reward was set/updated and target is achieved
    if (reward !== undefined && reward && !hadReward && currentTarget.status === 'achieved') {
      await createNotification({
        user_id: currentTarget.user_id,
        title: '🎁 Reward Tersedia!',
        message: `Reward Anda: ${reward}. Segera klaim reward Anda di halaman akun!`,
        type: 'target',
        related_id: id
      });
    }

    return NextResponse.json({ 
      message: 'Target updated successfully',
      target: data 
    }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
