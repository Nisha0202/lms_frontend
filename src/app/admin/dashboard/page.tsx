"use client"; 

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Plus, BookOpen, Users, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import DashboardActions from "@/components/DashboardActions";
import type { CourseResponse, StatsApiResponse  } from "@/types";
// --- 1. Define Interfaces ---

// interface Course {
//   _id: string;
//   title: string;
//   price: number;
//   category: string;
//   thumbnail: string;
// }



// What the GET /courses endpoint returns
interface CoursesApiResponse {
  courses: CourseResponse[];
  total: number;
}

// // What our Component State looks like (combines both)
// interface DashboardState {
//   totalCourses: number;
//   totalStudents: number;
//   totalEnrollments: number;
//   courses: CourseResponse[];
// }

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
        // --- 2. Pass Generics to api.get<Type> ---
        
        const [statsRes, coursesRes] = await Promise.all([
          // Tell TS this returns StatsApiResponse
          api.get<StatsApiResponse>("/enrollments/admin/stats"), 
          
          // Tell TS this returns CoursesApiResponse
          api.get<CoursesApiResponse>("/courses?limit=5&sort=-createdAt") 
        ]);

        // --- 3. Now TS knows 'statsRes.data' has 'totalCourses' ---
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-zinc-900" size={32} />
          <p className="text-zinc-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 text-sm">Welcome back, Admin.</p>
          </div>
          <Link
            href="/admin/courses/create-course"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} /> Create New Course
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Courses</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{stats.totalCourses}</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
              <BookOpen size={24} />
            </div>
          </div>

          {/* Card 2 (Clickable) */}
          <div className="bg-white cursor-pointer p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between hover:border-zinc-300 transition-colors group">
            <div>
              <p className="text-sm font-medium text-zinc-500 group-hover:text-blue-600 transition">Total Registrations</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
              <Users size={24} />
            </div>
          </div>

          {/* Card 3 */}
          <Link href="/admin/enrollments" className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between hover:border-zinc-300 transition-colors group">
            <div>
              <p className="text-sm font-medium text-zinc-500 group-hover:text-blue-600 ">Total Enrollments</p>
              <p className="text-3xl font-bold text-zinc-900 mt-1">{stats.totalEnrollments}</p>
            </div>
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600   group-hover:bg-blue-50 group-hover:text-blue-600 transition">
              <DollarSign size={24} />
            </div>
          </Link>
        </div>

        {/* Recent Courses Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="font-semibold text-zinc-900">Recent Courses</h2>
            <Link href="/courses" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            {stats.courses.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No courses created yet.</div>
            ) : (
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
                  {stats.courses.map((course) => (
                    <tr key={course._id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 bg-zinc-200 rounded overflow-hidden shrink-0 border border-zinc-100">
                            {course.thumbnail ? (
                              <Image
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="object-cover"
                                unoptimized={course.thumbnail?.startsWith("http")}
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-300"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 line-clamp-1">{course.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
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
            )}
          </div>
        </div>

      </div>
    </div>
  );
}