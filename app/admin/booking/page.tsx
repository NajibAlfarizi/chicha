'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Eye, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Booking, ServiceProgress, Teknisi } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking & { progress?: ServiceProgress[] } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [biayaPerbaikan, setBiayaPerbaikan] = useState<string>('');
  const [isEditingBiaya, setIsEditingBiaya] = useState(false);
  const [isSavingBiaya, setIsSavingBiaya] = useState(false);
  const [isAssigningTeknisi, setIsAssigningTeknisi] = useState(false);
  const [selectedTeknisiId, setSelectedTeknisiId] = useState<string>('');

  useEffect(() => {
    fetchBookings();
    fetchTeknisiList();
  }, []);

  const fetchTeknisiList = async () => {
    try {
      const response = await fetch('/api/teknisi?status=active');
      const data = await response.json();
      setTeknisiList(data.teknisi || []);
    } catch (error) {
      console.error('Error fetching teknisi:', error);
    }
  };

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

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      setSelectedBooking(data.booking);
      setBiayaPerbaikan((data.booking.biaya_perbaikan || 0).toString());
      setIsEditingBiaya(false);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching booking detail:', error);
    }
  };

  const handleSaveBiayaPerbaikan = async () => {
    if (!selectedBooking) return;

    const biaya = parseFloat(biayaPerbaikan) || 0;

    if (biaya < 0) {
      toast.error('Biaya tidak valid', {
        description: 'Biaya perbaikan tidak boleh negatif',
      });
      return;
    }

    setIsSavingBiaya(true);
    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biaya_perbaikan: biaya,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update biaya perbaikan');
      }

      const data = await response.json();
      setSelectedBooking(data.booking);
      setBiayaPerbaikan((data.booking.biaya_perbaikan || 0).toString());
      setIsEditingBiaya(false);
      
      toast.success('Biaya perbaikan berhasil disimpan', {
        description: `Biaya: Rp ${biaya.toLocaleString('id-ID')}`,
      });

      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error saving biaya perbaikan:', error);
      toast.error('Gagal menyimpan biaya perbaikan', {
        description: 'Terjadi kesalahan saat menyimpan data',
      });
    } finally {
      setIsSavingBiaya(false);
    }
  };

  const handleAssignTeknisi = async () => {
    if (!selectedBooking || !selectedTeknisiId) {
      toast.error('Pilih teknisi terlebih dahulu');
      return;
    }

    setIsAssigningTeknisi(true);
    try {
      const response = await fetch('/api/bookings/assign-teknisi', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          teknisi_id: selectedTeknisiId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign teknisi');
      }

      const data = await response.json();
      setSelectedBooking(data.booking);
      setSelectedTeknisiId('');

      toast.success('Teknisi berhasil ditugaskan', {
        description: 'Notifikasi telah dikirim ke teknisi dan pelanggan',
      });

      // Refresh the bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error assigning teknisi:', error);
      toast.error('Gagal menugaskan teknisi', {
        description: 'Terjadi kesalahan saat menugaskan teknisi',
      });
    } finally {
      setIsAssigningTeknisi(false);
    }
  };

  const getProgressBadge = (status?: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      diagnosed: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      in_progress: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
      waiting_parts: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
      completed: 'bg-green-500/20 text-green-500 border-green-500/50',
      cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      diagnosed: 'Diagnosed',
      in_progress: 'In Progress',
      waiting_parts: 'Waiting Parts',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    const currentStatus = status || 'pending';
    return (
      <Badge className={colors[currentStatus] || colors.pending}>
        {labels[currentStatus] || currentStatus}
      </Badge>
    );
  };

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(booking => booking.progress_status === filterStatus);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold  flex items-center gap-3">
              <Wrench className="h-8 w-8 text-amber-500" />
              Manajemen Servis
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
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="diagnosed">Diagnosed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle >Daftar Servis</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total: {filteredBookings.length} servis
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
                    <TableHead className="text-amber-500">Biaya Perbaikan</TableHead>
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
                      <TableCell>{getProgressBadge(booking.progress_status)}</TableCell>
                      <TableCell >
                        {booking.biaya_perbaikan ? (
                          <span className="font-medium text-blue-600 dark:text-blue-400">Rp {booking.biaya_perbaikan.toLocaleString('id-ID')}</span>
                        ) : (
                          <span className="text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
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
              <DialogTitle className="text-amber-500">Detail Servis</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                ID: {selectedBooking?.id.slice(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                {/* Customer & Device Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Nama:</span> {selectedBooking.customer_name || selectedBooking.user?.name || 'N/A'}</p>
                      <p><span className="text-muted-foreground">Email:</span> {selectedBooking.customer_email || selectedBooking.user?.email || '-'}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedBooking.customer_phone || selectedBooking.user?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informasi Device</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Device:</span> {selectedBooking.device_name}</p>
                      <p><span className="text-muted-foreground">Keluhan:</span> {selectedBooking.issue}</p>
                      <p><span className="text-muted-foreground">Tanggal Booking:</span> {new Date(selectedBooking.booking_date).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>

                {/* Teknisi Info */}
                {selectedBooking.teknisi && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">Teknisi yang Ditugaskan</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                        {selectedBooking.teknisi.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedBooking.teknisi.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedBooking.teknisi.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assign Teknisi Section - Show when no teknisi assigned */}
                {!selectedBooking.teknisi && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-400">⚠️ Belum Ada Teknisi yang Ditugaskan</h4>
                    <div className="space-y-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Pilih teknisi untuk menugaskan service ini
                      </p>
                      <div className="flex gap-2">
                        <Select value={selectedTeknisiId} onValueChange={setSelectedTeknisiId}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Pilih teknisi..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teknisiList.map((teknisi) => (
                              <SelectItem key={teknisi.id} value={teknisi.id}>
                                {teknisi.name} {teknisi.specialization ? `- ${teknisi.specialization}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleAssignTeknisi}
                          disabled={!selectedTeknisiId || isAssigningTeknisi}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          {isAssigningTeknisi ? 'Menugaskan...' : 'Tugaskan'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-6">Status Perbaikan</h4>
                  <div className="relative pl-8">
                    {/* Vertical Line connecting all steps */}
                    <div className="absolute left-3.75 top-0 bottom-0 w-0.5 bg-linear-to-b from-amber-500 via-amber-500/50 to-muted"></div>
                    
                    {/* Step 1: Pending */}
                    <div className="relative mb-8">
                      <div className="flex items-start gap-4">
                        <div className={`absolute -left-7.25 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 ${
                          selectedBooking.progress_status
                            ? 'bg-amber-500 border-amber-500'
                            : 'bg-white dark:bg-slate-900 border-muted'
                        }`}>
                          {selectedBooking.progress_status && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <p className="font-semibold text-base mb-1">Booking Dibuat (Pending)</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedBooking.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {selectedBooking.teknisi && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {selectedBooking.teknisi.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Teknisi: {selectedBooking.teknisi.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Diagnosed */}
                    <div className="relative mb-8">
                      <div className="flex items-start gap-4">
                        <div className={`absolute -left-7.25 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 ${
                          selectedBooking.progress_status === 'diagnosed' || 
                          selectedBooking.progress_status === 'in_progress' || 
                          selectedBooking.progress_status === 'waiting_parts' || 
                          selectedBooking.progress_status === 'completed'
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white dark:bg-slate-900 border-muted'
                        }`}>
                          {(selectedBooking.progress_status === 'diagnosed' || 
                            selectedBooking.progress_status === 'in_progress' || 
                            selectedBooking.progress_status === 'waiting_parts' || 
                            selectedBooking.progress_status === 'completed') && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <p className="font-semibold text-base mb-1">Diagnosed</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedBooking.progress_status === 'diagnosed' || 
                             selectedBooking.progress_status === 'in_progress' || 
                             selectedBooking.progress_status === 'waiting_parts' || 
                             selectedBooking.progress_status === 'completed'
                              ? 'Teknisi sudah mendiagnosa masalah'
                              : 'Menunggu diagnosa'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: In Progress / Waiting Parts */}
                    <div className="relative mb-8">
                      <div className="flex items-start gap-4">
                        <div className={`absolute -left-7.25 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 ${
                          selectedBooking.progress_status === 'in_progress' || 
                          selectedBooking.progress_status === 'waiting_parts' || 
                          selectedBooking.progress_status === 'completed'
                            ? 'bg-purple-500 border-purple-500'
                            : 'bg-white dark:bg-slate-900 border-muted'
                        }`}>
                          {(selectedBooking.progress_status === 'in_progress' || 
                            selectedBooking.progress_status === 'waiting_parts' || 
                            selectedBooking.progress_status === 'completed') && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <p className="font-semibold text-base mb-1">
                            {selectedBooking.progress_status === 'waiting_parts' 
                              ? 'Menunggu Spare Part' 
                              : 'Sedang Dikerjakan'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedBooking.progress_status === 'in_progress'
                              ? 'Teknisi sedang mengerjakan perbaikan'
                              : selectedBooking.progress_status === 'waiting_parts'
                              ? 'Menunggu spare part tersedia'
                              : selectedBooking.progress_status === 'completed'
                              ? 'Perbaikan sudah selesai dikerjakan'
                              : 'Belum dimulai'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Completed */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className={`absolute -left-7.25 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 ${
                          selectedBooking.progress_status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white dark:bg-slate-900 border-muted'
                        }`}>
                          {selectedBooking.progress_status === 'completed' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 -mt-1">
                          <p className="font-semibold text-base mb-1">Selesai</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedBooking.progress_status === 'completed'
                              ? 'Perbaikan telah diselesaikan'
                              : 'Menunggu penyelesaian'}
                          </p>
                          {selectedBooking.estimated_completion && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Est. selesai: {new Date(selectedBooking.estimated_completion).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Updates from Teknisi */}
                {selectedBooking.progress && selectedBooking.progress.length > 0 && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Update dari Teknisi</h4>
                    <div className="space-y-3">
                      {selectedBooking.progress.map((prog) => (
                        <div key={prog.id} className="border-l-4 border-amber-500 pl-4 py-2 bg-background rounded">
                          <div className="flex justify-between items-start mb-1">
                            <Badge className="bg-blue-500/20 text-blue-500 text-xs">
                              {prog.progress_status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(prog.updated_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p className="text-sm">{prog.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biaya Perbaikan */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Biaya Perbaikan</span>
                    {!isEditingBiaya && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingBiaya(true)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {isEditingBiaya ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={biayaPerbaikan}
                          onChange={(e) => setBiayaPerbaikan(e.target.value)}
                          placeholder="Masukkan biaya perbaikan"
                          className="flex-1"
                          min="0"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBiayaPerbaikan((selectedBooking.biaya_perbaikan || 0).toString());
                            setIsEditingBiaya(false);
                          }}
                          disabled={isSavingBiaya}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveBiayaPerbaikan}
                          disabled={isSavingBiaya}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {isSavingBiaya ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-blue-600">
                      Rp {(selectedBooking.biaya_perbaikan || 0).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                {/* Current Status Badge */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Status Saat Ini:</span>
                    <Badge className={
                      selectedBooking.progress_status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      selectedBooking.progress_status === 'in_progress' ? 'bg-purple-500/20 text-purple-500' :
                      selectedBooking.progress_status === 'waiting_parts' ? 'bg-orange-500/20 text-orange-500' :
                      selectedBooking.progress_status === 'diagnosed' ? 'bg-blue-500/20 text-blue-500' :
                      selectedBooking.progress_status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }>
                      {selectedBooking.progress_status === 'completed' ? 'Completed' :
                       selectedBooking.progress_status === 'in_progress' ? 'In Progress' :
                       selectedBooking.progress_status === 'waiting_parts' ? 'Waiting Parts' :
                       selectedBooking.progress_status === 'diagnosed' ? 'Diagnosed' :
                       selectedBooking.progress_status === 'cancelled' ? 'Cancelled' :
                       'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </AdminLayout>
  );
}
