'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        // Check if user session exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up beforeunload event listener
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user) {
        e.preventDefault();
        e.returnValue = 'Please logout before closing the browser';
        return 'Please logout before closing the browser';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      // Call your login API here
      // const response = await authApi.login({ access: username, verify: password });
      
      // For now, we'll just set a mock user
      const mockUser = { username };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call your logout API here if needed
      // await authApi.logout();
      
      // Clear user data
      setUser(null);
      localStorage.removeItem('user');
      
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
