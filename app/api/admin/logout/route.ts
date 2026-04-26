import { NextResponse } from 'next/server';

// POST - Admin Logout
export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Admin logout successful' }, { status: 200 });

    // Delete all Supabase auth cookies (for admin authentication)
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    // Delete role-identifying cookies
    response.cookies.delete('user');
    response.cookies.delete('teknisi');
    
    // Delete any other session cookies
    response.cookies.delete('teknisi_id');
    response.cookies.delete('teknisi_session');
    response.cookies.delete('admin_id');
    response.cookies.delete('admin');

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
