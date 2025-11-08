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
        setTeknisi(data.teknisi);
        localStorage.setItem('teknisi', JSON.stringify(data.teknisi));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setTeknisi(null);
    localStorage.removeItem('teknisi');
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
