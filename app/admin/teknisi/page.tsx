'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Wrench, Plus, Edit, Trash2, Search, User, Phone, Mail, Award, Power } from 'lucide-react';
import { Teknisi } from '@/lib/types';

interface TeknisiForm extends Partial<Teknisi> {
  password?: string;
}

export default function AdminTeknisiPage() {
  const [teknisi, setTeknisi] = useState<Teknisi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTeknisi, setCurrentTeknisi] = useState<TeknisiForm>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTeknisi();
  }, []);

  const fetchTeknisi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teknisi');
      const data = await response.json();
      setTeknisi(data.teknisi || []);
    } catch (error) {
      console.error('Error fetching teknisi:', error);
      toast.error('Gagal memuat data teknisi');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!currentTeknisi.name || !currentTeknisi.username) {
        toast.error('Nama dan username wajib diisi');
        return;
      }

      if (!editMode && !currentTeknisi.password) {
        toast.error('Password wajib diisi untuk teknisi baru');
        return;
      }

      const url = editMode ? '/api/teknisi' : '/api/teknisi';
      const method = editMode ? 'PUT' : 'POST';

      interface TeknisiPayload {
        id?: string;
        name?: string;
        username?: string;
        phone?: string;
        email?: string;
        specialization?: string;
        status?: string;
        password?: string;
      }

      const body: TeknisiPayload = {
        name: currentTeknisi.name,
        username: currentTeknisi.username,
        phone: currentTeknisi.phone,
        email: currentTeknisi.email,
        specialization: currentTeknisi.specialization,
        status: currentTeknisi.status || 'active',
      };

      if (editMode) {
        body.id = currentTeknisi.id;
        // Only include password if it's being changed
        if (currentTeknisi.password) {
          body.password = currentTeknisi.password;
        }
      } else {
        body.password = currentTeknisi.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editMode ? 'Teknisi berhasil diperbarui' : 'Teknisi berhasil ditambahkan');
        setShowModal(false);
        setCurrentTeknisi({});
        fetchTeknisi();
      } else {
        toast.error(result.error || 'Gagal menyimpan teknisi');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleEdit = (item: Teknisi) => {
    setCurrentTeknisi(item);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus teknisi ini?')) return;

    try {
      const response = await fetch(`/api/teknisi?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Teknisi berhasil dihapus');
        fetchTeknisi();
      } else {
        toast.error('Gagal menghapus teknisi');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleAdd = () => {
    setCurrentTeknisi({ status: 'active' });
    setEditMode(false);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-500/20 text-green-500">
        <Power className="w-3 h-3 mr-1" />
        Aktif
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-500">
        <Power className="w-3 h-3 mr-1" />
        Nonaktif
      </Badge>
    );
  };

  const filteredTeknisi = teknisi.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold  flex items-center gap-3 mb-2">
            <Wrench className="h-8 w-8 text-amber-500" />
            Manajemen Teknisi
          </h1>
          <p className="text-muted-foreground">Kelola akun dan data teknisi service</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Teknisi</p>
                  <p className="text-2xl font-bold ">{teknisi.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Teknisi Aktif</p>
                  <p className="text-2xl font-bold text-green-500">
                    {teknisi.filter((t) => t.status === 'active').length}
                  </p>
                </div>
                <Power className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Nonaktif</p>
                  <p className="text-2xl font-bold text-red-500">
                    {teknisi.filter((t) => t.status === 'inactive').length}
                  </p>
                </div>
                <Power className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Cari nama atau username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10  "
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]  ">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAdd}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Teknisi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teknisi Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="">Data Teknisi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
              </div>
            ) : filteredTeknisi.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada teknisi ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="">
                      <TableHead className="">Nama</TableHead>
                      <TableHead className="">Username</TableHead>
                      <TableHead className="">Kontak</TableHead>
                      <TableHead className="">Spesialisasi</TableHead>
                      <TableHead className="">Status</TableHead>
                      <TableHead className="">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeknisi.map((item) => (
                      <TableRow key={item.id} className="">
                        <TableCell className=" font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-amber-500" />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className=" font-mono text-sm">
                          {item.username}
                        </TableCell>
                        <TableCell className="">
                          <div className="space-y-1">
                            {item.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {item.phone}
                              </div>
                            )}
                            {item.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                {item.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          {item.specialization ? (
                            <div className="flex items-center gap-1">
                              <Award className="h-3 w-3 text-amber-500" />
                              <span className="text-xs">{item.specialization}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className=" border-amber-500/20  max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-amber-500">
                {editMode ? 'Edit Teknisi' : 'Tambah Teknisi Baru'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="">
                    Nama Lengkap *
                  </Label>
                  <Input
                    id="name"
                    value={currentTeknisi.name || ''}
                    onChange={(e) =>
                      setCurrentTeknisi({ ...currentTeknisi, name: e.target.value })
                    }
                    className=" "
                    placeholder="Nama lengkap teknisi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    value={currentTeknisi.username || ''}
                    onChange={(e) =>
                      setCurrentTeknisi({ ...currentTeknisi, username: e.target.value })
                    }
                    className="  font-mono"
                    placeholder="username.teknisi"
                    disabled={editMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="">
                  Password {editMode ? '(Kosongkan jika tidak diubah)' : '*'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={currentTeknisi.password || ''}
                  onChange={(e) =>
                    setCurrentTeknisi({ ...currentTeknisi, password: e.target.value })
                  }
                  className=" "
                  placeholder={editMode ? 'Masukkan password baru' : 'Minimal 6 karakter'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="">
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    value={currentTeknisi.phone || ''}
                    onChange={(e) =>
                      setCurrentTeknisi({ ...currentTeknisi, phone: e.target.value })
                    }
                    className=" "
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={currentTeknisi.email || ''}
                    onChange={(e) =>
                      setCurrentTeknisi({ ...currentTeknisi, email: e.target.value })
                    }
                    className=" "
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization" className="">
                  Spesialisasi
                </Label>
                <Textarea
                  id="specialization"
                  value={currentTeknisi.specialization || ''}
                  onChange={(e) =>
                    setCurrentTeknisi({ ...currentTeknisi, specialization: e.target.value })
                  }
                  className=" "
                  placeholder="Contoh: Hardware, Software, Network"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="">
                  Status
                </Label>
                <Select
                  value={currentTeknisi.status || 'active'}
                  onValueChange={(value) =>
                    setCurrentTeknisi({ ...currentTeknisi, status: value as 'active' | 'inactive' })
                  }
                >
                  <SelectTrigger className=" ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentTeknisi({});
                  }}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  {editMode ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
