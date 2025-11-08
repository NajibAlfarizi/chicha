'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Lock, User, AlertCircle } from 'lucide-react';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TeknisiLoginPage() {
  const router = useRouter();
  const { login } = useTeknisiAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.username, formData.password);

      if (success) {
        toast.success('Login berhasil!', {
          description: 'Selamat datang kembali',
        });
        router.push('/teknisi/dashboard');
      } else {
        setError('Username atau password salah');
        toast.error('Login gagal', {
          description: 'Periksa kembali username dan password Anda',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan. Coba lagi.');
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat terhubung ke server',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 border-amber-500/20 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Login Teknisi</CardTitle>
              <p className="text-slate-400 text-sm mt-2">
                Masuk ke panel teknisi Chicha Mobile
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white"
                    placeholder="username.teknisi"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="pl-10 bg-slate-900/50 border-slate-700 text-white"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-slate-900 border-r-transparent"></div>
                    Loading...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Bukan teknisi?{' '}
                <Link href="/auth/login" className="text-amber-500 hover:text-amber-400 font-semibold">
                  Login sebagai Customer
                </Link>
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Atau{' '}
                <Link href="/" className="text-slate-400 hover:text-slate-300">
                  Kembali ke Beranda
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          Panel khusus untuk teknisi service Chicha Mobile
        </p>
      </div>
    </div>
  );
}
