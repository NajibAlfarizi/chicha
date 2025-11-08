'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import {
  Package,
  ShoppingBag,
  Users,
  Wrench,
  Target,
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalSales: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  achievedTargets: number;
  activeBookings: number;
}

interface ChartData {
  ordersByStatus: Record<string, number>;
  bookingsByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    achievedTargets: 0,
    activeBookings: 0,
  });
  const [charts, setCharts] = useState<ChartData>({
    ordersByStatus: {},
    bookingsByStatus: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      
      // Set stats with fallback to default values
      setStats(data.stats || {
        totalSales: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        achievedTargets: 0,
        activeBookings: 0,
      });
      
      // Set charts with fallback to empty objects
      setCharts(data.charts || {
        ordersByStatus: {},
        bookingsByStatus: {},
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty data on error
      setStats({
        totalSales: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        completedOrders: 0,
        achievedTargets: 0,
        activeBookings: 0,
      });
      setCharts({
        ordersByStatus: {},
        bookingsByStatus: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const ordersChartData = charts?.ordersByStatus 
    ? Object.entries(charts.ordersByStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const bookingsChartData = charts?.bookingsByStatus
    ? Object.entries(charts.bookingsByStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500 mb-8">Dashboard Overview</h2>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading dashboard...</div>
        ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <Card className="border-amber-500/30 hover:border-amber-500/50 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                      <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        Rp {stats.totalSales.toLocaleString('id-ID')}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.completedOrders} pesanan selesai
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/30 hover:border-blue-500/50 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                      <p className="text-xs text-muted-foreground mt-1">Terdaftar di sistem</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/30 hover:border-green-500/50 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Target Tercapai</CardTitle>
                      <Target className="h-4 w-4 text-green-600 dark:text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.achievedTargets}</div>
                      <p className="text-xs text-muted-foreground mt-1">Pelanggan loyal</p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/30 hover:border-purple-500/50 transition-all shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Booking Aktif</CardTitle>
                      <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeBookings}</div>
                      <p className="text-xs text-muted-foreground mt-1">Service berlangsung</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-amber-500/20 mb-8 shadow-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Akses cepat ke fitur utama</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/admin/produk">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Package className="mr-2 h-4 w-4" />
                          Kelola Produk
                        </Button>
                      </Link>
                      <Link href="/admin/pesanan">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Lihat Pesanan
                        </Button>
                      </Link>
                      <Link href="/admin/booking">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          <Wrench className="mr-2 h-4 w-4" />
                          Manage Booking
                        </Button>
                      </Link>
                      <Link href="/admin/target">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Target className="mr-2 h-4 w-4" />
                          CRM Target
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                  {/* Orders Chart */}
                  <Card className="border-amber-500/20 shadow-sm">
                    <CardHeader>
                      <CardTitle>Status Pesanan</CardTitle>
                      <CardDescription>Distribusi status pesanan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ordersChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={ordersChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: { name?: string; percent?: number }) => `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {ordersChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Belum ada data pesanan
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Bookings Chart */}
                  <Card className="border-amber-500/20 shadow-sm">
                    <CardHeader>
                      <CardTitle>Status Booking Service</CardTitle>
                      <CardDescription>Distribusi status booking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {bookingsChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={bookingsChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #f59e0b' }}
                              labelStyle={{ color: '#f59e0b' }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill="#f59e0b" name="Jumlah" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Belum ada data booking
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="shadow-sm mt-8">
                  <CardHeader>
                    <CardTitle>Status Sistem</CardTitle>
                    <CardDescription>Ringkasan aktivitas terkini</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <Clock className="h-8 w-8 text-amber-500" />
                        <div className="flex-1">
                          <h4 className="font-semibold">Pesanan Pending</h4>
                          <p className="text-muted-foreground text-sm">{stats.pendingOrders} pesanan menunggu diproses</p>
                        </div>
                        <Link href="/admin/pesanan">
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                            Lihat
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                        <div className="flex-1">
                          <h4 className="font-semibold">Pesanan Selesai</h4>
                          <p className="text-muted-foreground text-sm">{stats.completedOrders} pesanan berhasil diselesaikan</p>
                        </div>
                        <Link href="/admin/pesanan">
                          <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10">
                            Detail
                          </Button>
                        </Link>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <UserCheck className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <h4 className="font-semibold">Pelanggan Tercatat</h4>
                          <p className="text-muted-foreground text-sm">{stats.totalCustomers} user terdaftar dalam sistem</p>
                        </div>
                        <Link href="/admin/user">
                          <Button size="sm" variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10">
                            Kelola
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
      </div>
    </AdminLayout>
  );
}
