'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

interface AuthResponse {
  token: string;
  user: User;
}

// 1. Add 'loading' to the interface
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 2. Create the loading state (Start as true)
  const [loading, setLoading] = useState(true); 

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


useEffect(() => {
  if (!loading && isAuthenticated && user) {
    const redirectPath =
      user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

    router.replace(redirectPath);
  }
}, [loading, isAuthenticated, user, router]);



  const login = async (email: string, password: string) => {
  try {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { token, user } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'admin') {
      document.cookie = `adminToken=${token}; path=/; max-age=86400;`;
    }

    setUser(user);
    setIsAuthenticated(true);

    // redirect ONLY after success
    router.push(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  } catch (error: any) {
    // Throw the error back to LoginPage UI
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
    }

    setUser(user);
    setIsAuthenticated(true);
    router.push(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = "adminToken=; path=/; max-age=0;";
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  // 4. Expose 'loading' in the value
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