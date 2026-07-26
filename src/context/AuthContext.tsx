import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/index.js';

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  isAdminOrSuper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pbda_token') || sessionStorage.getItem('pbda_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('pbda_token');
          sessionStorage.removeItem('pbda_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.removeItem('pbda_token');
        sessionStorage.removeItem('pbda_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, pass: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'লগইন করতে ব্যর্থ হয়েছে' };
      }

      if (rememberMe) {
        localStorage.setItem('pbda_token', data.token);
        sessionStorage.removeItem('pbda_token');
      } else {
        sessionStorage.setItem('pbda_token', data.token);
        localStorage.removeItem('pbda_token');
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না' };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pbda_token');
      sessionStorage.removeItem('pbda_token');
    }
    setToken(null);
    setUser(null);
  };

  const isAdminOrSuper = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        isAdminOrSuper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
