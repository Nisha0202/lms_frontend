"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api"; 
import { useAuth } from "@/hooks/useAuth";
import { BookOpen,  Loader2, ArrowRight, LayoutDashboard } from "lucide-react";
import StudentCourseCard from "@/components/StudentCourseCard";

// 1. Define Interface matching your Backend 'getMyCourses' response exactly
interface EnrolledCourse {
  _id: string; 
  course: {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    thumbnail?: string;
  };
  batchName: string;
  startDate: string; 
  progress: number; 
  paymentStatus: string;
  createdAt: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        // FIX IS HERE: Add <EnrolledCourse[]> generic type to .get()
        // This tells TypeScript: "The response.data will be an array of EnrolledCourse"
        const res = await api.get<EnrolledCourse[]>("/enrollments/my-courses");
        
        setEnrollments(res.data); 
      } catch (error) {
        console.error("Failed to load enrollments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // 3. Loading View
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-zinc-500 mt-1">
              You are enrolled in <span className="font-semibold text-zinc-900">{enrollments.length}</span> courses.
            </p>
          </div>
          <Link 
            href="/student/grades" 
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-4 text-sm font-medium hover:bg-yellow-600 transitionpx-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <BookOpen size={18} /> Your Grades
          </Link>
        </div>

        {/* Content Area */}
        {enrollments.length === 0 ? (
          // --- EMPTY STATE ---
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-zinc-200 border-dashed text-center">
            <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard className="text-zinc-300" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No enrollments yet</h3>
            <p className="text-zinc-500 max-w-sm mt-2 mb-6">
              It looks like you haven't enrolled in any courses yet. Start your learning journey today!
            </p>
            <Link
              href="/courses"
              className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
            >
              Explore Courses <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          // --- COURSE GRID ---
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {enrollments.map((e) => (
  <StudentCourseCard key={e._id} enrollment={e} />
))}
          </div>
        )}
      </div>
    </div>
  );
}