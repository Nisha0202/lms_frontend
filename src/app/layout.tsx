import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth'; // Import this
import Navbar from '../components/Navbar';         // Import this

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LMS Platform',
  description: 'Learn online courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`{inter.className}min-h-screen bg-gray-50`}>
        
        <AuthProvider>
          <Navbar /> 
          <main className="">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}