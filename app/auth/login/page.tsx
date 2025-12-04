'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, Lock, AlertCircle, Wrench, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-0">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-sm">
          <div className="max-w-md space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl">
                <Smartphone className="h-16 w-16 text-white" />
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Chicha Mobile
              </h1>
              <p className="text-lg text-gray-600">
                Sparepart handphone terpercaya dengan layanan service profesional
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg">
                <div className="text-3xl font-bold text-amber-600">500+</div>
                <div className="text-sm text-gray-600">Produk</div>
              </div>
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg">
                <div className="text-3xl font-bold text-amber-600">1000+</div>
                <div className="text-sm text-gray-600">Pelanggan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Glass Card Container */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/60 p-8 lg:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  Selamat Datang!
                </h2>
                <p className="text-gray-600">
                  Masuk ke akun Anda untuk melanjutkan
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-2 border-amber-200 focus:border-amber-500 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 pr-12 h-12 bg-white/60 backdrop-blur-sm border-2 border-amber-200 focus:border-amber-500 rounded-xl text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-3 text-gray-500">atau</span>
                </div>
              </div>

              <Link href="/teknisi/login">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-amber-300 bg-white/60 backdrop-blur-sm text-amber-600 hover:bg-amber-50 rounded-xl font-medium transition-all"
                >
                  <Wrench className="mr-2 h-5 w-5" />
                  Login Teknisi
                </Button>
              </Link>

              <div className="text-center text-sm mt-6">
                <span className="text-gray-600">Belum punya akun? </span>
                <Link href="/auth/register" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Daftar sekarang
                </Link>
              </div>

              <div className="text-center text-sm mt-4">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  ← Kembali ke beranda
                </Link>
              </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
