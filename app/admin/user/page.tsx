'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Users, Shield, Wrench, Eye } from 'lucide-react';
import { User } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
        if (selectedUser?.id === userId) {
          setSelectedUser({ ...selectedUser, role: newRole as 'admin' | 'teknisi' | 'user' });
        }
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const openDetailDialog = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-500 border-red-500/50',
      teknisi: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
      user: 'bg-green-500/20 text-green-500 border-green-500/50',
    };

    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      admin: Shield,
      teknisi: Wrench,
      user: Users,
    };

    const Icon = icons[role] || Users;

    return (
      <Badge className={colors[role] || ''}>
        <Icon className="h-3 w-3 mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(user => user.role === filterRole);

  const adminCount = users.filter(u => u.role === 'admin').length;
  const teknisiCount = users.filter(u => u.role === 'teknisi').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold  flex items-center gap-3">
              <Users className="h-8 w-8 text-amber-500" />
              Manajemen User & Teknisi
            </h2>
            <p className="text-muted-foreground mt-2">Kelola pengguna dan teknisi sistem</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm border-red-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Admin</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{adminCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Administrator</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Teknisi</CardTitle>
              <Wrench className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{teknisiCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Service team</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{userCount}</div>
              <p className="text-xs text-muted-foreground mt-1">User biasa</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Total User</CardTitle>
              <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua pengguna</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="">Filter Role:</span>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48  ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all" className="">Semua Role</SelectItem>
                  <SelectItem value="admin" className="">Admin</SelectItem>
                  <SelectItem value="teknisi" className="">Teknisi</SelectItem>
                  <SelectItem value="user" className="">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="">Daftar User</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total: {filteredUsers.length} pengguna
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className=" hover:bg-muted/50">
                    <TableHead className="text-amber-500">Nama</TableHead>
                    <TableHead className="text-amber-500">Email</TableHead>
                    <TableHead className="text-amber-500">Phone</TableHead>
                    <TableHead className="text-amber-500">Role</TableHead>
                    <TableHead className="text-amber-500">Tanggal Daftar</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className=" hover:bg-muted/30">
                      <TableCell className="font-medium ">{user.name}</TableCell>
                      <TableCell className="">{user.email}</TableCell>
                      <TableCell className="">{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="">
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetailDialog(user)}
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
          <DialogContent className=" ">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Detail User</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Informasi lengkap pengguna
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="shadow-sm p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Nama:</span>
                    <span className=" font-semibold">{selectedUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Email:</span>
                    <span className="">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Phone:</span>
                    <span className="">{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Role:</span>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Tanggal Daftar:</span>
                    <span className="">
                      {new Date(selectedUser.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">User ID:</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {selectedUser.id}
                    </span>
                  </div>
                </div>

                <div className="shadow-sm p-4 rounded-lg">
                  <Label className=" mb-3 block">Ubah Role</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateUserRole(selectedUser.id, 'user')}
                      className={`flex-1 ${
                        selectedUser.role === 'user'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      User
                    </Button>
                    <Button
                      onClick={() => updateUserRole(selectedUser.id, 'teknisi')}
                      className={`flex-1 ${
                        selectedUser.role === 'teknisi'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Teknisi
                    </Button>
                    <Button
                      onClick={() => updateUserRole(selectedUser.id, 'admin')}
                      className={`flex-1 ${
                        selectedUser.role === 'admin'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailOpen(false)}
                className=" "
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
