'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { LayoutDashboard, Wrench, LogOut, Menu, X, MessageSquare } from 'lucide-react';
import { useTeknisiAuth } from '@/lib/teknisi-auth-context';

const TeknisiUserInfo = dynamic(() => import('./TeknisiUserInfo').then(mod => ({ default: mod.TeknisiUserInfo })), {
  ssr: false,
  loading: () => <div className="w-24 h-10" />,
});

interface TeknisiLayoutProps {
  children: ReactNode;
}

export default function TeknisiLayout({ children }: TeknisiLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { teknisi, logout } = useTeknisiAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.push('/teknisi/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/teknisi/dashboard', icon: LayoutDashboard },
    { name: 'Services', href: '/teknisi/service', icon: Wrench },
    { name: 'Chat', href: '/teknisi/chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 border-b border-amber-200/50 dark:border-amber-900/30 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image 
                src="/logo-chicha.jpg" 
                alt="Chicha Mobile Logo" 
                width={40} 
                height={40} 
                className="rounded-full object-cover shadow-lg"
              />
              <div>
                <h1 className="text-lg font-bold text-amber-600 dark:text-amber-400">Chicha Mobile</h1>
                <p className="text-xs text-muted-foreground">Teknisi Panel</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-orange-600'
                          : 'hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 hover:text-amber-700 dark:hover:text-amber-400'
                      }
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Info & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <TeknisiUserInfo />
              <ThemeToggle />
              <NotificationBell />
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? 'text-amber-600 dark:text-amber-500 bg-amber-500/10'
                          : 'hover:text-amber-600 dark:hover:text-amber-500 hover:bg-amber-500/10'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
              <div className="pt-4 border-t">
                <div className="px-4 py-2">
                  <TeknisiUserInfo />
                </div>
                <div className="px-4 flex items-center justify-between mt-2">
                  <span className="text-sm">Theme</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full border-red-500 text-red-600 dark:text-red-500 hover:bg-red-500/10 mt-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          © 2025 Chicha Mobile - Teknisi Service Panel
        </div>
      </footer>
    </div>
  );
}
