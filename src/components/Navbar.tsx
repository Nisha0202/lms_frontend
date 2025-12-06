'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className=" bg-gray-50 text-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-md font-semibold text-gray-800">
            LMS Platform
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600">
              Browse Courses
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'admin' ? (
                  <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link href="/student/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                    My Learning
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-2 pb-4 border-b border-gray-200">
            <Link href="/courses" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Browse Courses
            </Link>

            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  Login
                </Link>
                <Link href="/auth/register" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Register
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'admin' ? (
                  <Link href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link href="/student/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                    My Learning
                  </Link>
                )}
                <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
