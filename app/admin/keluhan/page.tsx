'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { MessageSquare, Eye, Reply } from 'lucide-react';
import { Complaint } from '@/lib/types';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('/api/complaints');
      const data = await response.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReplyDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.reply || '');
    setIsReplyDialogOpen(true);
  };

  const saveReply = async () => {
    if (!selectedComplaint) return;

    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: replyText,
          status: 'dibalas',
        }),
      });

      if (response.ok) {
        fetchComplaints();
        setIsReplyDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving reply:', error);
    }
  };

  const markAsRead = async (complaintId: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dibaca' }),
      });

      if (response.ok) {
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'belum dibaca': 'bg-red-500/20 text-red-500 border-red-500/50',
      'dibaca': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
      'dibalas': 'bg-green-500/20 text-green-500 border-green-500/50',
    };

    return (
      <Badge className={colors[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredComplaints = filterStatus === 'all'
    ? complaints
    : complaints.filter(complaint => complaint.status === filterStatus);

  const unreadCount = complaints.filter(c => c.status === 'belum dibaca').length;
  const repliedCount = complaints.filter(c => c.status === 'dibalas').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold  flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-amber-500" />
              Manajemen Keluhan & Ulasan
            </h2>
            <p className="text-muted-foreground mt-2">Kelola feedback dan keluhan pelanggan</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-red-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Belum Dibaca</CardTitle>
              <MessageSquare className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{unreadCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Perlu perhatian</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Sudah Dibalas</CardTitle>
              <Reply className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{repliedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Telah ditanggapi</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Total Keluhan</CardTitle>
              <MessageSquare className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{complaints.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Semua keluhan</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="">Filter Status:</span>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48  ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all" className="">Semua Status</SelectItem>
                  <SelectItem value="belum dibaca" className="">Belum Dibaca</SelectItem>
                  <SelectItem value="dibaca" className="">Dibaca</SelectItem>
                  <SelectItem value="dibalas" className="">Dibalas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="">Daftar Keluhan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total: {filteredComplaints.length} keluhan
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
                    <TableHead className="text-amber-500">Pesan</TableHead>
                    <TableHead className="text-amber-500">Order ID</TableHead>
                    <TableHead className="text-amber-500">Status</TableHead>
                    <TableHead className="text-amber-500">Tanggal</TableHead>
                    <TableHead className="text-amber-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id} className=" hover:bg-muted/30">
                      <TableCell className="">
                        <div>
                          <div className="font-medium">{complaint.user?.name}</div>
                          <div className="text-sm text-muted-foreground">{complaint.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className=" max-w-md">
                        <p className="truncate">{complaint.message}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {complaint.order_id ? complaint.order_id.slice(0, 8) + '...' : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="">
                        {new Date(complaint.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {complaint.status === 'belum dibaca' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(complaint.id)}
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReplyDialog(complaint)}
                            className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Balas
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

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="  max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-amber-500">Balas Keluhan</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Dari: {selectedComplaint?.user?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4 py-4">
                {/* Original Message */}
                <div className="shadow-sm p-4 rounded-lg">
                  <h4 className="font-semibold  mb-2">Pesan Keluhan:</h4>
                  <p className=" text-sm">{selectedComplaint.message}</p>
                  {selectedComplaint.order_id && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Order ID: {selectedComplaint.order_id}
                    </p>
                  )}
                </div>

                {/* Reply Input */}
                <div className="space-y-2">
                  <Label htmlFor="reply" className="">Balasan Admin</Label>
                  <Textarea
                    id="reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis balasan untuk pelanggan..."
                    className=" "
                    rows={5}
                  />
                </div>

                {selectedComplaint.reply && (
                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-500 mb-2 text-sm">Balasan Sebelumnya:</h4>
                    <p className=" text-sm">{selectedComplaint.reply}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReplyDialogOpen(false)}
                className=" "
              >
                Batal
              </Button>
              <Button onClick={saveReply} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Reply className="h-4 w-4 mr-2" />
                Kirim Balasan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
