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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order & { items?: OrderItem[] } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          fetchOrderDetail(orderId);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
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

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-amber-500" />
              Manajemen Pesanan
            </h2>
            <p className="text-muted-foreground mt-2">Kelola dan pantau semua pesanan pelanggan</p>
          </div>
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
                    <TableHead className="text-amber-500">Status</TableHead>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Detail Pesanan</DialogTitle>
              <DialogDescription>
                ID: {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Informasi Pelanggan</h4>
                  <div className="space-y-1 text-sm">
                    <p>Nama: {selectedOrder.user?.name}</p>
                    <p>Email: {selectedOrder.user?.email}</p>
                    <p>Phone: {selectedOrder.user?.phone || '-'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Item Pesanan</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <div>
                          <p>{item.product?.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-amber-500 font-semibold">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Metode Pembayaran:</span>
                    <span className="font-semibold">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Status:</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-bold">Total:</span>
                    <span className="text-amber-500 font-bold text-xl">
                      Rp {selectedOrder.total_amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Update Status</h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={selectedOrder.status === 'pending'}
                    >
                      Pending
                    </Button>
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'dikirim')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={selectedOrder.status === 'dikirim'}
                    >
                      Dikirim
                    </Button>
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'selesai')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={selectedOrder.status === 'selesai'}
                    >
                      Selesai
                    </Button>
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'dibatalkan')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={selectedOrder.status === 'dibatalkan'}
                    >
                      Batalkan
                    </Button>
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
