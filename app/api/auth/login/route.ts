import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Get user profile with role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: userProfile,
      session: data.session,
    }, { status: 200 });

    // Set httpOnly cookie for auth verification
    // Expires in 7 days (same as Supabase default)
    response.cookies.set('user_id', userProfile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

