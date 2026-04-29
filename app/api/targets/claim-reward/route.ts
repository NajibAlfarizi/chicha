import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { createNotification } from '@/lib/notification-helper';

// POST - Claim reward and reset target
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_id, user_id } = body;

    if (!target_id || !user_id) {
      return NextResponse.json(
        { error: 'target_id and user_id are required' },
        { status: 400 }
      );
    }

    console.log('🎁 Claim reward request:', { target_id, user_id });

    // Get current target
    const { data: target, error: targetError } = await supabaseAdmin
      .from('targets')
      .select('*')
      .eq('id', target_id)
      .eq('user_id', user_id)
      .single();

    if (targetError || !target) {
      console.error('❌ Target not found:', targetError);
      return NextResponse.json(
        { error: 'Target not found' },
        { status: 404 }
      );
    }

    // Check if target is achieved
    if (target.status !== 'achieved') {
      console.error('❌ Target not achieved yet');
      return NextResponse.json(
        { error: 'Target belum tercapai' },
        { status: 400 }
      );
    }

    // Check if reward already claimed
    if (target.reward_claimed) {
      console.error('❌ Reward already claimed');
      return NextResponse.json(
        { error: 'Reward sudah diklaim sebelumnya' },
        { status: 400 }
      );
    }

    // Update target: mark reward as claimed
    const { data: claimedTarget, error: claimError } = await supabaseAdmin
      .from('targets')
      .update({
        reward_claimed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', target_id)
      .select()
      .single();

    if (claimError) {
      console.error('❌ Error marking reward as claimed:', claimError);
      return NextResponse.json(
        { error: claimError.message },
        { status: 400 }
      );
    }

    console.log('✅ Reward claimed, marked reward_claimed = true');

    // Send notification to customer
    try {
      await createNotification({
        user_id,
        title: '✨ Reward Diklaim!',
        message: `Selamat! Reward Anda sudah diklaim: ${target.reward || 'Reward akan diproses'}. Terima kasih telah berbelanja dengan Chicha Mobile!`,
        type: 'target',
        related_id: target_id,
      });
      console.log('✅ Claim confirmation notification sent');
    } catch (notifError) {
      console.error('⚠️ Error sending notification:', notifError);
      // Don't fail the claim if notification fails
    }

    // Reset target for next cycle (asynchronously)
    // Use Promise to run in background without blocking the response
    (async () => {
      try {
        // Wait a bit before resetting to allow UI to update
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 Resetting target for next cycle...');
        const { error: resetError } = await supabaseAdmin
          .from('targets')
          .update({
            status: 'active',
            current_amount: 0,
            reward_claimed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', target_id);

        if (resetError) {
          console.error('❌ Error resetting target:', resetError);
        } else {
          console.log('✅ Target reset successfully');

          // Send notification about new target
          try {
            await createNotification({
              user_id,
              title: '🎯 Target Baru Dimulai!',
              message: `Target belanja baru Anda dimulai! Belanja sebesar Rp ${target.target_amount.toLocaleString('id-ID')} dan dapatkan reward lagi!`,
              type: 'target',
              related_id: target_id,
            });
            console.log('✅ New cycle notification sent');
          } catch (resetNotifError) {
            console.error('⚠️ Error sending reset notification:', resetNotifError);
          }
        }
      } catch (resetError) {
        console.error('❌ Error in reset process:', resetError);
      }
    })();

    return NextResponse.json(
      {
        message: 'Reward claimed successfully',
        target: claimedTarget,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Claim reward error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

