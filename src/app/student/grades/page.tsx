"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  Loader2, FileText, CheckCircle, XCircle, 
  ArrowLeft, Clock, GraduationCap 
} from "lucide-react";
import type { GradeData } from "@/types";

export default function MyGradesPage() {
  const [assignments, setAssignments] = useState<GradeData['assignments']>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get<GradeData>("/assessments/my-grades");
        setAssignments(res.data.assignments);
      } catch (err) {
        console.error("Failed to fetch grades", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-stone-50 text-stone-500">
      <Loader2 className="animate-spin text-orange-700 mb-4" size={32} />
      <p className="font-serif text-lg">Loading academic records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div>
          <Link 
            href="/student/dashboard" 
            className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-orange-700 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <FileText size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">Academic Record</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Assignment Grades</h1>
              <p className="text-stone-500 mt-2 text-lg font-light">
                Track your submission status and instructor feedback.
              </p>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Assignments Submitted</p>
                <p className="text-2xl font-serif font-bold text-stone-900 leading-none">{assignments.length}</p>
              </div>
              <div className="h-8 w-px bg-stone-200 mx-1" />
              <GraduationCap className="text-stone-300" size={24} />
            </div>
          </div>
        </div>

        {/* --- Content Table --- */}
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden ring-1 ring-black/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="p-6 w-1/2">Coursework Details</th>
                <th className="p-6">Submission Date</th>
                <th className="p-6 text-right">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {assignments.length === 0 ? (
                <EmptyState />
              ) : (
                assignments.map((sub) => (
                  <tr key={sub._id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="p-6">
                      <p className="font-serif font-bold text-stone-900 text-base group-hover:text-orange-700 transition-colors">
                        {sub.lesson?.title || <span className="text-red-400 italic">Deleted Lesson</span>}
                      </p>
                      {sub.feedback ? (
                         <div className="mt-3 relative pl-3 border-l-2 border-stone-200">
                           <p className="text-xs text-stone-500 italic leading-relaxed">
                             "{sub.feedback}"
                           </p>
                         </div>
                      ) : (
                         <p className="text-xs text-stone-400 mt-1 italic">No feedback provided yet.</p>
                      )}
                    </td>
                    <td className="p-6 text-stone-500 font-medium tabular-nums">
                      {new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-6 text-right">
                      {sub.grade !== undefined ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 font-mono">
                            <CheckCircle size={14} /> {sub.grade}/100
                          </span>
                          <span className="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wide">Graded</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wide">
                            <Clock size={14} /> Pending
                          </span>
                          <span className="text-[10px] uppercase font-bold text-amber-600/70 tracking-wide">In Review</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Helper Component for Empty State
function EmptyState() {
  return (
    <tr>
      <td colSpan={3} className="p-20 text-center">
        <div className="flex flex-col items-center justify-center text-stone-500">
          <div className="bg-stone-50 p-4 rounded-full mb-4 border border-stone-200">
            <XCircle size={32} className="text-stone-300" />
          </div>
          <p className="font-serif font-bold text-stone-900 text-xl">No Assignments Found</p>
          <p className="text-base mt-2 max-w-sm mx-auto text-stone-400 font-light">
            You haven't submitted any coursework yet. Once you submit work from your lessons, it will appear here.
          </p>
        </div>
      </td>
    </tr>
  );
}