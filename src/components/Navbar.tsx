'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    // NAVBAR CONTAINER
    // Changed border color to warm stone-200
    // kept backdrop-blur for modern feel, but strictly white background for cleanliness
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* 1. BRAND LOGO - The "University" Look */}
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-orange-700 text-white p-2 rounded-lg group-hover:bg-orange-800 transition-colors">
                {/* Changed icon to GraduationCap for more academic feel */}
                <GraduationCap size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-tight text-stone-900 leading-none">
                  CourseMaster
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
                  Learning Platform
                </span>
              </div>
            </Link>
          </div>

          {/* 2. DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-stone-600 hover:text-orange-700 transition-colors"
            >
              Browse Courses
            </Link>

            {!isAuthenticated ? (
              // GUEST STATE
              <div className="flex items-center gap-4">
                <Link
                  href="/signin"
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  // Primary Action Button: Uses the warm Orange/Terracotta
                  className="rounded-lg bg-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-800 hover:shadow-md transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              // LOGGED IN STATE
              <div className="flex items-center gap-6">
                
                {user?.role === 'admin' && (
                  <Link
                    href="/admin/grading"
                    className="text-sm font-medium text-stone-600 hover:text-orange-700 transition-colors"
                  >
                    Assessments
                  </Link>
                )}

                <Link
                  href={user?.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"}
                  className="group flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-orange-700 transition-colors"
                >
                  <LayoutDashboard size={18} className="group-hover:text-orange-700" />
                  <span>Dashboard</span>
                </Link>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-stone-200"></div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-stone-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-stone-500 capitalize">{user?.role}</p>
                  </div>

                  <div className="h-9 w-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600">
                    <User size={18} />
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
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
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-md transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-6 space-y-4 shadow-xl">
          <Link
            href="/courses"
            className="block text-base font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-3 py-3 rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            Browse Courses
          </Link>

          {!isAuthenticated ? (
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <Link
                href="/signin"
                className="block w-full text-center text-stone-600 font-medium py-3 hover:bg-stone-50 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block w-full text-center bg-orange-700 text-white font-bold py-3 rounded-lg hover:bg-orange-800 shadow-sm"
                onClick={() => setIsOpen(false)}
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-bold text-stone-900">{user?.name}</p>
                <p className="text-xs text-stone-500">{user?.email}</p>
              </div>
              
              <Link
                href={user?.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"}
                className="flex items-center gap-3 px-3 py-3 text-stone-600 hover:bg-stone-50 rounded-lg"
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
                className="w-full flex items-center gap-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
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