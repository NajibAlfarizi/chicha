'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { useChatRooms } from '@/lib/useChat';
import { useAuth } from '@/lib/auth-context';

export function ClientHeader() {
  const { user } = useAuth();
  const { totalUnread } = useChatRooms(user?.id, 'customer');

  return (
    <header className="border-b bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Image */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo-chicha.jpg" 
              alt="Chicha Mobile Logo" 
              width={45} 
              height={45} 
              className="rounded-full object-cover"
            />
            <span className="text-xl font-bold text-amber-600 dark:text-amber-500 hidden sm:inline">
              Chicha Mobile
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Cari produk..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/client/produk" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Produk
            </Link>
            <Link href="/client/booking" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Service
            </Link>
            <Link href="/client/track" className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
              Track Service
            </Link>
            <ThemeToggle />
            <NotificationBell />
            <Link href="/client/chat">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="w-5 h-5" />
                {totalUnread > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </div>
                )}
              </Button>
            </Link>
            <Link href="/client/keranjang">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/client/akun">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </nav>

          {/* Mobile - Only Logo and Theme Toggle */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
