import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

// GET - Get all teknisi (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    if (id) {
      // Single query
      const { data, error } = await supabaseAdmin
        .from('teknisi')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Remove password_hash from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _, ...sanitizedData } = data || {};
      return NextResponse.json({
        teknisi: sanitizedData,
        message: 'Teknisi retrieved successfully',
      });
    }

    // Multiple query
    let query = supabaseAdmin
      .from('teknisi')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Remove password_hash from response
    const sanitizedData = Array.isArray(data)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ? data.map(({ password_hash: _pw, ...rest }) => rest)
      : [];

    return NextResponse.json({
      teknisi: sanitizedData,
      message: 'Teknisi retrieved successfully',
    });
  } catch (error) {
    console.error('GET teknisi error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teknisi' },
      { status: 500 }
    );
  }
}

// POST - Create new teknisi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, password, phone, email, specialization } = body;

    // Validate required fields
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Name, username, and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existing } = await supabaseAdmin
      .from('teknisi')
      .select('username')
      .eq('username', username)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert teknisi
    const { data, error } = await supabaseAdmin
      .from('teknisi')
      .insert({
        name,
        username,
        password_hash,
        phone,
        email,
        specialization,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...sanitizedData } = data;

    return NextResponse.json({
      teknisi: sanitizedData,
      message: 'Teknisi created successfully',
    });
  } catch (error) {
    console.error('POST teknisi error:', error);
    return NextResponse.json(
      { error: 'Failed to create teknisi' },
      { status: 500 }
    );
  }
}

// PUT - Update teknisi
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, email, specialization, status, password } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Teknisi ID is required' },
        { status: 400 }
      );
    }

    interface UpdateData {
      updated_at: string;
      name?: string;
      phone?: string | null;
      email?: string | null;
      specialization?: string | null;
      status?: string;
      password_hash?: string;
    }

    const updateData: UpdateData = {
      updated_at: new Date().toISOString(),
    };

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (status) updateData.status = status;

    // Update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('teknisi')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...sanitizedData } = data;

    return NextResponse.json({
      teknisi: sanitizedData,
      message: 'Teknisi updated successfully',
    });
  } catch (error) {
    console.error('PUT teknisi error:', error);
    return NextResponse.json(
      { error: 'Failed to update teknisi' },
      { status: 500 }
    );
  }
}

// DELETE - Delete teknisi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Teknisi ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('teknisi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      message: 'Teknisi deleted successfully',
    });
  } catch (error) {
    console.error('DELETE teknisi error:', error);
    return NextResponse.json(
      { error: 'Failed to delete teknisi' },
      { status: 500 }
    );
  }
}
