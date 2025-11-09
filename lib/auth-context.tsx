'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  requireAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Public routes (tidak perlu login)
    const publicRoutes = ['/', '/client/produk', '/auth/login', '/auth/register'];
    
    // Routes yang match pattern /client/produk/[id]
    const isProductDetail = pathname?.startsWith('/client/produk/') && pathname !== '/client/produk';

    // Check localStorage for user data on mount
    const checkAuth = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const localUser = JSON.parse(userStr);
          
          // Set user immediately from localStorage
          setUser(localUser);
          
          // Then verify with server in background
          try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
              const data = await response.json();
              // Update with fresh data from server
              setUser(data.user);
              // Sync localStorage
              localStorage.setItem('user', JSON.stringify(data.user));
            } else {
              // Cookie expired but localStorage still has data
              console.warn('Cookie expired, user needs to re-login');
              // Keep localStorage user for now, but they'll need to login again for protected actions
            }
          } catch (error) {
            console.error('Auth verification error:', error);
            // Network error, keep using localStorage data
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    toast.success('Logout berhasil', {
      description: 'Anda telah keluar dari akun',
    });
    router.push('/');
  };

  const requireAuth = (): boolean => {
    if (!user) {
      toast.error('Login diperlukan', {
        description: 'Silakan login untuk mengakses fitur ini',
      });
      router.push('/auth/login?redirect=' + pathname);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
