'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Trophy, Gift, TrendingUp } from 'lucide-react';
import { Target as TargetType } from '@/lib/types';

export default function AdminTargetsPage() {
  const [targets, setTargets] = useState<TargetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<TargetType | null>(null);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [rewardText, setRewardText] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await fetch('/api/targets/all');
      const data = await response.json();
      setTargets(data.targets || []);
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openRewardDialog = (target: TargetType) => {
    setSelectedTarget(target);
    setRewardText(target.reward || '');
    setIsRewardDialogOpen(true);
  };

  const openTargetDialog = (target: TargetType) => {
    setSelectedTarget(target);
    setTargetAmount(target.target_amount.toString());
    setIsTargetDialogOpen(true);
  };

  const saveReward = async () => {
    if (!selectedTarget) return;

    try {
      const response = await fetch(`/api/targets/${selectedTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reward: rewardText,
          reward_claimed: false,
        }),
      });

      if (response.ok) {
        fetchTargets();
        setIsRewardDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving reward:', error);
    }
  };

  const saveTargetAmount = async () => {
    if (!selectedTarget) return;

    try {
      const response = await fetch(`/api/targets/${selectedTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_amount: parseFloat(targetAmount),
        }),
      });

      if (response.ok) {
        fetchTargets();
        setIsTargetDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving target amount:', error);
    }
  };

  const markRewardClaimed = async (targetId: string) => {
    try {
      const response = await fetch(`/api/targets/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reward_claimed: true }),
      });

      if (response.ok) {
        fetchTargets();
      }
    } catch (error) {
      console.error('Error marking reward as claimed:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusBadge = (status: string) => {
    return status === 'achieved' ? (
      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
        <Trophy className="h-3 w-3 mr-1" />
        Tercapai
      </Badge>
    ) : (
      <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">
        <TrendingUp className="h-3 w-3 mr-1" />
        Aktif
      </Badge>
    );
  };

  const achievedTargets = targets.filter(t => t.status === 'achieved').length;
  const activeTargets = targets.filter(t => t.status === 'active').length;
  const totalTargetAmount = targets.reduce((sum, t) => sum + Number(t.target_amount), 0);
  const totalCurrentAmount = targets.reduce((sum, t) => sum + Number(t.current_amount), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold  flex items-center gap-3">
              <Target className="h-8 w-8 text-amber-500" />
              Target CRM - Reward System
            </h2>
            <p className="text-muted-foreground mt-2">Kelola target pembelanjaan dan reward pelanggan</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-sm border-green-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Target Tercapai</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{achievedTargets}</div>
              <p className="text-xs text-muted-foreground mt-1">Pelanggan loyal</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-blue-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Target Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">{activeTargets}</div>
              <p className="text-xs text-muted-foreground mt-1">Sedang berjalan</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-amber-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Total Target</CardTitle>
              <Target className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                Rp {(totalTargetAmount / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">Akumulasi target</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium ">Total Pencapaian</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                Rp {(totalCurrentAmount / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total terkumpul</p>
            </CardContent>
          </Card>
        </div>

        {/* Targets Table - Desktop */}
        <Card className="shadow-sm hidden md:block">
          <CardHeader>
            <CardTitle className="">Daftar Target Pelanggan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Total: {targets.length} pelanggan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className=" hover:bg-muted/50">
                      <TableHead className="text-amber-500 min-w-[150px]">Pelanggan</TableHead>
                      <TableHead className="text-amber-500 w-[100px]">Target</TableHead>
                      <TableHead className="text-amber-500 w-[100px]">Pencapaian</TableHead>
                      <TableHead className="text-amber-500 w-[150px]">Progress</TableHead>
                      <TableHead className="text-amber-500 w-[90px]">Status</TableHead>
                      <TableHead className="text-amber-500 min-w-[150px]">Reward</TableHead>
                      <TableHead className="text-amber-500 text-right min-w-[200px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.map((target) => {
                      const progress = getProgressPercentage(
                        Number(target.current_amount),
                        Number(target.target_amount)
                      );
                      return (
                        <TableRow key={target.id} className=" hover:bg-muted/30">
                          <TableCell className="">
                            <div>
                              <div className="font-medium text-sm">{target.user?.name}</div>
                              <div className="text-xs text-muted-foreground">{target.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {(Number(target.target_amount) / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {(Number(target.current_amount) / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-12">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(target.status)}</TableCell>
                          <TableCell className="">
                            {target.reward ? (
                              <div className="flex items-center gap-1">
                                <Gift className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs line-clamp-1">{target.reward}</span>
                                {target.reward_claimed && (
                                  <Badge className="bg-green-500/20 text-green-500 text-xs">
                                    Diklaim
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">Belum diset</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTargetDialog(target)}
                                className="border-blue-500 text-blue-500 hover:bg-blue-500/10 text-xs px-2"
                              >
                                <Target className="h-3.5 w-3.5 mr-1" />
                                Set Target
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRewardDialog(target)}
                                className="border-amber-500 text-amber-500 hover:bg-amber-500/10 text-xs px-2"
                              >
                                <Gift className="h-3.5 w-3.5 mr-1" />
                                Reward
                              </Button>
                              {target.status === 'achieved' && target.reward && !target.reward_claimed && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markRewardClaimed(target.id)}
                                  className="border-green-500 text-green-500 hover:bg-green-500/10 text-xs px-2"
                                >
                                  Diklaim
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Targets Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : (
            <div className="space-y-3">
              {targets.map((target) => {
                const progress = getProgressPercentage(
                  Number(target.current_amount),
                  Number(target.target_amount)
                );
                return (
                  <Card key={target.id} className="shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{target.user?.name}</div>
                          <div className="text-xs text-muted-foreground">{target.user?.email}</div>
                        </div>
                        {getStatusBadge(target.status)}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Target</div>
                          <div className="font-semibold">
                            Rp {(Number(target.target_amount) / 1000000).toFixed(1)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Pencapaian</div>
                          <div className="font-semibold text-blue-500">
                            Rp {(Number(target.current_amount) / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Reward */}
                      {target.reward && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-amber-500" />
                            <span className="text-xs flex-1">{target.reward}</span>
                            {target.reward_claimed && (
                              <Badge className="bg-green-500/20 text-green-500 text-xs">
                                Diklaim
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTargetDialog(target)}
                          className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500/10 text-xs"
                        >
                          <Target className="h-3.5 w-3.5 mr-1" />
                          Set Target
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRewardDialog(target)}
                          className="flex-1 border-amber-500 text-amber-500 hover:bg-amber-500/10 text-xs"
                        >
                          <Gift className="h-3.5 w-3.5 mr-1" />
                          Reward
                        </Button>
                        {target.status === 'achieved' && target.reward && !target.reward_claimed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markRewardClaimed(target.id)}
                            className="flex-1 border-green-500 text-green-500 hover:bg-green-500/10 text-xs"
                          >
                            Diklaim
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Reward Dialog */}
        <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
          <DialogContent className=" ">
            <DialogHeader>
              <DialogTitle className="text-amber-500 flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Set Reward untuk Pelanggan
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Pelanggan: {selectedTarget?.user?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="shadow-sm p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target:</span>
                  <span className=" font-semibold">
                    Rp {Number(selectedTarget?.target_amount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pencapaian:</span>
                  <span className={`font-semibold ${selectedTarget?.status === 'achieved' ? 'text-green-500' : 'text-blue-500'}`}>
                    Rp {Number(selectedTarget?.current_amount).toLocaleString('id-ID')}
                  </span>
                </div>
                {selectedTarget?.status === 'achieved' ? (
                  <Badge className="bg-green-500/20 text-green-500 w-full justify-center">
                    ✓ TARGET TERCAPAI!
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/20 text-blue-500 w-full justify-center">
                    Target Belum Tercapai
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward" className="">Reward / Bonus</Label>
                <Input
                  id="reward"
                  value={rewardText}
                  onChange={(e) => setRewardText(e.target.value)}
                  placeholder="Contoh: Alat service gratis senilai Rp 500.000"
                  className=" "
                />
                <p className="text-xs text-muted-foreground">
                  {selectedTarget?.status === 'achieved' 
                    ? 'Pelanggan sudah mencapai target, berikan reward yang menarik!' 
                    : 'Set reward yang akan diberikan ketika pelanggan mencapai target'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRewardDialogOpen(false)}
                className=" "
              >
                Batal
              </Button>
              <Button onClick={saveReward} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Gift className="h-4 w-4 mr-2" />
                Simpan Reward
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Target Amount Dialog */}
        <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
          <DialogContent className=" ">
            <DialogHeader>
              <DialogTitle className="text-blue-500 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Set Target Belanja
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Pelanggan: {selectedTarget?.user?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="shadow-sm p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Belanja Saat Ini:</span>
                  <span className="text-blue-500 font-semibold">
                    Rp {Number(selectedTarget?.current_amount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target Saat Ini:</span>
                  <span className="font-semibold">
                    Rp {Number(selectedTarget?.target_amount).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="">Target Belanja Baru (Rp)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000000"
                  className=" "
                  step="100000"
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Atur target belanja yang harus dicapai pelanggan untuk mendapatkan reward
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTargetDialogOpen(false)}
                className=" "
              >
                Batal
              </Button>
              <Button onClick={saveTargetAmount} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Target className="h-4 w-4 mr-2" />
                Simpan Target
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
