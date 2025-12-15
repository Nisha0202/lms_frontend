import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google'; // Added Playfair for headers
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '../components/Navbar';
import { ToastProvider } from '@/components/providers/ToastProvider';
import Footer from '@/components/Footer';
import ConfirmToast from '@/components/ConfirmToast';

// 1. Setup Fonts: Inter for UI, Playfair for elegant Headings
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter' 
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Course Master',
  description: 'Empowering learning through connection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      {/* 2. Added 'antialiased' for sharp text */}
      {/* 3. Added flex/flex-col to ensure Footer stays at the bottom */}
      <body className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-white">
        
        <AuthProvider>  
          <Navbar /> 
          
          <ToastProvider>
            {/* 'flex-grow' pushes the footer down */}
            <main className=" grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              {children}
              <ConfirmToast />
            </main>
          </ToastProvider>

         <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}