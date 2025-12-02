import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

// GET dashboard statistics (admin only)
export async function GET() {
  try {
    console.log('📊 Fetching dashboard stats...');

    // Get all orders (use supabaseAdmin to bypass RLS)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, status, payment_status');

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
    }

    console.log('📦 Orders fetched:', orders?.length || 0);

    // Debug: Log all orders with status selesai
    const completedOrdersList = orders?.filter(o => o.status === 'selesai') || [];
    console.log('✅ Completed orders list:', completedOrdersList.map(o => ({
      status: o.status,
      payment_status: o.payment_status,
      amount: o.total_amount
    })));

    // Calculate total sales (from completed orders, regardless of payment_status)
    // Because if order is completed, payment must have been made
    const totalSales = orders
      ?.filter(o => o.status === 'selesai')
      .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
    const completedOrders = completedOrdersList.length;

    console.log('💰 Total sales calculated:', totalSales);
    console.log('⏳ Pending orders:', pendingOrders);
    console.log('✅ Completed orders:', completedOrders);

    // Get total customers
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('role', 'user');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    }

    const totalCustomers = users?.length || 0;
    console.log('👥 Total customers:', totalCustomers);

    // Get targets achieved
    const { data: targets, error: targetsError } = await supabaseAdmin
      .from('targets')
      .select('*')
      .eq('status', 'achieved');

    if (targetsError) {
      console.error('❌ Error fetching targets:', targetsError);
    }

    const achievedTargets = targets?.length || 0;
    console.log('🎯 Achieved targets:', achievedTargets);

    // Get active bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('status');

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError);
    }

    const activeBookings = bookings?.filter(b => b.status !== 'selesai' && b.status !== 'dibatalkan').length || 0;
    console.log('🔧 Active bookings:', activeBookings);

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

    const result = {
      stats: {
        totalSales,
        totalCustomers,
        pendingOrders,
        completedOrders,
        achievedTargets,
        activeBookings,
      },
      charts: {
        ordersByStatus,
        bookingsByStatus,
      }
    };

    console.log('✅ Dashboard stats ready:', result.stats);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
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

