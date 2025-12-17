"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, Loader2, ArrowRight, LayoutDashboard, 
  FileText, CheckCircle, Clock, GraduationCap 
} from "lucide-react";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-500">
        <Loader2 className="animate-spin text-orange-700 mb-4" size={32} />
        <p className="font-serif text-lg">Loading your academy dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-stone-900">
      <div className="max-w-7xl mx-auto">
        
        {/* === HEADER SECTION === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-stone-200 pb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-700 mb-2">
              <GraduationCap size={20} />
              <span className="text-xs font-bold tracking-widest uppercase">Student Portal</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-stone-500 mt-2 text-lg font-light">
              You are currently enrolled in <span className="font-bold text-stone-900">{enrollments.length}</span> active courses.
            </p>
          </div>

          {/* === TAB SWITCHER === */}
          <div className="bg-stone-200/50 p-1 rounded-lg flex items-center gap-1 shadow-inner border border-stone-200/50 w-fit">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${
                activeTab === 'courses' 
                  ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5" 
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <BookOpen size={16} className={activeTab === 'courses' ? "text-orange-700" : ""} /> My Courses
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-300 ${
                activeTab === 'grades' 
                  ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5" 
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              <FileText size={16} className={activeTab === 'grades' ? "text-orange-700" : ""} /> Gradebook
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {enrollments.map((e) => (
                  <StudentCourseCard key={e._id} enrollment={e} />
                ))}
              </div>
            )
          )}

          {/* --- VIEW 2: GRADES --- */}
          {activeTab === 'grades' && (
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-6">Assignment Details</th>
                    <th className="p-6">Submission Date</th>
                    <th className="p-6 text-right">Status & Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-stone-400">
                          <LayoutDashboard size={48} className="text-stone-200 mb-4" />
                          <h3 className="font-serif text-lg text-stone-900 font-medium">No records found</h3>
                          <p className="mt-1">You haven't submitted any assignments yet.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    grades.map((sub) => (
                      <tr key={sub._id} className="hover:bg-orange-50/30 transition-colors group">
                        <td className="p-6">
                          <p className="font-serif font-bold text-stone-900 text-base group-hover:text-orange-700 transition-colors">
                            {sub.lesson?.title || <span className="text-red-400 italic">Deleted Lesson</span>}
                          </p>
                          {sub.feedback ? (
                            <div className="mt-2 text-xs text-stone-500 italic bg-stone-50 p-2 rounded border border-stone-100 inline-block max-w-md">
                              "{sub.feedback}"
                            </div>
                          ) : (
                             <span className="text-xs text-stone-400 mt-1 block">No feedback provided yet.</span>
                          )}
                        </td>
                        <td className="p-6 text-stone-500 font-medium tabular-nums">
                          {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-6 text-right">
                          {sub.grade !== undefined ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono">
                              <CheckCircle size={14} /> {sub.grade}/100
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                              <Clock size={14} /> Pending Review
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
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-stone-200 border-dashed text-center shadow-sm">
      <div className="h-20 w-20 bg-stone-50 rounded-full flex items-center justify-center mb-6 border border-stone-100">
        <BookOpen className="text-stone-300" size={32} />
      </div>
      <h3 className="text-2xl font-serif font-bold text-stone-900">No active enrollments</h3>
      <p className="text-stone-500 max-w-md mt-2 mb-8 text-lg font-light">
        You are not currently enrolled in any academic courses. Browse our catalog to begin.
      </p>
      <Link
        href="/courses"
        className="bg-stone-900 text-stone-50 px-8 py-3 rounded-md font-bold hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-stone-200"
      >
        View Course Catalog <ArrowRight size={18} />
      </Link>
    </div>
  );
}