import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    // Create auth user with role in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'user',
          name,
          phone: phone || null,
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          phone: phone || null,
          role: 'user',
        });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    // Create response with user data
    const response = NextResponse.json({ 
      message: 'Registration successful',
      user: authData.user 
    }, { status: 201 });

    // Set cookies for new user
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    if (authData.user) {
      // Set user_id cookie (httpOnly for security)
      response.cookies.set('user_id', authData.user.id, {
        ...cookieOptions,
        httpOnly: true,
      });

      // Set user cookie with role info (readable by middleware)
      response.cookies.set('user', JSON.stringify({
        id: authData.user.id,
        role: 'user',
        email: authData.user.email,
      }), {
        ...cookieOptions,
        httpOnly: false,
      });
    }

    return response;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

