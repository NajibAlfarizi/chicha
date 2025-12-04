'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff, ShoppingBag, Wrench as WrenchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirectTo = searchParams?.get('redirect') || null;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      toast.error('Password terlalu pendek', {
        description: 'Password harus minimal 6 karakter.',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after successful registration
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);
        
        toast.success('Registrasi berhasil!', {
          description: `Selamat datang, ${data.user.name}!`,
        });
        
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            router.push('/client/produk');
          }
        }, 1000);
      } else {
        setError(data.error || 'Registrasi gagal. Silakan coba lagi.');
        toast.error('Registrasi gagal', {
          description: data.error || 'Silakan coba lagi.',
        });
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      toast.error('Terjadi kesalahan', {
        description: 'Tidak dapat terhubung ke server.',
      });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/40 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-0">
        {/* Left Side - Register Form */}
        <div className="flex items-center justify-center p-8 lg:p-12 order-2 lg:order-1">
          <div className="w-full max-w-md">
            {/* Glass Card Container */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/60 p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1">
                  Daftar Akun Baru
                </h2>
                <p className="text-sm text-gray-600">
                  Bergabung dan nikmati kemudahan belanja
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

              <div className="space-y-1">
                <Label htmlFor="name" className="text-sm text-gray-700 font-medium">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-orange-200 focus:border-orange-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-orange-200 focus:border-orange-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-sm text-gray-700 font-medium">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-orange-200 focus:border-orange-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-orange-200 focus:border-orange-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimal 6 karakter</p>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>

              <div className="text-center text-xs mt-3">
                <span className="text-gray-600">Sudah punya akun? </span>
                <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                  Masuk sekarang
                </Link>
              </div>

              <div className="text-center text-xs mt-2">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  ← Kembali ke beranda
                </Link>
              </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent backdrop-blur-sm order-1 lg:order-2">
          <div className="max-w-md space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl">
                <ShoppingBag className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Bergabung Sekarang!
              </h1>
              <p className="text-base text-gray-600">
                Dapatkan akses ke produk berkualitas dan layanan service terbaik
              </p>
            </div>
            <div className="space-y-3 mt-6">
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Belanja Mudah</div>
                  <div className="text-xs text-gray-600">Ribuan produk sparepart original</div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <WrenchIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Service Profesional</div>
                  <div className="text-xs text-gray-600">Teknisi berpengalaman siap membantu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
