import Link from 'next/link';
import { 
  BookOpen, Users, GraduationCap, 
  ArrowRight, LayoutDashboard,
  Target, Heart, Globe, 
  Star,
  Quote
} from 'lucide-react';
import CourseCard from '@/components/CourseCard';

// --- Server Data Fetching ---
async function getFeaturedCourses() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses?limit=3&sort=-createdAt`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch (err) {
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans text-stone-900">

      {/* ================= 1. PORTAL HERO ================= */}
      <section className="bg-white border-b border-stone-200 pt-16 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Introduction */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-800 text-xs font-bold uppercase tracking-wider rounded-md border border-orange-100">
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                System Online
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
                CourseMaster <br/> Learning Portal
              </h1>
              
              <p className="text-lg text-stone-600">
                Welcome to the centralized learning management system. Access your assessments, watch video lectures, and track your certification progress.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-colors"
                >
                  Create Account <ArrowRight size={18} />
                </Link>
                <Link 
                  href="/courses" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-700 border border-stone-300 font-semibold rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Browse Catalog
                </Link>
              </div>
            </div>

            {/* Right: Quick Stats / System Info */}
            <div className="bg-stone-100 rounded-xl p-8 border border-stone-200">
              <h3 className="text-stone-900 font-bold mb-6 flex items-center gap-2">
                <LayoutDashboard className="text-stone-400" size={20}/> 
                Platform Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-md"><BookOpen size={20} /></div>
                    <span className="text-sm font-medium text-stone-600">Active Courses</span>
                  </div>
                  <span className="text-lg font-bold text-stone-900">24</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-700 rounded-md"><Users size={20} /></div>
                    <span className="text-sm font-medium text-stone-600">Enrolled Students</span>
                  </div>
                  <span className="text-lg font-bold text-stone-900">1.2k</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-700 rounded-md"><GraduationCap size={20} /></div>
                    <span className="text-sm font-medium text-stone-600">Certifications Issued</span>
                  </div>
                  <span className="text-lg font-bold text-stone-900">850</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. COURSE CATALOG PREVIEW ================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">Available Curricula</h2>
              <p className="text-stone-500">Select a course to view syllabus and enrollment options.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.slice(0, 3).map((course: any) => (
                <CourseCard key={course._id} course={course} />
              ))
            ) : (
              <div className="col-span-3 py-12 text-center border border-dashed border-stone-300 rounded-lg bg-stone-50/50">
                <p className="text-stone-500">No active courses found in the system.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/courses" 
              className="text-orange-700 font-semibold hover:text-orange-800 text-sm flex items-center justify-center gap-2"
            >
              View Full Directory <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3 ABOUT US TEASER  ================= */}
      <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-stone-800/50 rounded-l-full blur-3xl -mr-32"></div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-orange-400 text-sm font-bold uppercase tracking-wider">
                <Globe size={16} />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
                Bridging the gap between <span className="text-orange-500">Potential</span> and <span className="text-orange-500">Performance</span>.
              </h2>
              <p className="text-stone-400 text-lg leading-relaxed">
                We started CourseMaster with a simple belief: Quality education should be accessible, structured, and community-driven. We aren't just a platform; we are a collective of experts dedicated to your growth.
              </p>
              
              <div className="pt-4">
                <Link 
                  href="/about" 
                  className="inline-flex items-center gap-3 text-white font-semibold border-b border-orange-500 pb-1 hover:text-orange-400 transition-colors"
                >
                  Read Our Story <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Visual Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700">
                  <Target className="text-orange-500 mb-4" size={32} />
                  <h4 className="font-bold text-lg mb-2">Purpose</h4>
                  <p className="text-stone-400 text-sm">To provide industry-standard skills to everyone.</p>
               </div>
               <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 mt-8">
                  <Heart className="text-orange-500 mb-4" size={32} />
                  <h4 className="font-bold text-lg mb-2">Community</h4>
                  <p className="text-stone-400 text-sm">Learning is better when we do it together.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4 SUCCESS STORIES (EXTRA) ================= */}
      <section className="py-20 bg-orange-50 border-b border-orange-100">
        <div className="container mx-auto max-w-6xl px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Trusted by Industry Professionals</h2>
            <p className="text-stone-600 text-lg">
              Don't just take our word for it. See how CourseMaster certifications are helping developers advance their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review Card 1 */}
            <div className="bg-white p-8 rounded-xl border border-orange-100 shadow-sm relative">
              <Quote className="absolute top-6 right-6 text-orange-100" size={40} />
              <div className="flex gap-1 text-orange-500 mb-6">
                {[1,2,3,4,5].map((i) => ( <Star key={i} size={16} fill="currentColor" /> ))}
              </div>
              <p className="text-stone-700 mb-6 relative z-10">
                "The structured learning path helped me bridge the gap between junior and intermediate concepts. The system architecture modules are world-class."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 font-bold text-xs">
                  JD
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">James D.</div>
                  <div className="text-xs text-stone-500">Full Stack Engineer</div>
                </div>
              </div>
            </div>

            {/* Review Card 2 */}
            <div className="bg-white p-8 rounded-xl border border-orange-100 shadow-sm relative">
              <Quote className="absolute top-6 right-6 text-orange-100" size={40} />
              <div className="flex gap-1 text-orange-500 mb-6">
                {[1,2,3,4,5].map((i) => ( <Star key={i} size={16} fill="currentColor" /> ))}
              </div>
              <p className="text-stone-700 mb-6 relative z-10">
                "I appreciate the no-nonsense approach to the assessments. It feels like a real university portal but with modern, relevant tech stacks."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 font-bold text-xs">
                  AS
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">Sarah A.</div>
                  <div className="text-xs text-stone-500">Product Designer</div>
                </div>
              </div>
            </div>

            {/* Review Card 3 */}
            <div className="bg-white p-8 rounded-xl border border-orange-100 shadow-sm relative">
              <Quote className="absolute top-6 right-6 text-orange-100" size={40} />
              <div className="flex gap-1 text-orange-500 mb-6">
                {[1,2,3,4,5].map((i) => ( <Star key={i} size={16} fill="currentColor" /> ))}
              </div>
              <p className="text-stone-700 mb-6 relative z-10">
                "The platform performance is incredibly fast, and the dashboard makes tracking my certification progress satisfyingly simple."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-500 font-bold text-xs">
                  MK
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">Marcus K.</div>
                  <div className="text-xs text-stone-500">DevOps Specialist</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 5. SYSTEM WORKFLOW ================= */}
      <section className="py-16 bg-white border-t border-stone-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            <div className="p-6">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold text-stone-500 border border-stone-200">1</div>
              <h3 className="font-bold text-stone-900 mb-2">Create Account</h3>
              <p className="text-sm text-stone-500">Register as a student or instructor to access the dashboard.</p>
            </div>

            <div className="p-6">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold text-stone-500 border border-stone-200">2</div>
              <h3 className="font-bold text-stone-900 mb-2">Enroll & Assessment</h3>
              <p className="text-sm text-stone-500">Complete video modules and submit assignments for grading.</p>
            </div>

            <div className="p-6">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold text-stone-500 border border-stone-200">3</div>
              <h3 className="font-bold text-stone-900 mb-2">Track Progress</h3>
              <p className="text-sm text-stone-500">View grades, feedback, and certifications in your profile.</p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}