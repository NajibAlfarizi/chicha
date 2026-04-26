import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Delete role-identifying cookies
    response.cookies.delete('user');
    response.cookies.delete('teknisi');
    
    // Delete all teknisi/admin auth cookies
    response.cookies.delete('teknisi_id');
    response.cookies.delete('teknisi_session');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Logout failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
