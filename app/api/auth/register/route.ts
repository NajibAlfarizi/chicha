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

    return NextResponse.json({ 
      message: 'Registration successful',
      user: authData.user 
    }, { status: 201 });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

