'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Wrench,
  Target,
  MessageSquare,
  FolderTree,
  LogOut,
  Menu,
  X,
  UserCog,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Package, label: 'Produk', href: '/admin/produk' },
  { icon: FolderTree, label: 'Kategori', href: '/admin/kategori' },
  { icon: ShoppingBag, label: 'Pesanan', href: '/admin/pesanan' },
  { icon: Ticket, label: 'Voucher', href: '/admin/voucher' },
  { icon: Wrench, label: 'Booking Service', href: '/admin/booking' },
  { icon: UserCog, label: 'Teknisi', href: '/admin/teknisi' },
  { icon: Target, label: 'Target CRM', href: '/admin/target' },
  { icon: MessageSquare, label: 'Chat', href: '/admin/chat' },
  { icon: MessageSquare, label: 'Keluhan', href: '/admin/keluhan' },
  { icon: Users, label: 'User', href: '/admin/user' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast.error('Akses ditolak', {
        description: 'Silakan login terlebih dahulu.',
      });
      router.push('/auth/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      console.log('Admin layout - checking user:', user);
      if (user.role !== 'admin') {
        toast.error('Akses ditolak', {
          description: 'Anda tidak memiliki akses ke halaman admin.',
        });
        router.push('/client/produk');
      }
    } catch (err) {
      console.error('Error parsing user:', err);
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      toast.success('Logout berhasil', {
        description: 'Anda telah keluar dari sistem.',
      });
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout gagal', {
        description: 'Terjadi kesalahan saat logout.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-amber-600 dark:text-amber-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-amber-600 dark:text-amber-500">CHICHA ADMIN</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <NotificationBell />
              <Link href="/" className="hidden sm:block">
                <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10">
                  Home
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-600 dark:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 min-h-screen border-r bg-card/30 p-6">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-500 border-l-4 border-amber-500'
                        : 'text-foreground hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          >
            <aside 
              className="w-64 h-full bg-card border-r p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start transition-all ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-500 border-l-4 border-amber-500'
                            : 'text-foreground hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
