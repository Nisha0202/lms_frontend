import type { Metadata } from 'next';
import { Trophy, Globe, Heart, ArrowRight} from 'lucide-react';

import Image from 'next/image'; 

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about the mission and team behind CourseMaster.',
};
// 1. Define simple SVG components for the brands so they never get deprecated
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="currentColor" // X icon usually looks better filled
    className={className}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      
      {/* 1. Header Section */}
      <section className="pt-24 pb-20 px-4 bg-white border-b border-stone-200">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-orange-700 font-bold uppercase tracking-wider text-sm mb-4 block">Our Story</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
            Democratizing education for the <br className="hidden md:block" /> modern digital era.
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto">
            CourseMaster was founded on the belief that high-quality education shouldn't be limited by geography or cost. We are building a global campus for everyone.
          </p>
        </div>
      </section>

      {/* 2. Stats Section */}
      <section className="py-12 bg-stone-900 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-orange-500 mb-2">12+</div>
              <div className="text-stone-400 text-sm uppercase tracking-wider">Expert Instructors</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-orange-500 mb-2">1.2k</div>
              <div className="text-stone-400 text-sm uppercase tracking-wider">Students Enrolled</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-orange-500 mb-2">4</div>
              <div className="text-stone-400 text-sm uppercase tracking-wider">Countries Reached</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-serif font-bold text-orange-500 mb-2">4.8</div>
              <div className="text-stone-400 text-sm uppercase tracking-wider">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Values */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            {/* Left: Team Photo */}
<div className="relative aspect-square md:aspect-4/3 bg-stone-200 rounded-2xl overflow-hidden shadow-lg group">
  <Image
    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    alt="CourseMaster Team collaborating in the office"
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-700"
    sizes="(max-width: 768px) 100vw, 50vw"
    priority
  />
 
  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
</div>

            {/* Right: Content */}
            <div className="space-y-8">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Driven by values, not just profit.</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">Accessibility First</h3>
                    <p className="text-stone-600">We optimize our platform to work on low-bandwidth connections so anyone can learn.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center shrink-0">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">Excellence in Content</h3>
                    <p className="text-stone-600">Every course is vetted by a review board before it goes live on our platform.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-stone-900">Community Focused</h3>
                    <p className="text-stone-600">We believe peer-to-peer learning is just as important as instructor-led sessions.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

{/* 4. Team Section */}
      <section className="pt-12 pb-16 sm:py-24  bg-white border-t border-stone-200 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-12">Meet the Leadership</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            
            {/* Team Member 1: Dr. Elena Rostova */}
            <div className="group">
              <div className="aspect-3/4 bg-stone-100 rounded-xl mb-4 overflow-hidden relative shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1758876019673-704b039d405c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG9mZmljZSUyMGxlYWRlcnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Dr. Elena Rostova"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Dr. Elena Rostova</h3>
              <p className="text-stone-500 mb-3">Founder & CEO</p>
              <div className="flex justify-center gap-3 text-stone-400">
                 <LinkedInIcon />
                <XIcon />
              </div>
            </div>

             {/* Team Member 2: James Miller */}
             <div className="group">
              <div className="aspect-3/4 bg-stone-100 rounded-xl mb-4 overflow-hidden relative shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1763739528307-ad10867048b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG9mZmljZSUyMGxlYWRlcnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="James Miller"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-stone-900">James Miller</h3>
              <p className="text-stone-500 mb-3">Head of Curriculum</p>
              <div className="flex justify-center gap-3 text-stone-400">
                <LinkedInIcon />
                <XIcon />
              </div>
            </div>

             {/* Team Member 3: Michael Chen (Renamed to match male photo) */}
             <div className="group">
              <div className="aspect-3/4 bg-stone-100 rounded-xl mb-4 overflow-hidden relative shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlcnNvbnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Michael Chen"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Michael Chen</h3>
              <p className="text-stone-500 mb-3">CTO</p>
              <div className="flex justify-center gap-3 text-stone-400">
                  <LinkedInIcon />
                <XIcon />
              </div>
            </div>

          </div>
        </div>
      </section>

  {/* 5. CTA Footer */}
      <section className="py-20 mb-12 bg-orange-700 text-white text-center px-4">
        <h2 className="text-3xl font-serif font-bold mb-6">Want to join the mission?</h2>
        <p className="text-orange-100 mb-8 max-w-lg mx-auto">We are always looking for passionate instructors and developers to join our team.</p>
        
        {/* Changed Link to 'a' tag and added mailto */}
        <a 
          href="mailto:nishajabatunnessa@gmail.com" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-800 font-bold rounded-lg hover:bg-stone-100 transition-colors"
        >
          Contact Us <ArrowRight size={18} />
        </a>
      </section>

    </div>
  );
}