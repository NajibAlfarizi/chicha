'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Eye, UserPlus, MessageSquarePlus } from 'lucide-react';
import { Booking, User, ServiceProgress } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [teknisi, setTeknisi] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking & { progress?: ServiceProgress[] } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [progressData, setProgressData] = useState({ description: '', progress_status: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBookings();
    fetchTeknisi();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeknisi = async () => {
    try {
      const response = await fetch('/api/users?role=teknisi');
      const data = await response.json();
      setTeknisi(data.users || []);
    } catch (error) {
      console.error('Error fetching teknisi:', error);
    }
  };

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      setSelectedBooking(data.booking);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching booking detail:', error);
    }
  };

  const assignTeknisi = async (bookingId: string, teknisiId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teknisi_id: teknisiId, status: 'proses' }),
      });

      if (response.ok) {
        fetchBookings();
        if (selectedBooking?.id === bookingId) {
          fetchBookingDetail(bookingId);
        }
      }
    } catch (error) {
      console.error('Error assigning teknisi:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings();
        if (selectedBooking?.id === bookingId) {
          fetchBookingDetail(bookingId);
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const addProgress = async () => {
    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          ...progressData,
        }),
      });

      if (response.ok) {
        setIsProgressDialogOpen(false);
        setProgressData({ description: '', progress_status: '' });
        fetchBookingDetail(selectedBooking.id);
      }
    } catch (error) {
      console.error('Error adding progress:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      baru: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      proses: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      selesai: 'bg-green-500/20 text-green-500 border-green-500/50',
    };

    const labels: Record<string, string> = {
      baru: 'Baru',
      proses: 'Proses',
      selesai: 'Selesai',
    };

    return (
      <Badge className={colors[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.status === filterStatus);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold  flex items-center gap-3">
              <Wrench className="h-8 w-8 text-amber-500" />
              Manajemen Booking Service
            </h2>
            <p className="text-muted-foreground mt-2">Kelola booking perbaikan handphone</p>
          </div>
        </div>

        {/* Filter */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span >Filter Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 /50  ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent >
                  <SelectItem value="all" >Semua Status</SelectItem>
                  <SelectItem value="baru" >Baru</SelectItem>
                  <SelectItem value="proses" >Proses</SelectItem>
                  <SelectItem value="selesai" >Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle >Daftar Booking</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total: {filteredBookings.length} booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className=" hover:bg-muted/50">
                    <TableHead className="text-amber-500">Pelanggan</TableHead>
                    <TableHead className="text-amber-500">Device</TableHead>
                    <TableHead className="text-amber-500">Keluhan</TableHead>
                    <TableHead className="text-amber-500">Teknisi</TableHead>
                    <TableHead className="text-amber-500">Status</TableHead>
                    <TableHead className="text-amber-500">Tanggal</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className=" hover:bg-muted/30">
                      <TableCell >
                        <div>
                          <div className="font-medium">
                            {booking.customer_name || booking.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.customer_phone || booking.user?.phone || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className=" font-medium">{booking.device_name}</TableCell>
                      <TableCell className=" max-w-xs truncate">{booking.issue}</TableCell>
                      <TableCell >
                        {booking.teknisi?.name || (
                          <span className="text-muted-foreground italic">Belum ditugaskan</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell >
                        {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchBookingDetail(booking.id)}
                          className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className=" border-amber-500/20  max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Detail Booking Service</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                ID: {selectedBooking?.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                {/* Customer & Device Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="shadow-sm p-4 rounded-lg">
                    <h4 className="font-semibold  mb-2">Informasi Pelanggan</h4>
                    <div className="space-y-1 text-sm">
                      <p >Nama: {selectedBooking.customer_name || selectedBooking.user?.name || 'N/A'}</p>
                      <p >Email: {selectedBooking.customer_email || selectedBooking.user?.email || '-'}</p>
                      <p >Phone: {selectedBooking.customer_phone || selectedBooking.user?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="shadow-sm p-4 rounded-lg">
                    <h4 className="font-semibold  mb-2">Informasi Device</h4>
                    <div className="space-y-1 text-sm">
                      <p >Device: {selectedBooking.device_name}</p>
                      <p >Keluhan: {selectedBooking.issue}</p>
                      <p >
                        Tanggal Booking: {new Date(selectedBooking.booking_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assign Teknisi */}
                <div className="shadow-sm p-4 rounded-lg">
                  <h4 className="font-semibold  mb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-amber-500" />
                    Assign Teknisi
                  </h4>
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedBooking.teknisi_id || ''}
                      onValueChange={(value) => assignTeknisi(selectedBooking.id, value)}
                    >
                      <SelectTrigger className="/50  ">
                        <SelectValue placeholder="Pilih teknisi" />
                      </SelectTrigger>
                      <SelectContent >
                        {teknisi.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id} >
                            {tech.name} - {tech.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBooking.teknisi && (
                      <Badge className="bg-green-500/20 text-green-500">
                        {selectedBooking.teknisi.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Updates */}
                <div className="shadow-sm p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold  flex items-center gap-2">
                      <MessageSquarePlus className="h-5 w-5 text-amber-500" />
                      Progress Updates
                    </h4>
                    <Button
                      size="sm"
                      onClick={() => setIsProgressDialogOpen(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <MessageSquarePlus className="h-4 w-4 mr-1" />
                      Tambah Progress
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {selectedBooking.progress && selectedBooking.progress.length > 0 ? (
                      selectedBooking.progress.map((prog) => (
                        <div key={prog.id} className="border-l-4 border-amber-500 pl-4 py-2 bg-muted/30 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                              {prog.progress_status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(prog.updated_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p className="text-sm ">{prog.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-sm">Belum ada progress update</p>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div className="shadow-sm p-4 rounded-lg">
                  <h4 className="font-semibold  mb-3">Update Status Booking</h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'baru')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={selectedBooking.status === 'baru'}
                    >
                      Baru
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'proses')}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      disabled={selectedBooking.status === 'proses'}
                    >
                      Proses
                    </Button>
                    <Button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'selesai')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={selectedBooking.status === 'selesai'}
                    >
                      Selesai
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Progress Dialog */}
        <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
          <DialogContent className=" border-amber-500/20 ">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Tambah Progress Update</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Tambahkan update progress perbaikan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="progress_status" >Status Progress</Label>
                <Input
                  id="progress_status"
                  value={progressData.progress_status}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProgressData({ ...progressData, progress_status: e.target.value })}
                  placeholder="Contoh: Sedang diagnosa"
                  
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" >Deskripsi</Label>
                <Textarea
                  id="description"
                  value={progressData.description}
                  onChange={(e) => setProgressData({ ...progressData, description: e.target.value })}
                  placeholder="Detail progress perbaikan..."
                  
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsProgressDialogOpen(false)}
                
              >
                Batal
              </Button>
              <Button onClick={addProgress} className="bg-amber-500 hover:bg-amber-600 text-white">
                Tambah Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
