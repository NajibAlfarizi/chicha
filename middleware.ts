import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For now, just allow all requests
  // Auth checking will be done on client-side with localStorage
  // This is a temporary solution - for production, implement proper server-side auth
  
  console.log('Middleware: allowing access to', pathname);
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client/checkout/:path*', '/client/booking/:path*', '/client/progress/:path*', '/client/akun/:path*'],
};
