import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

// POST - Teknisi Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find teknisi by username
    const { data: teknisi, error } = await supabaseAdmin
      .from('teknisi')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !teknisi) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if teknisi is active
    if (teknisi.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive. Contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, teknisi.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...teknisiData } = teknisi;

    // Create response with teknisi data
    const response = NextResponse.json({
      teknisi: { ...teknisiData, role: 'teknisi' },
      message: 'Login successful',
    });

    // Set cookies for auth verification
    const cookieOptions = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    // Set teknisi_id cookie (httpOnly for security)
    response.cookies.set('teknisi_id', teknisi.id, {
      ...cookieOptions,
      httpOnly: true,
    });

    // Set teknisi cookie with role info (readable by middleware)
    response.cookies.set('teknisi', JSON.stringify({
      id: teknisi.id,
      name: teknisi.name,
      username: teknisi.username,
      role: 'teknisi',
    }), {
      ...cookieOptions,
      httpOnly: false, // Middleware needs to read this
    });

    return response;
  } catch (error) {
    console.error('Teknisi login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
