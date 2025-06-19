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
          const parsedUser = JSON.parse(storedUser);
          // Only update state if user is different to prevent unnecessary re-renders
          setUser(prevUser => JSON.stringify(prevUser) === storedUser ? prevUser : parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up beforeunload event listener
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        e.preventDefault();
        e.returnValue = 'Please logout before closing the browser';
        return 'Please logout before closing the browser';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Removed user from dependencies to prevent infinite loop

  const login = async (username: string, password: string) => {
    try {
      // Call your login API here
      // const response = await authApi.login({ access: username, verify: password });
      
      // For now, we'll just set a mock user
      const mockUser = { username };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      document.cookie = 'isAuthenticated=true; path=/;';
      
      router.push('/patients');
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
      // Clear the authentication cookie
      document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Force a full page reload to clear any state
      window.location.href = '/login';
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
