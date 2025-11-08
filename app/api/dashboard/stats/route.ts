import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET dashboard statistics (admin only)
export async function GET() {
  try {
    // Get total sales
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status');

    const totalSales = orders
      ?.filter(o => o.status === 'selesai')
      .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

    // Get total customers
    const { data: users } = await supabase
      .from('users')
      .select('role')
      .eq('role', 'user');

    const totalCustomers = users?.length || 0;

    // Get targets achieved
    const { data: targets } = await supabase
      .from('targets')
      .select('*')
      .eq('status', 'achieved');

    const targetAchieved = targets?.length || 0;

    // Get active bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status');

    const activeBookings = bookings?.filter(b => b.status !== 'selesai').length || 0;

    // Order status breakdown
    const ordersByStatus = {
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      dikirim: orders?.filter(o => o.status === 'dikirim').length || 0,
      selesai: orders?.filter(o => o.status === 'selesai').length || 0,
      dibatalkan: orders?.filter(o => o.status === 'dibatalkan').length || 0,
    };

    // Booking status breakdown
    const bookingsByStatus = {
      baru: bookings?.filter(b => b.status === 'baru').length || 0,
      proses: bookings?.filter(b => b.status === 'proses').length || 0,
      selesai: bookings?.filter(b => b.status === 'selesai').length || 0,
    };

    return NextResponse.json({
      stats: {
        totalSales,
        totalCustomers,
        pendingOrders,
        completedOrders: orders?.filter(o => o.status === 'selesai').length || 0,
        achievedTargets: targetAchieved,
        activeBookings,
      },
      charts: {
        ordersByStatus,
        bookingsByStatus,
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ 
      error: 'Internal server error',
      stats: {
        totalSales: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        achievedTargets: 0,
        activeBookings: 0,
      },
      charts: {
        ordersByStatus: {},
        bookingsByStatus: {},
      }
    }, { status: 500 });
  }
}

