'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Teknisi } from '@/lib/types';

interface TeknisiAuthContextType {
  teknisi: Teknisi | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const TeknisiAuthContext = createContext<TeknisiAuthContextType | undefined>(undefined);

export function TeknisiAuthProvider({ children }: { children: ReactNode }) {
  const [teknisi, setTeknisi] = useState<Teknisi | null>(() => {
    if (typeof window !== 'undefined') {
      const storedTeknisi = localStorage.getItem('teknisi');
      if (storedTeknisi) {
        try {
          return JSON.parse(storedTeknisi);
        } catch (error) {
          console.error('Error parsing teknisi data:', error);
          localStorage.removeItem('teknisi');
        }
      }
    }
    return null;
  });
  const [loading] = useState(false);
  const router = useRouter();

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/teknisi/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login API response:', data);
        
        // API returns 'user' key which contains both teknisi and admin data
        const userData = data.user;
        console.log('User data from API:', userData);
        console.log('User role:', userData.role);
        
        setTeknisi(userData);
        localStorage.setItem('teknisi', JSON.stringify(userData));
        console.log('Stored to localStorage:', userData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    // Call logout API to clear cookies
    try {
      await fetch('/api/teknisi/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Teknisi logout API error:', error);
    }
    
    // Clear local state and storage
    setTeknisi(null);
    localStorage.removeItem('teknisi');
    
    // Small delay to ensure storage is cleared
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Redirect to login
    router.push('/teknisi/login');
  };

  return (
    <TeknisiAuthContext.Provider
      value={{
        teknisi,
        isAuthenticated: !!teknisi,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </TeknisiAuthContext.Provider>
  );
}

export function useTeknisiAuth() {
  const context = useContext(TeknisiAuthContext);
  if (context === undefined) {
    throw new Error('useTeknisiAuth must be used within a TeknisiAuthProvider');
  }
  return context;
}
