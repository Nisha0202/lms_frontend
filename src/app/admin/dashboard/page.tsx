"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { 
  Plus, BookOpen, Users, DollarSign, 
  ArrowRight, Loader2, BarChart3, MoreVertical
} from "lucide-react";
import DashboardActions from "@/components/DashboardActions";
import type { CourseResponse, StatsApiResponse } from "@/types";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="animate-spin text-zinc-900" size={24} /> Loading
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-zinc-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Overview</h1>
            <p className="text-zinc-500 text-sm mt-1">Welcome back to your academy dashboard.</p>
          </div>
          <Link
            href="/admin/courses/create-course"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} /> New Course
          </Link>
        </div>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            label="Total Courses" 
            value={stats.totalCourses} 
            icon={BookOpen}
            href="#"
          />
          <StatCard 
            label="Total Students" 
            value={stats.totalStudents} 
            icon={Users}
            href="/admin/users"
          />
          <StatCard 
            label="Total Enrollments" 
            value={stats.totalEnrollments} 
            icon={BarChart3}
            href="/admin/enrollments"
          />
        </div>

        {/* --- Recent Courses Table --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-zinc-900">Recent Courses</h2>
            <Link 
              href="/courses" 
              className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            {stats.courses.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="text-zinc-400" size={20} />
                </div>
                <h3 className="text-zinc-900 font-medium">No courses yet</h3>
                <p className="text-zinc-500 text-sm mt-1 mb-4">Create your first course to get started.</p>
                <Link href="/admin/courses/create-course" className="text-sm font-medium text-blue-600 hover:underline">
                  Create Course
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100 text-zinc-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Course</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {stats.courses.map((course) => (
                      <tr key={course._id} className="group hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-16 bg-zinc-100 rounded border border-zinc-200 overflow-hidden shrink-0">
                              {course.thumbnail ? (
                                <Image
                                  src={course.thumbnail}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized={course.thumbnail?.startsWith("http")}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                  <BookOpen size={14} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900 truncate max-w-[200px]">{course.title}</p>
                              <p className="text-xs text-zinc-500 font-mono mt-0.5">{course._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          {course.category}
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          ৳{course.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                             <DashboardActions courseId={course._id} />
                          </div>
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
    </div>
  );
}

// Minimalist Stat Card
function StatCard({ label, value, icon: Icon, href }: any) {
  return (
    <Link href={href} className="group block p-6 bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-zinc-50 rounded-lg text-zinc-500 group-hover:text-zinc-900 group-hover:bg-zinc-100 transition-colors">
          <Icon size={20} />
        </div>
        <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
      <div>
        <div className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</div>
        <div className="text-sm font-medium text-zinc-500 mt-1">{label}</div>
      </div>
    </Link>
  );
}