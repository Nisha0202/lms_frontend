import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google'; 
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '../components/Navbar';
import { ToastProvider } from '@/components/providers/ToastProvider';
import Footer from '@/components/Footer';
import ConfirmToast from '@/components/ConfirmToast';

// 1. Optimize Fonts: Add 'display: swap' to improve Core Web Vitals (LCP/CLS)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', 
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// 2. Define the Base URL (Critical for Open Graph images and Canonical URLs)
const siteUrl =  'https://coursemaster-frontend-kappa-one.vercel.app/';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// 3. Expanded Metadata Object
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  
  title: {
    default: 'Course Master | Master New Skills Online',
    template: '%s | Course Master',
  },
  
  description: 'Join Course Master to connect with experts and master new skills. The ultimate platform for empowering learning through community connection.',
  
  keywords: ['online courses', 'learning platform', 'education', 'skills', 'community learning'],
  
  authors: [{ name: 'Course Master Team' }],
  
  // Canonical URL (prevents duplicate content issues)
  alternates: {
    canonical: '/',
  },

  // Open Graph: How your link looks when shared on Facebook/LinkedIn/Discord
  openGraph: {
    title: 'Course Master | Master New Skills Online',
    description: 'Empowering learning through connection. Join our community today.',
    url: siteUrl,
    siteName: 'Course Master',
    images: [
      {
        url: 'https://i.pinimg.com/1200x/70/48/b3/7048b30c361e2f0418300d69d6faaca3.jpg', 
        width: 1200,
        height: 630,
        alt: 'Course Master Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Cards: How your link looks on X (Twitter)
  twitter: {
    card: 'summary_large_image',
    title: 'Course Master | Master New Skills Online',
    description: 'Empowering learning through connection.',
    images: ['https://i.pinimg.com/1200x/70/48/b3/7048b30c361e2f0418300d69d6faaca3.jpg'], 
    creator: '@yourhandle',
  },
  
  // Robots: explicit instructions for crawlers
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-black">

        <AuthProvider>  
          <Navbar /> 
          
          <ToastProvider>
            <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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