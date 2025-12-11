"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Loader2, ArrowRight, LayoutDashboard, FileText, CheckCircle, XCircle } from "lucide-react";
import StudentCourseCard from "@/components/StudentCourseCard";
import type { EnrolledCourse, GradeData } from "@/types";



export default function StudentDashboardPage() {
  const { user } = useAuth();
  
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'courses' | 'grades'>('courses');
  const [loading, setLoading] = useState(true);

  // --- Data State ---
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [grades, setGrades] = useState<GradeData['assignments']>([]);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // Run both requests in parallel for speed
        const [enrollRes, gradesRes] = await Promise.all([
          api.get<EnrolledCourse[]>("/enrollments/my-courses"),
          api.get<GradeData>("/assessments/my-grades")
        ]);

        setEnrollments(enrollRes.data);
        setGrades(gradesRes.data.assignments);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

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
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-zinc-500 mt-1">
              You are currently enrolled in <span className="font-semibold text-zinc-900">{enrollments.length}</span> active courses.
            </p>
          </div>

          {/* === MOVING TAB SWITCHER === */}
          <div className="bg-white p-1.5 rounded-xl border border-zinc-200 flex items-center gap-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'courses' 
                  ? "bg-zinc-800 text-white shadow-md" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <BookOpen size={16} /> My Courses
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'grades' 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <FileText size={16} /> Gradebook
            </button>
          </div>
        </div>

        {/* === CONTENT AREA === */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* --- VIEW 1: COURSES --- */}
          {activeTab === 'courses' && (
            enrollments.length === 0 ? (
              <EmptyState type="Courses" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments.map((e) => (
                  <StudentCourseCard key={e._id} enrollment={e} />
                ))}
              </div>
            )
          )}

          {/* --- VIEW 2: GRADES --- */}
          {activeTab === 'grades' && (
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-5 font-semibold">Lesson Name</th>
                    <th className="p-5 font-semibold">Submitted On</th>
                    <th className="p-5 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <XCircle size={32} className="text-zinc-300 mb-2" />
                          <p className="font-medium">No assignments submitted yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    grades.map((sub) => (
                      <tr key={sub._id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-5">
                          <p className="font-semibold text-zinc-900 text-base">
                            {sub.lesson?.title || <span className="text-red-400 italic">Deleted Lesson</span>}
                          </p>
                          {sub.feedback && (
                            <p className="text-xs text-zinc-500 mt-1 max-w-md line-clamp-1 italic">
                              "{sub.feedback}"
                            </p>
                          )}
                        </td>
                        <td className="p-5 text-zinc-500 font-medium">
                          {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-5 text-right">
                          {sub.grade !== undefined ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                              <CheckCircle size={14} /> {sub.grade}/100
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                              <Loader2 size={12} className="animate-spin" /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Helper for Empty Courses State
function EmptyState({ type }: { type: string }) {
  return (
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
        className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
      >
        Explore Courses <ArrowRight size={18} />
      </Link>
    </div>
  );
}