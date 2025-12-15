'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Lock, Mail, User, Loader2, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate email format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- 1. Client-Side Validation ---
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    // ---------------------------------

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. You may already have an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. BACKGROUND: Warm Stone-50
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
      
      {/* 2. HEADER BRANDING */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        {/* Brand Icon */}
        <div className="mx-auto h-12 w-12 bg-orange-100 text-orange-700 rounded-xl flex items-center justify-center mb-4">
           <GraduationCap size={24} />
        </div>

        {/* Serif Font for Academic Vibe */}
        <h2 className="text-3xl font-serif font-bold tracking-tight text-stone-900">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Join thousands of students regarding their future
        </p>
      </div>

      {/* 3. MAIN CARD */}
      {/* Added border-t-4 border-orange-700 for brand consistency */}
      <div className="w-full max-w-md bg-white px-8 py-10 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-stone-900">
              Full Name
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                // Focus ring: Orange
                className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400  sm:text-sm sm:leading-6 transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-stone-900">
              Email address
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400  sm:text-sm sm:leading-6 transition-all shadow-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-stone-900">
              Password
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400  sm:text-sm sm:leading-6 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-2 text-xs text-stone-500">
              Must be at least 6 characters long.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-lg bg-orange-700 px-3 py-3 text-sm font-bold text-white shadow-md hover:bg-orange-800 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-6 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link href="/signin" className="font-bold text-orange-700 hover:underline hover:text-orange-800 transition">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}