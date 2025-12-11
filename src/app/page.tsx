import Link from 'next/link';
import {  ArrowRight } from 'lucide-react';
import CourseCard from '@/components/CourseCard';

// ================= SERVER-SIDE DATA FETCH =================
async function getFeaturedCourses() {
  try {
    const res = await fetch('http://localhost:4000/api/courses?limit=2&sort=-createdAt', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch (err) {
    console.error("Failed to fetch courses", err);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="flex flex-col bg-gray-50 text-gray-900 min-h-screen">

      {/* ================= HERO SECTION ================= */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Master New Skills with <br/>
            <span className="text-yellow-500">Expert-Led Courses</span>
          </h1>
          <p className="text-md sm:text-lg md:text-xl text-gray-700 mb-8">
            Join our learning community. Enroll in batches, submit assignments via Google Drive, and track your progress in real-time.
          </p>
       
        </div>
      </section>



     
      {/* ================= FEATURED COURSES ================= */}
<section className="py-16 px-4 bg-gray-50">
  <div className="container mx-auto">

    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center">
      Featured Courses
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

      {/* Show first 5 courses */}
      {courses.slice(0, 5).map((course: any) => (
        <CourseCard key={course._id} course={course} />
      ))}

      {/* Sixth Card → Browse More */}
      <Link 
        href="/courses"
        className="
          group flex flex-col items-center justify-center 
          bg-white border border-zinc-200 rounded-xl 
          shadow-sm hover:shadow-md transition-all p-6 text-center"
      >
        <div className="text-3xl font-bold text-zinc-900 mb-2">
          Browse More Courses
        </div>
        <p className="text-zinc-500 text-sm mb-4">
          Explore our full catalog & start learning today.
        </p>

        <div className="inline-flex items-center gap-2 text-zinc-900 font-semibold">
          Explore All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </div>
      </Link>

    </div>

  </div>
</section>



    </div>
  );
}

