/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ShoppingBag, Eye } from 'lucide-react';
import { Order, OrderItem } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order & { order_items?: OrderItem[]; voucher?: any } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/all');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      setSelectedOrder(data.order);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          cancel_reason: reason 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle workflow violation error with detailed message
        if (response.status === 400 && data.details) {
          toast.error('Transisi Status Tidak Valid', {
            description: data.details,
            duration: 5000,
          });
        } else {
          toast.error('Gagal mengubah status', {
            description: data.error || 'Terjadi kesalahan saat mengubah status pesanan',
          });
        }
        return;
      }

      // Success
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        fetchOrderDetail(orderId);
      }
      
      toast.success('Status pesanan berhasil diubah', {
        description: `Status diubah menjadi: ${getStatusLabel(newStatus)}`,
      });

      // Close cancel dialog if open
      setIsCancelDialogOpen(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat terhubung ke server',
      });
    }
  };

  const handleCancelOrder = () => {
    if (selectedOrder && cancelReason.trim()) {
      updateOrderStatus(selectedOrder.id, 'dibatalkan', cancelReason);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      dikirim: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      selesai: 'bg-green-500/20 text-green-500 border-green-500/50',
      dibatalkan: 'bg-red-500/20 text-red-500 border-red-500/50',
    };
    
    const labels: Record<string, string> = {
      pending: 'Pending',
      dikirim: 'Dikirim',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan',
    };

    return (
      <Badge className={colors[status] || ''}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
      paid: 'bg-green-500/20 text-green-500 border-green-500/50',
      failed: 'bg-red-500/20 text-red-500 border-red-500/50',
      expired: 'bg-gray-500/20 text-gray-500 border-gray-500/50',
    };
    
    const labels: Record<string, string> = {
      pending: 'Belum Bayar',
      paid: 'Lunas',
      failed: 'Gagal',
      expired: 'Kadaluarsa',
    };

    return (
      <Badge className={colors[paymentStatus] || 'bg-gray-500/20 text-gray-500 border-gray-500/50'}>
        {labels[paymentStatus] || paymentStatus || 'N/A'}
      </Badge>
    );
  };

  // Define status progression workflow - status can only move forward
  const getValidNextStatuses = (currentStatus: string): string[] => {
    const statusFlow: Record<string, string[]> = {
      'pending': ['dikirim', 'dibatalkan'],      // From pending, can go to shipped or cancelled
      'dikirim': ['selesai', 'dibatalkan'],     // From shipped, can go to completed or cancelled
      'selesai': [],                             // Completed, no progression
      'dibatalkan': [],                          // Cancelled, no progression
    };
    return statusFlow[currentStatus] || [];
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'pending': 'Pending',
      'dikirim': 'Dikirim',
      'selesai': 'Selesai',
      'dibatalkan': 'Dibatalkan',
    };
    return labels[status] || status;
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-amber-500" />
            Manajemen Pesanan
          </h2>
          <p className="text-muted-foreground mt-2">Kelola dan pantau semua pesanan pelanggan</p>
        </div>

        {/* Filter */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span>Filter Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="dikirim">Dikirim</SelectItem>
                  <SelectItem value="selesai">Selesai</SelectItem>
                  <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daftar Pesanan</CardTitle>
            <CardDescription>
              Total: {filteredOrders.length} pesanan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-amber-500">ID Pesanan</TableHead>
                    <TableHead className="text-amber-500">Pelanggan</TableHead>
                    <TableHead className="text-amber-500">Total</TableHead>
                    <TableHead className="text-amber-500">Metode Bayar</TableHead>
                    <TableHead className="text-amber-500">Status Pesanan</TableHead>
                    <TableHead className="text-amber-500">Status Bayar</TableHead>
                    <TableHead className="text-amber-500">Tanggal</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.name}</div>
                          <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{order.payment_method}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status || 'pending')}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchOrderDetail(order.id)}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Detail Pesanan</DialogTitle>
              <DialogDescription>
                ID: {selectedOrder?.id || 'Loading...'}
              </DialogDescription>
            </DialogHeader>
            {!selectedOrder ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
                <p className="text-muted-foreground">Memuat detail pesanan...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nama:</span> {selectedOrder.customer_name || selectedOrder.user?.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email || selectedOrder.user?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone || selectedOrder.user?.phone || '-'}</p>
                    {selectedOrder.customer_address && (
                      <p><span className="text-muted-foreground">Alamat:</span> {selectedOrder.customer_address}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Item Pesanan</h4>
                  {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOrder.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-3">
                            {item.product?.image_url && (
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                          <p className="text-amber-500 font-semibold">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada item pesanan</p>
                  )}
                </div>

                {/* Voucher Info */}
                {selectedOrder.voucher_id && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">Voucher Digunakan</h4>
                    <div className="text-sm space-y-1">
                      <p>Kode Voucher: <span className="font-mono font-semibold">{selectedOrder.voucher_code || '-'}</span></p>
                      {selectedOrder.discount_amount && (
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          Diskon: -Rp {selectedOrder.discount_amount.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Metode Pembayaran:</span>
                    <span className="font-semibold">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Status Pesanan:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Status Pembayaran:</span>
                    {getPaymentStatusBadge(selectedOrder.payment_status || 'pending')}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="text-amber-500 font-bold text-xl">
                      Rp {selectedOrder.total_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Cancel Reason (if order is cancelled) */}
                {selectedOrder.status === 'dibatalkan' && selectedOrder.cancel_reason && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">Alasan Pembatalan</h4>
                    <p className="text-sm text-red-600 dark:text-red-300">{selectedOrder.cancel_reason}</p>
                    {selectedOrder.cancelled_at && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Dibatalkan pada: {new Date(selectedOrder.cancelled_at).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                )}

                {/* Update Status */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Status Saat Ini</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pesanan:</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedOrder.status)}
                        <span className="text-xs text-muted-foreground">({getStatusLabel(selectedOrder.status)})</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Workflow Diagram */}
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-muted-foreground mb-2">
                      ℹ️ <strong>Catatan:</strong> Status pesanan hanya dapat bergerak maju dalam alur berikut:
                    </p>
                    <p className="text-xs font-mono text-blue-600 dark:text-blue-400">
                      Pending → Dikirim → Selesai
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ Pesanan tidak dapat dikembalikan ke status sebelumnya setelah diperbarui.
                    </p>
                  </div>

                  {getValidNextStatuses(selectedOrder.status).length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3">Pilih Status Berikutnya</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {getValidNextStatuses(selectedOrder.status).map((nextStatus) => {
                          const statusColors: Record<string, string> = {
                            'dikirim': 'bg-blue-600 hover:bg-blue-700',
                            'selesai': 'bg-green-600 hover:bg-green-700',
                            'dibatalkan': 'bg-red-600 hover:bg-red-700',
                          };
                          
                          const statusIcons: Record<string, string> = {
                            'dikirim': '📦',
                            'selesai': '✅',
                            'dibatalkan': '❌',
                          };

                          return (
                            <Button
                              key={nextStatus}
                              onClick={() => {
                                if (nextStatus === 'dibatalkan') {
                                  setIsCancelDialogOpen(true);
                                } else {
                                  updateOrderStatus(selectedOrder.id, nextStatus);
                                }
                              }}
                              className={`${statusColors[nextStatus] || ''} text-white`}
                            >
                              <span className="mr-2">{statusIcons[nextStatus] || '→'}</span>
                              {getStatusLabel(nextStatus)}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm text-muted-foreground">
                      <p>✓ Pesanan sudah mencapai status final: <strong>{getStatusLabel(selectedOrder.status)}</strong></p>
                      <p className="text-xs mt-1">Tidak ada lagi status berikutnya yang dapat diterapkan.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Order Dialog */}
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">Batalkan Pesanan</DialogTitle>
              <DialogDescription>
                Masukkan alasan pembatalan. Stok produk akan dikembalikan otomatis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Alasan Pembatalan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Contoh: Stok habis, Permintaan pelanggan, Pembayaran gagal..."
                  className="w-full min-h-[100px] p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-background"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCancelDialogOpen(false);
                    setCancelReason('');
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Batalkan Pesanan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
