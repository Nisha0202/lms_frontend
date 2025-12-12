'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { usePathname, useRouter } from 'next/navigation'; // Correct imports
import { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; 
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  // 1. Check LocalStorage on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    }
  }, []);

  // 2. Redirect Logic (The Fix)
  useEffect(() => {
    // Only auto-redirect if the user is on a "Public" page (Login/Register/Home)
    const publicPaths = ['/login', '/register', '/signin'];
    const isPublicPage = publicPaths.includes(pathname);

    if (!loading && isAuthenticated && user && isPublicPage) {
      const redirectPath = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";
      router.replace(redirectPath);
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        document.cookie = `adminToken=${token}; path=/; max-age=86400;`;
      } else {
        // Optional: Set student cookie if your middleware uses it
        document.cookie = `studentToken=${token}; path=/; max-age=86400;`;
      }

      setUser(user);
      setIsAuthenticated(true);

      router.push(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', { name, email, password });
    const { token, user } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'admin') {
      document.cookie = `adminToken=${token}; path=/; max-age=86400;`;
    } else {
      document.cookie = `studentToken=${token}; path=/; max-age=86400;`;
    }

    setUser(user);
    setIsAuthenticated(true);
    router.push(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookies
    document.cookie = "adminToken=; path=/; max-age=0;";
    document.cookie = "studentToken=; path=/; max-age=0;";
    
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};