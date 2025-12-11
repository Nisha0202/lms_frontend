"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react";

// --- Types ---
interface Lesson {
  _id: string;
  title: string;
}

interface GradeData {
  assignments: {
    _id: string;
    lesson: Lesson | null; 
    grade?: number;
    feedback?: string;
    createdAt: string;
  }[];
  // Removed quizzes from interface
}

export default function MyGradesPage() {
  const [assignments, setAssignments] = useState<GradeData['assignments']>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get<GradeData>("/assessments/my-grades");
        // Only set assignments
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
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-zinc-400" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 min-h-[90vh]">
      
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-zinc-900 rounded-xl text-white">
            <FileText size={24} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-zinc-900">Assignment Grades</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Track your submission status and instructor feedback.</p>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="p-4 font-medium w-1/2">Lesson Name</th>
              <th className="p-4 font-medium">Submitted Date</th>
              <th className="p-4 font-medium text-right">Grade / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {assignments.length === 0 ? (
              <EmptyState />
            ) : (
              assignments.map((sub) => (
                <tr key={sub._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-zinc-900 text-base">
                      {sub.lesson?.title || <span className="text-red-400 italic">Deleted Lesson</span>}
                    </p>
                    {sub.feedback ? (
                       <p className="text-xs text-zinc-500 mt-1 max-w-md line-clamp-2">
                         <span className="font-medium text-zinc-700">Feedback:</span> "{sub.feedback}"
                       </p>
                    ) : (
                        <p className="text-xs text-zinc-400 mt-1 italic">No feedback provided yet.</p>
                    )}
                  </td>
                  <td className="p-4 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {sub.grade !== undefined ? (
                      <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle size={14} /> {sub.grade}/100
                          </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <Loader2 size={12} className="animate-spin" /> Pending Grading
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper Component for Empty State
function EmptyState() {
    return (
        <tr>
            <td colSpan={3} className="p-16 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-500">
                    <div className="bg-zinc-50 p-4 rounded-full mb-3 border border-zinc-100">
                        <XCircle size={32} className="text-zinc-300" />
                    </div>
                    <p className="font-semibold text-zinc-900 text-lg">No Assignments Found</p>
                    <p className="text-sm mt-1 max-w-sm mx-auto text-zinc-400">
                        You haven't submitted any assignments yet. Once you submit work from your lessons, it will appear here.
                    </p>
                </div>
            </td>
        </tr>
    );
}