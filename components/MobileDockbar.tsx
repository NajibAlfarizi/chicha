'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, User, ShoppingCart, Grid2x2, Search, X, Bell, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useNotifications } from '@/lib/useNotifications';

export default function MobileDockbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { unreadCount } = useNotifications(user?.id);

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

  // Menu utama yang tampil di dockbar (maksimal 3 item + More button)
  const mainNavItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/client/produk', icon: Package, label: 'Produk' },
    { href: '/client/keranjang', icon: ShoppingCart, label: 'Keranjang', badge: cartCount },
  ];

  // Menu tambahan yang ada di More menu
  const moreMenuItems = [
    { href: '/client/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/client/notifications', icon: Bell, label: 'Notifikasi', badge: unreadCount },
    { href: '/client/booking', icon: Package, label: 'Booking' },
    { href: '/client/track', icon: Search, label: 'Track' },
    { href: '/client/akun', icon: User, label: 'Akun' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Glassmorphism Dockbar */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-amber-500/20 shadow-[0_-10px_40px_rgba(251,191,36,0.1)]">
          <div className="flex items-center justify-around px-2 py-3">
            {/* Main Nav Items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300"
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-500 rounded-full" />
                  )}
                  
                  {/* Icon Container */}
                  <div
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                      ${active 
                        ? 'bg-amber-500 text-white scale-110 shadow-lg shadow-amber-500/50' 
                        : 'text-muted-foreground hover:text-amber-500 hover:bg-muted/50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    
                    {/* Badge for cart */}
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span
                    className={`
                      text-xs font-medium transition-all duration-300
                      ${active ? 'text-amber-500' : 'text-muted-foreground'}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setShowMoreMenu(true)}
              className="relative flex flex-col items-center gap-1 transition-all duration-300"
            >
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 text-muted-foreground hover:text-amber-500 hover:bg-muted/50">
                <Grid2x2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                More
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* More Menu - Bottom Sheet Style */}
      {showMoreMenu && (
        <>
          {/* Backdrop/Overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-background rounded-t-3xl shadow-2xl border-t border-amber-500/20">
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b">
                <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-500">
                  Menu Lainnya
                </h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-3 gap-4 p-6">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMoreMenu(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    >
                      <div className={`
                        relative w-16 h-16 rounded-2xl flex items-center justify-center
                        transition-all
                        ${active 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }
                      `}>
                        <Icon className="w-8 h-8" />
                        {/* Badge for notifications */}
                        {item.badge && item.badge > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {item.badge > 9 ? '9+' : item.badge}
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-medium text-center ${
                        active ? 'text-amber-600 dark:text-amber-500' : 'text-foreground'
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Safe Area Bottom Padding */}
              <div className="h-20" />
            </div>
          </div>
        </>
      )}
    </>
  );
}
