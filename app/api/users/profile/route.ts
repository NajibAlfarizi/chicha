import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

// GET user profile
export async function GET() {
  try {
    // Get user_id from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get profile';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT update user profile
export async function PUT(request: Request) {
  try {
    // Get user_id from cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        email,
        phone,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update profile error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    }, { status: 200 });

  } catch (err) {
    console.error('Profile update error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
