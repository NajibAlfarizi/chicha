import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    // Delete all teknisi auth cookies
    response.cookies.delete('teknisi_id');
    response.cookies.delete('teknisi');

    return response;

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Logout failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
