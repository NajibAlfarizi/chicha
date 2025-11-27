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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Ticket, Plus, Edit, Trash2, Percent, DollarSign } from 'lucide-react';
import { Voucher } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_purchase: '',
    max_discount: '',
    quota: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers?admin=true');
      const data = await response.json();
      setVouchers(data.vouchers || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Gagal memuat voucher');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      min_purchase: '',
      max_discount: '',
      quota: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setCurrentVoucher(null);
    setIsEditing(false);
  };

  const handleCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setCurrentVoucher(voucher);
    setIsEditing(true);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      type: voucher.type,
      value: voucher.value.toString(),
      min_purchase: voucher.min_purchase.toString(),
      max_discount: voucher.max_discount?.toString() || '',
      quota: voucher.quota.toString(),
      valid_from: voucher.valid_from.slice(0, 16),
      valid_until: voucher.valid_until.slice(0, 16),
      is_active: voucher.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditing ? `/api/vouchers/${currentVoucher?.id}` : '/api/vouchers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsDialogOpen(false);
        resetForm();
        fetchVouchers();
      } else {
        toast.error(data.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Gagal menyimpan voucher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return;

    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchVouchers();
      } else {
        toast.error(data.error || 'Gagal menghapus voucher');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'percentage') {
      return (
        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">
          <Percent className="w-3 h-3 mr-1" />
          Persentase
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
        <DollarSign className="w-3 h-3 mr-1" />
        Nominal
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean, validUntil: string) => {
    const now = new Date();
    const expiry = new Date(validUntil);

    if (!isActive) {
      return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/50">Nonaktif</Badge>;
    }

    if (now > expiry) {
      return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Kadaluarsa</Badge>;
    }

    return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Aktif</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Ticket className="h-8 w-8 text-amber-500" />
              Manajemen Voucher
            </h2>
            <p className="text-muted-foreground mt-2">Kelola voucher dan promo diskon</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Voucher
          </Button>
        </div>

        {/* Vouchers Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daftar Voucher</CardTitle>
            <CardDescription>Total: {vouchers.length} voucher</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="text-amber-500">Kode</TableHead>
                    <TableHead className="text-amber-500">Nama</TableHead>
                    <TableHead className="text-amber-500">Tipe</TableHead>
                    <TableHead className="text-amber-500">Nilai</TableHead>
                    <TableHead className="text-amber-500">Min. Belanja</TableHead>
                    <TableHead className="text-amber-500">Kuota</TableHead>
                    <TableHead className="text-amber-500">Berlaku</TableHead>
                    <TableHead className="text-amber-500">Status</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-amber-600">
                        {voucher.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{voucher.name}</div>
                          {voucher.description && (
                            <div className="text-sm text-muted-foreground">
                              {voucher.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(voucher.type)}</TableCell>
                      <TableCell className="font-semibold">
                        {voucher.type === 'percentage' 
                          ? `${voucher.value}%` 
                          : `Rp ${voucher.value.toLocaleString('id-ID')}`}
                      </TableCell>
                      <TableCell>
                        Rp {voucher.min_purchase.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <span className={voucher.used >= voucher.quota ? 'text-red-500 font-bold' : ''}>
                          {voucher.used}/{voucher.quota}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(voucher.valid_from).toLocaleDateString('id-ID')} -{' '}
                        {new Date(voucher.valid_until).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(voucher.is_active, voucher.valid_until)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(voucher)}
                            className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(voucher.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-500">
                {isEditing ? 'Edit Voucher' : 'Tambah Voucher Baru'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update informasi voucher' : 'Isi form untuk membuat voucher baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Voucher *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="DISKON50"
                    required
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Voucher *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Diskon 50%"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat voucher..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Voucher *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percentage' | 'fixed') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Persentase (%)</SelectItem>
                      <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Nilai * {formData.type === 'percentage' ? '(%)' : '(Rp)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '50' : '50000'}
                    required
                    min="0"
                    step={formData.type === 'percentage' ? '1' : '1000'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_purchase">Minimum Pembelian (Rp)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="max_discount">Maksimal Diskon (Rp)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      placeholder="100000"
                      min="0"
                      step="1000"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quota">Kuota Penggunaan *</Label>
                <Input
                  id="quota"
                  type="number"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                  placeholder="100"
                  required
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Berlaku Dari *</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Berlaku Sampai *</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Aktifkan voucher
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isEditing ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
