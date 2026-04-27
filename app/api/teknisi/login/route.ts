import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

// POST - Teknisi & Admin Login (unified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('=== LOGIN API ===');
    console.log('Username received:', username);
    console.log('Password received:', password ? '***' : 'empty');

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if input looks like email
    const isEmail = username.includes('@');
    console.log('Is email?', isEmail);

    if (isEmail) {
      console.log('Processing as ADMIN email login...');
      // Try to authenticate as admin using Supabase auth via email
      try {
        const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
          email: username,
          password: password,
        });

        if (authError || !authData.user) {
          console.log('Supabase auth error:', authError?.message);
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        console.log('Supabase auth successful for user:', authData.user.id);

        // Get admin user data from users table
        const { data: admin, error: adminError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .eq('role', 'admin')
          .single();

        console.log('Admin user query result:', { admin, adminError });

        if (adminError || !admin) {
          console.log('Admin not found or error:', adminError?.message);
          return NextResponse.json(
            { error: 'User does not have admin access' },
            { status: 403 }
          );
        }

        // Create response with admin data
        const adminData = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        };
        
        console.log('Returning admin login response:', adminData);
        
        const response = NextResponse.json({
          user: adminData,
          message: 'Login successful',
        });

        // Set auth session cookies
        if (authData.session) {
          response.cookies.set('sb-access-token', authData.session.access_token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
            httpOnly: true,
          });

          response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
            httpOnly: true,
          });
        }

        // Set a 'user' cookie with admin role for middleware to read
        response.cookies.set('user', JSON.stringify({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: 'admin',
        }), {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          httpOnly: false,
        });

        // Clear teknisi cookie if exists (user switching from teknisi to admin)
        response.cookies.set('teknisi_session', '', {
          maxAge: 0,
          path: '/',
        });

        return response;
      } catch (err) {
        console.error('Email login error:', err);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    } else {
      console.log('Processing as TEKNISI username login...');
      // Try to authenticate as teknisi using username (bcrypt)
      const { data: teknisi, error: tekError } = await supabaseAdmin
        .from('teknisi')
        .select('*')
        .eq('username', username)
        .single();

      console.log('Teknisi query result:', { teknisi, tekError });

      if (tekError || !teknisi) {
        console.log('Teknisi not found or error:', tekError?.message);
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Check if teknisi is active
      if (teknisi.status !== 'active') {
        console.log('Teknisi account not active:', teknisi.status);
        return NextResponse.json(
          { error: 'Account is inactive. Contact administrator.' },
          { status: 403 }
        );
      }

      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, teknisi.password_hash);
      console.log('Password valid?', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Password mismatch');
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        );
      }

      // Create response with teknisi data - explicitly set role as 'teknisi'
      const userData = {
        id: teknisi.id,
        name: teknisi.name,
        username: teknisi.username,
        phone: teknisi.phone,
        email: teknisi.email,
        status: teknisi.status,
        role: 'teknisi', // ALWAYS teknisi for teknisi login
      };
      
      console.log('Returning teknisi login response:', userData);
      
      const response = NextResponse.json({
        user: userData,
        message: 'Login successful',
      });

      // Set cookies for auth verification
      const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      };

      response.cookies.set('teknisi_id', teknisi.id, {
        ...cookieOptions,
        httpOnly: true,
      });

      response.cookies.set('teknisi_session', JSON.stringify({
        id: teknisi.id,
        name: teknisi.name,
        username: teknisi.username,
        role: 'teknisi',
      }), {
        ...cookieOptions,
        httpOnly: false,
      });

      // Set a simple 'teknisi' cookie with role for middleware to read
      response.cookies.set('teknisi', JSON.stringify({
        role: 'teknisi',
      }), {
        ...cookieOptions,
        httpOnly: false,
      });

      // Clear admin cookies if exists (user switching from admin to teknisi)
      response.cookies.set('user', '', {
        maxAge: 0,
        path: '/',
      });
      response.cookies.set('sb-access-token', '', {
        maxAge: 0,
        path: '/',
      });
      response.cookies.set('sb-refresh-token', '', {
        maxAge: 0,
        path: '/',
      });

      return response;
    }
  } catch (error) {
    console.error('=== LOGIN API ERROR ===', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
