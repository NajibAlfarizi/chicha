'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Lock, User, AlertCircle, Eye, EyeOff, Settings } from 'lucide-react';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TeknisiLoginPage() {
  const router = useRouter();
  const { login } = useTeknisiAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Liquid Glass Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-0">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent backdrop-blur-sm">
          <div className="max-w-md space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                <Wrench className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Panel Teknisi
              </h1>
              <p className="text-base text-gray-600">
                Kelola booking dan layanan service dengan mudah
              </p>
            </div>
            <div className="space-y-3 mt-6">
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Manajemen Booking</div>
                  <div className="text-xs text-gray-600">Update status dan progress service</div>
                </div>
              </div>
              <div className="backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/60 shadow-lg flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">Track Progress</div>
                  <div className="text-xs text-gray-600">Pantau perkembangan pekerjaan real-time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Glass Card Container */}
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/60 p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  Login Teknisi
                </h2>
                <p className="text-sm text-gray-600">
                  Masuk ke panel teknisi Chicha Mobile
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
                  <Label htmlFor="username" className="text-sm text-gray-700 font-medium">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="pl-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-blue-200 focus:border-blue-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                      placeholder="username.teknisi"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="pl-10 pr-10 h-10 bg-white/60 backdrop-blur-sm border-2 border-blue-200 focus:border-blue-500 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      Loading...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-3 text-gray-500">atau</span>
                  </div>
                </div>

                <Link href="/auth/login">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-2 border-blue-300 bg-white/60 backdrop-blur-sm text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition-all"
                  >
                    Login sebagai Customer
                  </Button>
                </Link>

                <div className="text-center text-xs mt-3">
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
