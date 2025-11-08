import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use resetPasswordForEmail - this will automatically send email like signup does
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      console.error('[Reset Password] Error:', error);
      return NextResponse.json(
        { error: 'Gagal mengirim email reset password' },
        { status: 500 }
      );
    }

    console.log('[Reset Password] Email sent successfully to:', email);

    return NextResponse.json(
      { 
        success: true,
        message: 'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau spam folder.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}
