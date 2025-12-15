import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    // 1. BACKGROUND: Deep warm stone instead of cold gray
    // 2. BRAND STRIPE: The orange top border adds a premium 'University' feel
    <footer className="bg-stone-900 border-t-4 border-orange-700 text-stone-400 py-16 mt-auto">
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          
          {/* LOGO & ICON */}
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-stone-800 p-2 rounded-lg text-orange-600">
               <GraduationCap size={24} />
            </div>
            {/* Serif font applied here to match Navbar */}
            <span className="text-2xl font-serif font-bold text-stone-100 tracking-tight">
              CourseMaster
            </span>
          </div>

          {/* MISSION STATEMENT */}
          <p className="mb-8 max-w-md mx-auto text-stone-400 leading-relaxed text-sm">
            Empowering students with accessible education through connection, 
            mercy, and gratitude. Built for the modern learner.
          </p>

          {/* NAVIGATION LINKS */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium mb-12">
            <Link href="#" className="text-stone-300 hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-stone-300 hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-stone-300 hover:text-orange-500 transition-colors">
              Support
            </Link>
            <Link href="#" className="text-stone-300 hover:text-orange-500 transition-colors">
              Teach on CourseMaster
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="w-full max-w-xs h-px bg-stone-800 mb-8"></div>

          {/* COPYRIGHT */}
          <p className="text-xs text-stone-600">
            &copy; {new Date().getFullYear()} CourseMaster LMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}