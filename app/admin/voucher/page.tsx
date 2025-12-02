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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              Manajemen Voucher
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Kelola voucher dan promo diskon</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Voucher
          </Button>
        </div>

        {/* Vouchers Table - Desktop */}
        <Card className="shadow-sm hidden md:block">
          <CardHeader>
            <CardTitle>Daftar Voucher</CardTitle>
            <CardDescription>Total: {vouchers.length} voucher</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead className="text-amber-500 w-[100px]">Kode</TableHead>
                      <TableHead className="text-amber-500 min-w-[180px]">Nama</TableHead>
                      <TableHead className="text-amber-500 w-[100px]">Tipe</TableHead>
                      <TableHead className="text-amber-500 w-[80px]">Nilai</TableHead>
                      <TableHead className="text-amber-500 w-[100px]">Min. Belanja</TableHead>
                      <TableHead className="text-amber-500 w-[70px]">Kuota</TableHead>
                      <TableHead className="text-amber-500 w-[140px]">Berlaku</TableHead>
                      <TableHead className="text-amber-500 w-[80px]">Status</TableHead>
                      <TableHead className="text-amber-500 text-right w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => (
                      <TableRow key={voucher.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-amber-600 text-xs">
                          {voucher.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{voucher.name}</div>
                            {voucher.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {voucher.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(voucher.type)}</TableCell>
                        <TableCell className="font-semibold text-sm">
                          {voucher.type === 'percentage' 
                            ? `${voucher.value}%` 
                            : `${(voucher.value / 1000).toFixed(0)}K`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {voucher.min_purchase === 0 
                            ? '-' 
                            : `${(voucher.min_purchase / 1000).toFixed(0)}K`}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={voucher.used >= voucher.quota ? 'text-red-500 font-bold' : ''}>
                            {voucher.used}/{voucher.quota}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="space-y-0.5">
                            <div>{new Date(voucher.valid_from).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                            <div className="text-muted-foreground">s/d {new Date(voucher.valid_until).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(voucher.is_active, voucher.valid_until)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(voucher)}
                              className="border-blue-500 text-blue-500 hover:bg-blue-500/10 h-8 w-8 p-0"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(voucher.id)}
                              className="border-red-500 text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vouchers Cards - Mobile/Tablet */}
        <div className="md:hidden space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Daftar Voucher</CardTitle>
              <CardDescription className="text-sm">Total: {vouchers.length} voucher</CardDescription>
            </CardHeader>
          </Card>
          
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : (
            <div className="space-y-3">
              {vouchers.map((voucher) => (
                <Card key={voucher.id} className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono font-bold text-amber-600 text-sm">
                          {voucher.code}
                        </div>
                        <div className="font-medium text-base mt-1">{voucher.name}</div>
                        {voucher.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {voucher.description}
                          </div>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(voucher.is_active, voucher.valid_until)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Tipe</div>
                        {getTypeBadge(voucher.type)}
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Nilai</div>
                        <div className="font-semibold">
                          {voucher.type === 'percentage' 
                            ? `${voucher.value}%` 
                            : `Rp ${voucher.value.toLocaleString('id-ID')}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Min. Belanja</div>
                        <div className="font-medium">
                          Rp {voucher.min_purchase.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Kuota</div>
                        <div className={`font-medium ${voucher.used >= voucher.quota ? 'text-red-500' : ''}`}>
                          {voucher.used}/{voucher.quota}
                        </div>
                      </div>
                    </div>

                    {/* Validity */}
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Berlaku</div>
                      <div className="text-xs">
                        {new Date(voucher.valid_from).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {new Date(voucher.valid_until).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(voucher)}
                        className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(voucher.id)}
                        className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-amber-500 text-lg sm:text-xl">
                {isEditing ? 'Edit Voucher' : 'Tambah Voucher Baru'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {isEditing ? 'Update informasi voucher' : 'Isi form untuk membuat voucher baru'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm">Kode Voucher *</Label>
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
                  <Label htmlFor="name" className="text-sm">Nama Voucher *</Label>
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
                <Label htmlFor="description" className="text-sm">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat voucher..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">Tipe Voucher *</Label>
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
                  <Label htmlFor="value" className="text-sm">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_purchase" className="text-sm">Minimum Pembelian (Rp)</Label>
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
                    <Label htmlFor="max_discount" className="text-sm">Maksimal Diskon (Rp)</Label>
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
                <Label htmlFor="quota" className="text-sm">Kuota Penggunaan *</Label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from" className="text-sm">Berlaku Dari *</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until" className="text-sm">Berlaku Sampai *</Label>
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
                <Label htmlFor="is_active" className="cursor-pointer text-sm">
                  Aktifkan voucher
                </Label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
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
