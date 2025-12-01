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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500 bg-clip-text text-transparent">
              Dashboard Overview
            </h2>
            <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
          <Button className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            <p className="mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards with Modern Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-none shadow-lg bg-linear-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">Total Penjualan</CardTitle>
                  <DollarSign className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">
                    Rp {stats.totalSales.toLocaleString('id-ID')}
                  </div>
                  <p className="text-xs text-white/80 mt-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stats.completedOrders} pesanan selesai
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-linear-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">Total Pelanggan</CardTitle>
                  <Users className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                  <p className="text-xs text-white/80 mt-2">Terdaftar di sistem</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-linear-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">Target Tercapai</CardTitle>
                  <Target className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{stats.achievedTargets}</div>
                  <p className="text-xs text-white/80 mt-2">Pelanggan loyal</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-linear-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">Booking Aktif</CardTitle>
                  <Wrench className="h-5 w-5 text-white/80" />
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold">{stats.activeBookings}</div>
                  <p className="text-xs text-white/80 mt-2">Service berlangsung</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions with Better Design */}
            <Card className="border-amber-200/50 dark:border-amber-900/30 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">⚡ Quick Actions</CardTitle>
                <CardDescription>Akses cepat ke fitur utama sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Link href="/admin/produk">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <Package className="h-6 w-6" />
                      <span className="text-sm font-semibold">Kelola Produk</span>
                    </Button>
                  </Link>
                  <Link href="/admin/pesanan">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-linear-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <ShoppingBag className="h-6 w-6" />
                      <span className="text-sm font-semibold">Lihat Pesanan</span>
                    </Button>
                  </Link>
                  <Link href="/admin/booking">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <Wrench className="h-6 w-6" />
                      <span className="text-sm font-semibold">Booking Service</span>
                    </Button>
                  </Link>
                  <Link href="/admin/target">
                    <Button className="w-full h-20 flex flex-col gap-2 bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                      <Target className="h-6 w-6" />
                      <span className="text-sm font-semibold">CRM Target</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Charts with Better Styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Chart */}
              <Card className="border-amber-200/50 dark:border-amber-900/30 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                    Status Pesanan
                  </CardTitle>
                  <CardDescription>Distribusi status pesanan saat ini</CardDescription>
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
                          outerRadius={90}
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
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-4 opacity-30" />
                      <p>Belum ada data pesanan</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bookings Chart */}
              <Card className="border-amber-200/50 dark:border-amber-900/30 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    Status Booking Service
                  </CardTitle>
                  <CardDescription>Distribusi status booking service</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="url(#colorGradient)" name="Jumlah" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                      <Wrench className="h-12 w-12 mb-4 opacity-30" />
                      <p>Belum ada data booking</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity with Modern Cards */}
            <Card className="border-amber-200/50 dark:border-amber-900/30 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl">📊 Status Sistem</CardTitle>
                <CardDescription>Ringkasan aktivitas dan status terkini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="group p-5 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/50 dark:border-amber-900/30 hover:shadow-lg transition-all hover:scale-105">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500 rounded-lg text-white">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Pesanan Pending</h4>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{stats.pendingOrders}</p>
                        <p className="text-sm text-muted-foreground">Menunggu diproses</p>
                        <Link href="/admin/pesanan">
                          <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white w-full">
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="group p-5 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/50 dark:border-green-900/30 hover:shadow-lg transition-all hover:scale-105">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-500 rounded-lg text-white">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Pesanan Selesai</h4>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.completedOrders}</p>
                        <p className="text-sm text-muted-foreground">Berhasil diselesaikan</p>
                        <Link href="/admin/pesanan">
                          <Button size="sm" variant="outline" className="mt-3 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 w-full">
                            Lihat Detail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="group p-5 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200/50 dark:border-blue-900/30 hover:shadow-lg transition-all hover:scale-105">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500 rounded-lg text-white">
                        <UserCheck className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Total Pelanggan</h4>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stats.totalCustomers}</p>
                        <p className="text-sm text-muted-foreground">Terdaftar di sistem</p>
                        <Link href="/admin/user">
                          <Button size="sm" variant="outline" className="mt-3 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 w-full">
                            Kelola User
                          </Button>
                        </Link>
                      </div>
                    </div>
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
