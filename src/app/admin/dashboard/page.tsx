import Link from "next/link";
import Image from "next/image";
import { Plus, BookOpen, Users, DollarSign, ArrowRight } from "lucide-react";
import DashboardActions from "@/components/DashboardActions";

// Fetch Data on the Server
async function getDashboardData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  
  try {
    const res = await fetch(`${apiUrl}/courses?limit=100`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (error) {
    return { courses: [], total: 0 };
  }
}

export default async function AdminDashboard() {
  const { courses, total } = await getDashboardData();

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 text-sm">Welcome back, Admin. Here is what's happening today.</p>
          </div>
          <Link
            href="/admin/create-course"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Create New Course
          </Link>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Total Courses */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Courses</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{total}</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
              <BookOpen size={24} />
            </div>
          </div>

          {/* Card 2: Total Students (Placeholder for now) */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Students</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">0</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
              <Users size={24} />
            </div>
          </div>

          {/* Card 3: Revenue (Placeholder) */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Revenue</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">৳ 0</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        {/* ================= COURSE LIST TABLE ================= */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-900">Recent Courses</h2>
            <Link href="/courses" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No courses found. Click "Create New Course" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Course Info</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {courses.map((course: any) => (
                    <tr key={course._id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 bg-zinc-200 rounded overflow-hidden shrink-0">
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                              unoptimized={course.thumbnail?.startsWith("http")}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-zinc-500">{course.lessons?.length || 0} Lessons</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        ৳ {course.price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DashboardActions courseId={course._id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}