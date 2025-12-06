'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    // 1. GLASSMORPHISM HEADER: Sticky, semi-transparent white/gray with blur
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white backdrop-blur-md">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO SECTION */}
          <div className="shrink-0 flex items-center gap-2">
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
              <BookOpen size={16} />
            </div>
            <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900 hover:text-zinc-700 transition">
              Course<span className="text-zinc-500 font-normal">Master</span>
            </Link>
          </div>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/courses" 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
            >
              Browse Courses
            </Link>

            {!isAuthenticated ? (
              // GUEST STATE
              <div className="flex items-center gap-4">
                <Link 
                  href="/signin" 
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  href="/register" 
                  className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-transform hover:bg-zinc-800 hover:scale-105 active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              // LOGGED IN STATE
              <div className="flex items-center gap-6">
                {/* Dashboard Link */}
                <Link 
                  href={user?.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>

                {/* Divider */}
                <div className="h-6 w-px bg-zinc-200"></div>

                {/* User Profile Area */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-semibold text-zinc-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">{user?.role}</p>
                  </div>
                  
                  {/* User Avatar Placeholder */}
                  <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <User size={16} />
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-md transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {/* Added subtle animation classes for smoothness */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-2">
          <Link 
            href="/courses" 
            className="block text-base font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 px-3 py-2 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Browse Courses
          </Link>

          {!isAuthenticated ? (
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <Link 
                href="/signin" 
                className="block w-full text-center text-zinc-600 font-medium py-2 hover:bg-zinc-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link 
                href="/register" 
                className="block w-full text-center bg-zinc-900 text-white font-medium py-2.5 rounded-lg hover:bg-zinc-800"
                onClick={() => setIsOpen(false)}
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="space-y-1 pt-4 border-t border-zinc-100">
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-zinc-900">{user?.name}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
              <Link 
                href={user?.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"}
                className="flex items-center gap-3 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}