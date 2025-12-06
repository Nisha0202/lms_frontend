import Link from 'next/link';
import { BookOpen, Award, Video, ArrowRight } from 'lucide-react';

// ================= SERVER-SIDE DATA FETCH =================
async function getFeaturedCourses() {
  try {
    const res = await fetch('http://localhost:4000/api/courses?limit=3&sort=-createdAt', {
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

      {/* ================= FEATURES ================= */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BookOpen className="w-10 h-10 text-gray-800 mx-auto" />} 
            title="Extensive Curriculum" 
            desc="Learn from a wide variety of topics and structured courses for all levels." 
          />
          <FeatureCard 
            icon={<Video className="w-10 h-10 text-gray-800 mx-auto" />} 
            title="Video Lessons" 
            desc="Watch high-quality video lectures at your own pace." 
          />
          <FeatureCard 
            icon={<Award className="w-10 h-10 text-gray-800 mx-auto" />} 
            title="Certifications" 
            desc="Earn certificates for completed courses and showcase your skills." 
          />
        </div>
      </section>

      {/* ================= FEATURED COURSES ================= */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-center">Featured Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div key={course._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-700 mb-4">{course.description?.slice(0, 80)}...</p>
                <Link 
                  href={`/courses/${course._id}`} 
                  className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:underline"
                >
                  View Course <ArrowRight className="w-4 h-4"/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-white text-xl font-bold mb-4">LMS Platform</h3>
          <p className="mb-8 max-w-md mx-auto text-gray-300">
            Empowering students with accessible education. Built with Next.js, Node.js, and MongoDB.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
            <Link href="#" className="hover:text-white">Support</Link>
          </div>
          <p className="mt-8 text-xs">&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ================= FEATURE CARD =================
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-700">{desc}</p>
    </div>
  );
}
