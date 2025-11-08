import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// PUT update target reward (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reward, reward_claimed } = await request.json();

    const updateData: Record<string, unknown> = {};
    if (reward !== undefined) updateData.reward = reward;
    if (reward_claimed !== undefined) updateData.reward_claimed = reward_claimed;

    const { data, error } = await supabase
      .from('targets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Target updated successfully',
      target: data 
    }, { status: 200 });

  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
