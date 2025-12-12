import Link from 'next/link';
import { 
  ArrowRight, Terminal, Cpu, Globe, 
  Zap, Award, Users, PlayCircle, Code2, 
  CheckCircle2, LayoutTemplate
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
    console.error("Failed to fetch courses", err);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900 selection:bg-yellow-200">

      {/* ================= 1. HERO: SPLIT LAYOUT (Denser, less empty space) ================= */}
      <section className="border-b border-zinc-200 bg-zinc-50/50">
        <div className="container mx-auto py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Copy */}
            <div className="space-y-6 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-md shadow-sm text-xs font-mono text-zinc-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>System Online: v2.0</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.15]">
                Ship code. <br/>
                <span className="text-zinc-400">Not just syntax.</span>
              </h1>
              
              <p className="text-lg text-zinc-600 leading-relaxed font-medium">
                The only LMS designed for the modern stack. We replaced boring lectures with 
                <span className="text-zinc-900 font-bold bg-yellow-100 px-1 mx-1 rounded">interactive cohorts</span> 
                and real-time code reviews.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                  Browse Catalog
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-50 transition-all">
                  Get Started
                </Link>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono pt-4">
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> No Credit Card</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> 14-Day Free Access</span>
              </div>
            </div>

            {/* Right: Visual (Code Window) */}
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-yellow-400 to-amber-500 rounded-xl blur opacity-20"></div>
              <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="ml-4 text-[10px] text-zinc-500 font-mono">learn.tsx</div>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed text-zinc-300">
                  <p><span className="text-purple-400">const</span> <span className="text-blue-400">Student</span> = <span className="text-yellow-400">async</span> () <span className="text-purple-400">=&gt;</span> &#123;</p>
                  <p className="pl-4"><span className="text-purple-400">await</span> <span className="text-blue-400">CourseMaster</span>.enroll(<span className="text-green-400">"Full Stack"</span>);</p>
                  <p className="pl-4 text-zinc-500">// Simulating hard work...</p>
                  <p className="pl-4"><span className="text-purple-400">while</span> (alive) &#123;</p>
                  <p className="pl-8">eat();</p>
                  <p className="pl-8">sleep();</p>
                  <p className="pl-8"><span className="text-yellow-400">code</span>();</p>
                  <p className="pl-4"> &#125;</p>
                  <p>&#125;</p>
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-emerald-400">
                    <Terminal size={14} />
                    <span>Build Successful (204ms)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. TECH STACK STRIP (Compact) ================= */}
      <section className="bg-white border-b border-zinc-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Globe size={18}/> React.js</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Terminal size={18}/> Node.js</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Cpu size={18}/> Python</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><LayoutTemplate size={18}/> Next.js</span>
            <span className="flex items-center gap-2 font-bold text-zinc-700"><Code2 size={18}/> TypeScript</span>
          </div>
        </div>
      </section>

      {/* ================= 3. FEATURE GRID (Compact Cards) ================= */}
      <section className="py-20 px-4 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Why top 1% developers choose us</h2>
              <p className="text-zinc-500 mt-2">Features built for serious learners, not casual watchers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureItem 
              icon={<Award className="text-yellow-600" />}
              title="Graded Assignments"
              desc="Submit code via Drive. Get real human feedback, not automated bots."
            />
            <FeatureItem 
              icon={<Users className="text-blue-600" />}
              title="Cohort Based"
              desc="Learn in batches. Deadlines keep you accountable and shipping."
            />
            <FeatureItem 
              icon={<Zap className="text-purple-600" />}
              title="Production Ready"
              desc="We don't teach 'Hello World'. We build full-stack SaaS apps."
            />
          </div>
        </div>
      </section>

      {/* ================= 4. COURSE LIST (Clean Grid) ================= */}
      <section className="py-20 bg-white border-y border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
              <h2 className="text-2xl font-bold text-zinc-900">Trending Now</h2>
            </div>
            <Link href="/courses" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 group">
              View Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course: any) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. INSTRUCTOR SPOTLIGHT (Asymmetrical) ================= */}
      <section className="py-20 bg-zinc-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase tracking-wider">
                Expert Led
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                "We don't hire teachers.<br/> We hire engineers who teach."
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Our instructors work at top tech companies. They teach you the exact workflows, patterns, and tools used in production environments today.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                <div>
                  <h4 className="text-2xl font-bold text-white">50+</h4>
                  <p className="text-zinc-500 text-sm">Active Mentors</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">24h</h4>
                  <p className="text-zinc-500 text-sm">Avg. Review Time</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              {/* Decorative Abstract Code Visual */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                 <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700 mt-12">
                    <div className="w-10 h-10 bg-blue-500 rounded-full mb-3"></div>
                    <div className="h-2 w-20 bg-zinc-600 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-zinc-700 rounded"></div>
                 </div>
                 <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full mb-3"></div>
                    <div className="h-2 w-20 bg-zinc-600 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-zinc-700 rounded"></div>
                 </div>
                 <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
                    <div className="w-10 h-10 bg-purple-500 rounded-full mb-3"></div>
                    <div className="h-2 w-20 bg-zinc-600 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-zinc-700 rounded"></div>
                 </div>
                 <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700 -mt-12">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full mb-3"></div>
                    <div className="h-2 w-20 bg-zinc-600 rounded mb-2"></div>
                    <div className="h-2 w-12 bg-zinc-700 rounded"></div>
                 </div>
              </div>
              {/* Glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. BANNER CTA (Minimalist) ================= */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl bg-yellow-400 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-yellow-200">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4">
              Stop procrastinating.
            </h2>
            <p className="text-zinc-900/80 font-medium text-lg">
              The next batch starts on Monday. Secure your spot before seats run out.
            </p>
          </div>
          <Link 
            href="/courses" 
            className="shrink-0 bg-zinc-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-transform hover:scale-105"
          >
            Enroll Now
          </Link>
        </div>
      </section>

    </div>
  );
}

// --- Compact Feature Component ---
function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 hover:border-yellow-400 transition-colors group">
      <div className="w-12 h-12 bg-zinc-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  );
}