import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user role from cookies
  const userCookie = request.cookies.get('user');
  const teknisiCookie = request.cookies.get('teknisi');
  
  let userRole: string | null = null;
  
  // Check if user is logged in as regular user (client/admin)
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie.value);
      userRole = userData.role;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
    }
  }
  
  // Check if user is logged in as teknisi
  if (teknisiCookie && !userRole) {
    userRole = 'teknisi';
  }
  
  // Strict role-based access control
  // Admin can ONLY access /admin/*
  if (userRole === 'admin') {
    if (!pathname.startsWith('/admin')) {
      // Admin trying to access non-admin routes
      console.log('Middleware: blocking admin from accessing', pathname);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }
  
  // Client can ONLY access /client/*
  if (userRole === 'client' || userRole === 'user') {
    if (!pathname.startsWith('/client')) {
      // Client trying to access non-client routes
      console.log('Middleware: blocking client from accessing', pathname);
      return NextResponse.redirect(new URL('/client/produk', request.url));
    }
  }
  
  // Teknisi can ONLY access /teknisi/*
  if (userRole === 'teknisi') {
    if (!pathname.startsWith('/teknisi')) {
      // Teknisi trying to access non-teknisi routes
      console.log('Middleware: blocking teknisi from accessing', pathname);
      return NextResponse.redirect(new URL('/teknisi/dashboard', request.url));
    }
  }
  
  // Check authentication for protected routes
  if (pathname.startsWith('/admin')) {
    // Admin routes - only admin can access
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
  } else if (pathname.startsWith('/client/checkout') || 
             pathname.startsWith('/client/booking') || 
             pathname.startsWith('/client/progress') ||
             pathname.startsWith('/client/akun') ||
             pathname.startsWith('/client/chat')) {
    // Protected client routes - only authenticated clients can access
    if (userRole !== 'client' && userRole !== 'user') {
      return NextResponse.redirect(new URL('/auth/login?redirect=' + pathname, request.url));
    }
  } else if (pathname.startsWith('/teknisi') && pathname !== '/teknisi/login') {
    // Teknisi routes - only teknisi can access
    if (userRole !== 'teknisi') {
      return NextResponse.redirect(new URL('/teknisi/login?redirect=' + pathname, request.url));
    }
  }
  
  console.log('Middleware: allowing access to', pathname, 'for role:', userRole || 'guest');
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/teknisi/:path*'
  ],
};
