'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { ShoppingCart, Package, Wrench, User, Home, LogOut, LogIn, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import MobileDockbar from './MobileDockbar';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const isActive = (path: string) => pathname === path;

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      setCartCount(total);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo-chicha.jpg" 
                alt="Chicha Mobile Logo" 
                width={40} 
                height={40} 
                className="rounded-full object-cover shadow-lg md:w-[45px] md:h-[45px]"
              />
              <h1 className="text-lg md:text-2xl font-bold text-amber-600 dark:text-amber-500">CHICHA MOBILE</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className={isActive('/') ? 'text-amber-600 dark:text-amber-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}>
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/client/produk">
                <Button variant="ghost" size="sm" className={isActive('/client/produk') ? 'text-amber-600 dark:text-amber-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}>
                  <Package className="mr-2 h-4 w-4" />
                  Produk
                </Button>
              </Link>
              <Link href="/client/booking">
                <Button variant="ghost" size="sm" className={isActive('/client/booking') ? 'text-amber-600 dark:text-amber-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Service
                </Button>
              </Link>
              <Link href="/client/track">
                <Button variant="ghost" size="sm" className={isActive('/client/track') ? 'text-amber-600 dark:text-amber-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}>
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </Button>
              </Link>
              <Link href="/client/akun">
                <Button variant="ghost" size="sm" className={isActive('/client/akun') ? 'text-amber-600 dark:text-amber-500' : 'hover:text-amber-600 dark:hover:text-amber-500'}>
                  <User className="mr-2 h-4 w-4" />
                  Akun
                </Button>
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell - Desktop */}
              <div className="hidden md:block">
                <NotificationBell />
              </div>

              {/* Auth Buttons - Desktop */}
              {!isAuthenticated ? (
                <div className="hidden md:flex gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm" className="border-amber-500/50 text-amber-600 dark:text-amber-500 hover:bg-amber-500/10">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Halo, {user?.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-500/50 text-red-600 dark:text-red-500 hover:bg-red-500/10"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              )}

              {/* Cart Button */}
              <Link href="/client/keranjang">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white relative">
                  <ShoppingCart className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Keranjang</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-500/20 bg-slate-100 dark:bg-slate-900/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-amber-600 dark:text-amber-500 font-bold text-lg mb-4">CHICHA MOBILE</h3>
              <p className="text-slate-700 dark:text-slate-400 text-sm">
                Sparepart dan service handphone terpercaya dengan sistem reward pembelanjaan.
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-400 text-sm">
                <li><Link href="/client/produk" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Produk</Link></li>
                <li><Link href="/client/booking" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Booking Service</Link></li>
                <li><Link href="/client/track" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Track Service</Link></li>
                <li><Link href="/client/akun" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">Akun Saya</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Kontak</h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-400 text-sm">
                <li>Email: info@chichamobile.com</li>
                <li>Phone: +62 812-3456-7890</li>
                <li>WhatsApp: +62 812-3456-7890</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-4">Jam Operasional</h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-400 text-sm">
                <li>Senin - Jumat: 09:00 - 21:00</li>
                <li>Sabtu: 09:00 - 18:00</li>
                <li>Minggu: 10:00 - 16:00</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-slate-600 dark:text-slate-500 text-sm mt-8 pt-8 border-t border-slate-300 dark:border-slate-700">
            <p>&copy; 2025 Chicha Mobile. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Dockbar */}
      <MobileDockbar />
    </div>
  );
}
