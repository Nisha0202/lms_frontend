"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { 
  Plus, BookOpen, Users, BarChart3, 
  ArrowRight, Loader2, LayoutDashboard
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <Loader2 className="animate-spin text-orange-700" size={32} />
        <p className="mt-4 font-serif text-lg">Loading Academy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <LayoutDashboard size={20} />
              <span className="text-xs font-bold tracking-widest uppercase">Admin Console</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">Overview</h1>
            <p className="text-stone-500 mt-2 font-light text-lg">Manage your curriculum and student enrollment.</p>
          </div>
          <Link
            href="/admin/courses/create-course"
            className="inline-flex items-center justify-center gap-2 bg-stone-900 text-stone-50 px-6 py-3 rounded-md text-sm font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-stone-200 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Create New Course
          </Link>
        </div>

        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Courses" 
            value={stats.totalCourses} 
            icon={BookOpen}
            href="#"
          />
          <StatCard 
            label="Active Students" 
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Recent Courses</h2>
            <Link 
              href="/courses" 
              className="text-sm font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1 transition-colors hover:underline underline-offset-4"
            >
              View directory <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden ring-1 ring-black/5">
            {stats.courses.length === 0 ? (
              <div className="text-center py-20 px-4 bg-stone-50/50">
                <div className="bg-white border border-stone-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BookOpen className="text-stone-400" size={24} />
                </div>
                <h3 className="text-stone-900 font-serif text-xl font-medium">No courses published</h3>
                <p className="text-stone-500 mt-2 mb-6">Start building your curriculum today.</p>
                <Link href="/admin/courses/create-course" className="text-orange-700 font-bold hover:underline">
                  Create First Course
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-stone-100/80 text-stone-600 font-bold uppercase text-xs tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-4">Course Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Tuition</th>
                      <th className="px-6 py-4 text-right">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {stats.courses.map((course) => (
                      <tr key={course._id} className="group hover:bg-orange-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {/* Thumbnail */}
                            <div className="relative h-12 w-20 bg-stone-200 rounded overflow-hidden shrink-0 shadow-inner border border-stone-100">
                              {course.thumbnail ? (
                                <Image
                                  src={course.thumbnail}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized={course.thumbnail?.startsWith("http")}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                  <BookOpen size={16} />
                                </div>
                              )}
                            </div>
                            {/* Text Info */}
                            <div>
                              <p className="font-serif font-bold text-stone-900 text-base truncate max-w-[220px] group-hover:text-orange-700 transition-colors">
                                {course.title}
                              </p>
                              <p className="text-xs text-stone-400 font-mono mt-0.5 uppercase tracking-wide">
                                ID: {course._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                            {course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-serif font-bold text-stone-900 tabular-nums">
                          ৳ {course.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end opacity-60 group-hover:opacity-100 transition-opacity">
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

// Redesigned "Academic" Stat Card
function StatCard({ label, value, icon: Icon, href }: any) {
  return (
    <Link 
      href={href} 
      className="group relative block bg-white p-6 rounded-lg border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Orange Accent Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-stone-200 group-hover:bg-orange-700 transition-colors duration-300" />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{label}</p>
          <div className="text-4xl font-serif font-bold text-stone-900 group-hover:text-orange-700 transition-colors">
            {value}
          </div>
        </div>
        <div className="p-3 bg-stone-50 rounded-md text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors">
          <Icon size={24} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center text-xs font-bold text-stone-400 group-hover:text-orange-700 transition-colors">
        VIEW DETAILS <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}