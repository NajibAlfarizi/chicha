'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Mail, Lock, AlertCircle, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams?.get('redirect') || null;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Debug: Log user data
        console.log('Login response:', data);
        console.log('User role:', data.user?.role);
        
        // Save user data to localStorage & auth context
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);
        
        // Show success toast
        toast.success('Login berhasil!', {
          description: `Selamat datang, ${data.user.name}`,
        });
        
        // Redirect based on redirect param or role after a short delay
        setTimeout(() => {
          console.log('Redirecting with role:', data.user.role);
          
          if (redirectTo) {
            // Redirect to requested page
            router.push(redirectTo);
          } else if (data.user.role === 'admin') {
            console.log('Redirecting to admin dashboard...');
            router.push('/admin/dashboard');
          } else {
            console.log('Redirecting to client produk...');
            router.push('/client/produk');
          }
        }, 500);
      } else {
        setError(data.error || 'Login gagal. Silakan coba lagi.');
        toast.error('Login gagal', {
          description: data.error || 'Silakan cek email dan password Anda.',
        });
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat terhubung ke server.',
      });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-amber-500/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-slate-900" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Chicha Mobile
          </CardTitle>
          <CardDescription className="text-slate-400">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/50 px-2 text-slate-400">atau</span>
              </div>
            </div>

            <Link href="/teknisi/login">
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <Wrench className="mr-2 h-4 w-4" />
                Login Teknisi
              </Button>
            </Link>

            <div className="text-center text-sm">
              <span className="text-slate-400">Belum punya akun? </span>
              <Link href="/auth/register" className="text-amber-500 hover:text-amber-400 font-medium">
                Daftar sekarang
              </Link>
            </div>

            <div className="text-center text-sm">
              <Link href="/" className="text-slate-400 hover:text-slate-300">
                ← Kembali ke beranda
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
