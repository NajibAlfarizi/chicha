/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  ShoppingBag, 
  Wrench, 
  Target, 
  Trophy,
  Eye,
  MessageSquare,
  Gift,
  Save,
  LogOut,
  Lock
} from 'lucide-react';
import { Order, Booking, Target as TargetType } from '@/lib/types';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { useChatRooms } from '@/lib/useChat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const { createRoom } = useChatRooms(user?.id, 'customer');
  const defaultTab = searchParams?.get('tab') || 'profile';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [target, setTarget] = useState<TargetType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingTrack, setShowBookingTrack] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get user from localStorage first
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          return;
        }

        const user = JSON.parse(userStr);
        
        // Fetch profile from API
        const profileRes = await fetch('/api/users/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
          setFormData({
            name: profileData.profile.name || '',
            email: profileData.profile.email || '',
            phone: profileData.profile.phone || '',
            address: profileData.profile.address || '',
          });
        }

        // Fetch orders
        const ordersRes = await fetch(`/api/orders?user_id=${user.id}`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }

        // Fetch bookings
        const bookingsRes = await fetch(`/api/bookings?user_id=${user.id}`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        // Fetch target
        const targetRes = await fetch(`/api/targets?user_id=${user.id}`);
        if (targetRes.ok) {
          const targetData = await targetRes.json();
          if (targetData.target) {
            setTarget(targetData.target);
          }
        } else {
          // No target yet, that's OK
          console.log('No target found for user');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Gagal memuat data', {
          description: 'Terjadi kesalahan saat memuat data akun',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, authLoading]);

  // Show unauthenticated message if not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Anda Belum Login
                </h2>
                <p className="text-gray-600 mb-8">
                  Silakan login atau daftar untuk mengakses halaman akun Anda
                </p>
                <div className="space-y-3">
                  <Link href="/auth/login">
                    <Button className="w-full" size="lg">
                      Login Sekarang
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" className="w-full" size="lg">
                      Daftar Akun Baru
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditMode(false);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.profile));
        
        toast.success('Profil berhasil diperbarui!', {
          description: 'Data profil Anda telah disimpan',
        });
      } else {
        const error = await response.json();
        toast.error('Gagal menyimpan profil', {
          description: error.error || 'Terjadi kesalahan',
        });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Gagal menyimpan profil', {
        description: 'Periksa koneksi internet Anda',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleChatOrder = async (order: Order) => {
    if (!user) return;

    try {
      toast.loading('Membuka chat...', { id: 'chat-loading' });
      
      const room = await createRoom({
        type: 'order',
        customer_id: user.id,
        order_id: order.id,
        name: `Order #${order.id.slice(0, 8)}`,
      });

      toast.dismiss('chat-loading');
      
      if (room) {
        // Redirect to chat page with room ID to auto-open the chat
        router.push(`/client/chat?room=${room.id}`);
      } else {
        toast.error('Gagal membuka chat');
      }
    } catch (error) {
      toast.dismiss('chat-loading');
      toast.error('Gagal membuka chat');
      console.error('Chat error:', error);
    }
  };

  const handleChatBooking = async (booking: Booking) => {
    if (!user) return;

    try {
      toast.loading('Membuka chat...', { id: 'chat-loading' });
      
      const room = await createRoom({
        type: 'booking',
        customer_id: user.id,
        teknisi_id: booking.teknisi_id,
        booking_id: booking.id,
        name: `Servis ${booking.device_name}`,
      });

      toast.dismiss('chat-loading');
      
      if (room) {
        router.push('/client/chat');
      } else {
        toast.error('Gagal membuka chat');
      }
    } catch (error) {
      toast.dismiss('chat-loading');
      toast.error('Gagal membuka chat');
      console.error('Chat error:', error);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      dikirim: 'bg-blue-500/20 text-blue-500',
      selesai: 'bg-green-500/20 text-green-500',
      dibatalkan: 'bg-red-500/20 text-red-500',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getBookingStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      baru: 'bg-blue-500/20 text-blue-500',
      proses: 'bg-yellow-500/20 text-yellow-500',
      selesai: 'bg-green-500/20 text-green-500',
    };
    return <Badge className={colors[status]}>{status}</Badge>;
  };

  const getProgressPercentage = (current: number, targetAmount: number) => {
    return Math.min((current / targetAmount) * 100, 100);
  };

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2 md:gap-3">
              <User className="h-6 w-6 md:h-8 md:w-8" />
              Akun Saya
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">Kelola profil, pesanan, dan booking service Anda</p>
          </div>

          <Tabs defaultValue={defaultTab} className="space-y-4 md:space-y-6">
            <TabsList className="w-full grid grid-cols-2 md:flex md:w-auto gap-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Profil</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs md:text-sm">
                <ShoppingBag className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Pesanan</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs md:text-sm">
                <Wrench className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Booking</span>
              </TabsTrigger>
              <TabsTrigger value="target" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs md:text-sm">
                <Target className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">Target</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-amber-500/20 shadow-sm">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                  <CardTitle className="text-lg md:text-xl">Informasi Profil</CardTitle>
                  <div className="flex gap-2 w-full md:w-auto">
                    {editMode ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditMode(false)}
                          className="flex-1 md:flex-none text-xs md:text-sm"
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white flex-1 md:flex-none text-xs md:text-sm"
                          onClick={handleSaveProfile}
                          disabled={saving}
                        >
                          <Save className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                          {saving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setEditMode(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white w-full md:w-auto text-xs md:text-sm"
                      >
                        Edit Profil
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
                    </div>
                  ) : editMode ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Alamat lengkap..."
                          rows={3}
                        />
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <User className="h-8 w-8 md:h-10 md:w-10 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold truncate">{profile?.name || 'User'}</h3>
                          <p className="text-muted-foreground text-sm md:text-base truncate">{profile?.email}</p>
                          <p className="text-muted-foreground text-sm md:text-base">{profile?.phone || 'Belum diisi'}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10 w-full md:w-auto text-xs md:text-sm"
                        >
                          <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
                          Logout
                        </Button>
                      </div>

                      {profile?.address && (
                        <div className="border-t pt-3 md:pt-4">
                          <p className="text-muted-foreground text-xs md:text-sm mb-1">Alamat</p>
                          <p className="text-sm md:text-base">{profile.address}</p>
                        </div>
                      )}

                      <div className="border-t pt-3 md:pt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <div className="bg-muted/30 p-3 md:p-4 rounded-lg border">
                          <p className="text-muted-foreground text-xs md:text-sm">Total Pesanan</p>
                          <p className="text-xl md:text-2xl font-bold">{orders.length}</p>
                        </div>
                        <div className="bg-muted/30 p-3 md:p-4 rounded-lg border">
                          <p className="text-muted-foreground text-xs md:text-sm">Booking Service</p>
                          <p className="text-xl md:text-2xl font-bold">{bookings.length}</p>
                        </div>
                        <div className="bg-muted/30 p-3 md:p-4 rounded-lg border col-span-2 md:col-span-1">
                          <p className="text-muted-foreground text-xs md:text-sm">Progress Target</p>
                          <p className="text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-500">
                            {target ? getProgressPercentage(Number(target.current_amount), Number(target.target_amount)).toFixed(0) : 0}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-amber-500/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Riwayat Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <ShoppingBag className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4" />
                      <p className="text-muted-foreground text-sm md:text-base">Belum ada pesanan</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-muted/30 rounded-lg p-3 md:p-4 border">
                          <div className="flex justify-between items-start mb-2 md:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-muted-foreground text-[10px] md:text-xs">Order ID: {order.id.slice(0, 8)}...</p>
                              <p className="font-semibold mt-1 text-sm md:text-base">
                                Rp {order.total_amount.toLocaleString('id-ID')}
                              </p>
                            </div>
                            {getOrderStatusBadge(order.status)}
                          </div>
                          <div className="flex justify-between items-center text-xs md:text-sm gap-2">
                            <span className="text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex gap-1 md:gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-500 text-green-500 hover:bg-green-500/10 h-7 md:h-8 text-xs px-2"
                                onClick={() => handleChatOrder(order)}
                              >
                                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-amber-500 text-amber-500 hover:bg-amber-500/10 h-7 md:h-8 text-xs px-2 md:px-3"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderDetail(true);
                                }}
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                <span className="hidden md:inline">Detail</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="bg-slate-800/50 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl">Riwayat Booking Service</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <Wrench className="h-12 w-12 md:h-16 md:w-16 text-slate-600 mx-auto mb-3 md:mb-4" />
                      <p className="text-slate-400 text-sm md:text-base">Belum ada booking service</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="bg-slate-700/30 rounded-lg p-3 md:p-4">
                          <div className="flex justify-between items-start mb-2 md:mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-white font-semibold text-sm md:text-base">{booking.device_name}</p>
                              <p className="text-slate-400 text-xs md:text-sm mt-1 line-clamp-2">{booking.issue}</p>
                              {booking.teknisi && (
                                <p className="text-slate-500 text-[10px] md:text-xs mt-1 md:mt-2">
                                  Teknisi: {booking.teknisi.name}
                                </p>
                              )}
                            </div>
                            {getBookingStatusBadge(booking.status)}
                          </div>
                          <div className="flex justify-between items-center text-xs md:text-sm gap-2">
                            <span className="text-slate-400">
                              {new Date(booking.booking_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <div className="flex gap-1 md:gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-500 text-green-500 hover:bg-green-500/10 h-7 md:h-8 text-xs px-2"
                                onClick={() => handleChatBooking(booking)}
                              >
                                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-amber-500 text-amber-500 hover:bg-amber-500/10 h-7 md:h-8 text-xs px-2 md:px-3"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowBookingTrack(true);
                                }}
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                                <span className="hidden md:inline">Track</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Target Tab */}
            <TabsContent value="target">
              <div className="space-y-4 md:space-y-6">
                {target ? (
                  <>
                    {/* Progress Card */}
                    <Card className="bg-slate-800/50 border-amber-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                          <Target className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                          Progress Target
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 md:p-6">
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <div className="flex justify-between text-xs md:text-sm mb-2">
                              <span className="text-slate-400">Current Progress</span>
                              <span className="text-amber-500 font-semibold">
                                {getProgressPercentage(Number(target.current_amount), Number(target.target_amount)).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 md:h-4">
                              <div
                                className="bg-linear-to-r from-amber-500 to-amber-600 h-3 md:h-4 rounded-full transition-all"
                                style={{
                                  width: `${getProgressPercentage(Number(target.current_amount), Number(target.target_amount))}%`
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="bg-slate-700/30 p-3 md:p-4 rounded-lg">
                              <p className="text-slate-400 text-xs md:text-sm mb-1">Pencapaian</p>
                              <p className="text-base md:text-xl lg:text-2xl font-bold text-white wrap-break-word">
                                Rp {Number(target.current_amount).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="bg-slate-700/30 p-3 md:p-4 rounded-lg">
                              <p className="text-slate-400 text-xs md:text-sm mb-1">Target</p>
                              <p className="text-base md:text-xl lg:text-2xl font-bold text-amber-500 wrap-break-word">
                                Rp {Number(target.target_amount).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-700/30 p-3 md:p-4 rounded-lg">
                            <p className="text-slate-400 text-xs md:text-sm mb-1">Sisa Target</p>
                            <p className="text-base md:text-lg lg:text-xl font-bold text-white wrap-break-word">
                              Rp {(Number(target.target_amount) - Number(target.current_amount)).toLocaleString('id-ID')}
                            </p>
                          </div>

                          {target.status === 'achieved' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-green-500 shrink-0" />
                              <div>
                                <h4 className="text-green-500 font-semibold text-sm md:text-base">Selamat! Target Tercapai!</h4>
                                <p className="text-slate-300 text-xs md:text-sm">
                                  Anda telah mencapai target pembelanjaan
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reward Card */}
                    {target.status === 'achieved' && (
                      <Card className="bg-linear-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30">
                        <CardHeader className="p-4 md:p-6">
                          <CardTitle className="text-white flex items-center gap-2 text-base md:text-lg">
                            <Gift className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                            Reward Anda
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6 pt-0">
                          {target.reward ? (
                            <div className="space-y-3 md:space-y-4">
                              <div className="bg-slate-800/50 p-3 md:p-4 rounded-lg">
                                <p className="text-amber-500 font-semibold text-base md:text-lg mb-2">🎁 {target.reward}</p>
                                <p className="text-slate-300 text-xs md:text-sm">
                                  Hubungi customer service kami untuk klaim reward Anda!
                                </p>
                              </div>
                              {target.reward_claimed ? (
                                <Badge className="bg-green-500/20 text-green-500 w-full justify-center py-2 text-xs md:text-sm">
                                  ✓ Reward Sudah Diklaim
                                </Badge>
                              ) : (
                                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold text-xs md:text-sm">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Klaim Reward
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4 md:py-6">
                              <p className="text-slate-400 text-xs md:text-sm">
                                Reward sedang diproses oleh admin kami
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="bg-slate-800/50 border-amber-500/20">
                    <CardContent className="py-8 md:py-12 text-center">
                      <Target className="h-12 w-12 md:h-16 md:w-16 text-slate-600 mx-auto mb-3 md:mb-4" />
                      <p className="text-slate-400 text-sm md:text-base">Target belum tersedia</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="bg-slate-800 border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500">
              Detail Pesanan
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-700">
                <div>
                  <p className="text-slate-400 text-sm">Order ID</p>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <div className="mt-1">{getOrderStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Tanggal Order</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Metode Pembayaran</p>
                  <p className="text-sm capitalize">{selectedOrder.payment_method.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedOrder.customer_info && (
                <div className="space-y-2 pb-4 border-b border-slate-700">
                  <h3 className="font-semibold text-amber-500">Informasi Pelanggan</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Nama</p>
                      <p>{selectedOrder.customer_info.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Email</p>
                      <p>{selectedOrder.customer_info.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Telepon</p>
                      <p>{selectedOrder.customer_info.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Alamat</p>
                      <p className="col-span-2">{selectedOrder.customer_info.address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2">
                <h3 className="font-semibold text-amber-500">Item Pesanan</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    selectedOrder.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-start bg-slate-700/30 p-3 rounded">
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name || 'Produk tidak ditemukan'}</p>
                          <p className="text-sm text-slate-400">
                            Rp {(item.price || 0).toLocaleString('id-ID')} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-amber-500">
                          Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Tidak ada item</p>
                  )}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span>Rp {(selectedOrder.subtotal || selectedOrder.total_amount).toLocaleString('id-ID')}</span>
                </div>
                
                {(selectedOrder.discount_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Diskon {selectedOrder.voucher_code ? `(${selectedOrder.voucher_code})` : ''}
                    </span>
                    <span className="text-green-400">
                      - Rp {(selectedOrder.discount_amount ?? 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                  <p className="text-lg font-semibold">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-amber-500">
                    Rp {selectedOrder.total_amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Track Booking */}
      <Dialog open={showBookingTrack} onOpenChange={setShowBookingTrack}>
        <DialogContent className="bg-slate-800 border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-500">
              Track Service - {selectedBooking?.service_code || 'N/A'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Service Info */}
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Device:</span>
                  <span className="font-semibold">{selectedBooking.device_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue:</span>
                  <span className="font-semibold">{selectedBooking.issue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge className="capitalize">
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Progress:</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedBooking.progress_status || 'pending'}
                  </Badge>
                </div>
              </div>

              {/* Teknisi Info */}
              {selectedBooking.teknisi && (
                <div className="bg-slate-900/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-amber-500 mb-2">Teknisi Assigned</h3>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-semibold">{selectedBooking.teknisi.name}</span>
                  </div>
                  {selectedBooking.teknisi.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold">{selectedBooking.teknisi.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Notes */}
              {selectedBooking.progress_notes && (
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-500 mb-2">Progress Notes</h3>
                  <p className="text-slate-300">{selectedBooking.progress_notes}</p>
                </div>
              )}

              {/* Estimated Completion */}
              {selectedBooking.estimated_completion && (
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Completion:</span>
                    <span className="font-semibold">
                      {new Date(selectedBooking.estimated_completion).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-500 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold">Booking Created</p>
                      <p className="text-sm text-slate-400">
                        {new Date(selectedBooking.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.updated_at && selectedBooking.updated_at !== selectedBooking.created_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold">Last Updated</p>
                        <p className="text-sm text-slate-400">
                          {new Date(selectedBooking.updated_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedBooking.completed_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold">Completed</p>
                        <p className="text-sm text-slate-400">
                          {new Date(selectedBooking.completed_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <ClientLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ClientLayout>
    }>
      <AccountContent />
    </Suspense>
  );
}
