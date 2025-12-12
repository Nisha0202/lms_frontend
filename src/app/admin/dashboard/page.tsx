"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { 
  Plus, BookOpen, Users, DollarSign, 
  ArrowRight, Loader2,
} from "lucide-react";
import DashboardActions from "@/components/DashboardActions";
import type { CourseResponse, StatsApiResponse } from "@/types";

// Types
interface CoursesApiResponse {
  courses: CourseResponse[];
  total: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsApiResponse>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    courses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get<StatsApiResponse>("/enrollments/admin/stats"),
          api.get<CoursesApiResponse>("/courses?limit=5&sort=-createdAt")
        ]);

        setStats({
          totalCourses: statsRes.data.totalCourses,
          totalStudents: statsRes.data.totalStudents,
          totalEnrollments: statsRes.data.totalEnrollments,
          courses: coursesRes.data.courses
        });
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <p className="text-zinc-500 font-medium text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- Header & Primary Action --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
            <p className="text-zinc-500 mt-1">Overview of your academy's performance.</p>
          </div>
          <Link
            href="/admin/courses/create-course"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm active:translate-y-0.5"
          >
            <Plus size={18} /> Create New Course
          </Link>
        </div>

        {/* --- Metrics Overview (With Explicit Links) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard 
            label="Total Courses" 
            value={stats.totalCourses} 
            icon={<BookOpen size={20} />} 
            linkHref="/admin/dasboard"
            linkText=" "
          />
          <MetricCard 
            label="Registered Students" 
            value={stats.totalStudents} 
            icon={<Users size={20} />} 
            linkHref="/admin/users"
            linkText="View All Users"
          />
          <MetricCard 
            label="Total Enrollments" 
            value={stats.totalEnrollments} 
            icon={<DollarSign size={20} />} 
            linkHref="/admin/enrollments"
            linkText="View Transactions"
          />
        </div>

        {/* --- Main Content Area --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Recent Courses</h2>
            <Link 
              href="/admin/courses" 
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              View Full Directory <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {stats.courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-zinc-50 p-4 rounded-full mb-3 border border-zinc-100">
                    <BookOpen className="text-zinc-300" size={24} />
                  </div>
                  <p className="text-zinc-900 font-medium">No courses found</p>
                  <p className="text-zinc-500 text-sm mt-1 mb-4 max-w-xs">
                    Get started by creating your first course curriculum.
                  </p>
                  <Link href="/admin/courses/create-course" className="text-sm font-semibold text-blue-600 hover:underline">
                    Create Course &rarr;
                  </Link>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4 w-[40%]">Course Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.courses.map((course) => (
                      <tr key={course._id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative h-12 w-20 bg-zinc-100 rounded-md overflow-hidden shrink-0 border border-zinc-200">
                              {course.thumbnail ? (
                                <Image
                                  src={course.thumbnail}
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                  unoptimized={course.thumbnail?.startsWith("http")}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                                  <BookOpen size={16} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 line-clamp-1 text-base">{course.title}</p>
                              <p className="text-xs text-zinc-500 mt-0.5 font-mono text-[10px] uppercase">ID: {course._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900 tabular-nums">
                          ৳ {course.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* FIX: Removed opacity-0. 
                              DashboardActions is now always visible. 
                          */}
                          <div className="flex justify-end">
                             <DashboardActions courseId={course._id} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Redesigned Card Component ---
// Now separates the "Stat" from the "Action Link" clearly
function MetricCard({ label, value, icon, linkHref, linkText }: any) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-500 border border-zinc-100">
            {icon}
          </div>
          <span className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
        </div>
        <p className="text-sm font-medium text-zinc-500">{label}</p>
      </div>
      
      {/* Explicit Footer Link */}
      <div className="mt-auto border-t border-zinc-100 p-3 bg-zinc-50/50 rounded-b-xl">
        <Link 
          href={linkHref} 
          className="flex items-center justify-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors w-full py-1"
        >
          {linkText} 
        </Link>
      </div>
    </div>
  );
}