'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Search,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', badge: null },
  { icon: Package, label: 'Produk', href: '/admin/produk', badge: null },
  { icon: FolderTree, label: 'Kategori', href: '/admin/kategori', badge: null },
  { icon: ShoppingBag, label: 'Pesanan', href: '/admin/pesanan', badge: 'new' },
  { icon: Ticket, label: 'Voucher', href: '/admin/voucher', badge: null },
  { icon: Wrench, label: 'Booking', href: '/admin/booking', badge: null },
  { icon: UserCog, label: 'Teknisi', href: '/admin/teknisi', badge: null },
  { icon: Target, label: 'Target CRM', href: '/admin/target', badge: null },
  { icon: MessageSquare, label: 'Chat', href: '/admin/chat', badge: '3' },
  { icon: MessageSquare, label: 'Keluhan', href: '/admin/keluhan', badge: null },
  { icon: Users, label: 'User', href: '/admin/user', badge: null },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof menuItems>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter menu items based on search query
    const filtered = menuItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  // Navigate to selected menu
  const handleSelectMenu = (href: string) => {
    router.push(href);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-amber-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Modern Header with Glassmorphism */}
      <header className="border-b border-amber-200/50 dark:border-amber-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Logo */}
              <Link href="/admin/dashboard" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
                <Image 
                  src="/logo-chicha.jpg" 
                  alt="Chicha Mobile Logo" 
                  width={40} 
                  height={40} 
                  className="rounded-full object-cover shadow-lg"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 dark:from-amber-400 dark:via-orange-400 dark:to-amber-500 bg-clip-text text-transparent">
                    CHICHA ADMIN
                  </h1>
                  <p className="text-xs text-muted-foreground">Management Panel</p>
                </div>
              </Link>
            </div>

            {/* Center - Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 search-container">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="pl-10 bg-white/50 dark:bg-slate-800/50 border-amber-200/50 dark:border-amber-900/30 focus:border-amber-500 dark:focus:border-amber-500"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-3 py-2">
                        Ditemukan {searchResults.length} hasil
                      </p>
                      {searchResults.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.href}
                            onClick={() => handleSelectMenu(item.href)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors text-left"
                          >
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.href}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* No Results */}
                {showSearchResults && searchQuery && searchResults.length === 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-amber-200/50 dark:border-amber-900/30 rounded-lg shadow-lg z-50 p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Tidak ada hasil untuk &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationBell />
              <Button
                onClick={handleLogout}
                size="sm"
                className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm"
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
        <aside className={`hidden lg:block ${sidebarCollapsed ? 'w-20' : 'w-72'} h-[calc(100vh-4rem)] sticky top-[4rem] border-r border-amber-200/50 dark:border-amber-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 overflow-y-auto`}>
          <div className="p-4 space-y-1">
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center mb-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
            </Button>

            {/* Menu Items */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start'} relative group transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-linear-to-r hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 hover:text-amber-700 dark:hover:text-amber-400'
                      }`}
                    >
                      <Icon className={`${sidebarCollapsed ? '' : 'mr-3'} h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={item.badge === 'new' ? 'default' : 'secondary'} 
                              className={`ml-auto text-xs ${
                                item.badge === 'new' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {sidebarCollapsed && item.badge && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          >
            <aside 
              className="w-72 h-full bg-white dark:bg-slate-900 border-r border-amber-200/50 dark:border-amber-900/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-amber-600 dark:text-amber-400">CHICHA</h2>
                      <p className="text-xs text-muted-foreground">Admin Panel</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="text-amber-600 dark:text-amber-400"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-amber-200/50 dark:border-amber-900/30"
                  />
                </div>

                {/* Mobile Menu */}
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start relative transition-all ${
                            isActive
                              ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-linear-to-r hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={item.badge === 'new' ? 'default' : 'secondary'} 
                              className={`text-xs ${
                                item.badge === 'new' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-amber-500 text-white'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
  
                </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-4rem)] ${sidebarCollapsed ? 'lg:ml-0' : ''}`}>
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
