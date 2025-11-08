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

    return NextResponse.json({
      teknisi: { ...teknisiData, role: 'teknisi' },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Teknisi login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
