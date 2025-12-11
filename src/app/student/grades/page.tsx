"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, FileText, CheckCircle, XCircle, LayoutList } from "lucide-react";

// --- Types ---
interface Lesson {
  _id: string;
  title: string;
}

interface GradeData {
  assignments: {
    _id: string;
    lesson: Lesson | null; // Lesson might be null if deleted
    grade?: number;
    feedback?: string;
    createdAt: string;
  }[];
  quizzes: {
    _id: string;
    lesson: Lesson | null;
    score?: number;
    createdAt: string;
  }[];
}

export default function MyGradesPage() {
  const [data, setData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes'>('assignments');

  // --- Fetch Data ---
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const res = await api.get<GradeData>("/assessments/my-grades");
        console.log("Frontend Data:", res.data); // Check your console!
        setData(res.data);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">My Gradebook</h1>
        <p className="text-zinc-500 mt-1">Track your progress and feedback across all courses.</p>
      </div>

      {/* --- TAB MENU --- */}
      <div className="flex gap-2 border-b border-zinc-200 mb-8">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-4 text-sm font-medium transition-all flex items-center gap-2 relative ${
            activeTab === 'assignments' 
              ? "text-zinc-900 border-b-2 border-zinc-900" 
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <FileText size={18} />
          Assignments
          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-xs ml-1">
            {data?.assignments.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 px-4 text-sm font-medium transition-all flex items-center gap-2 relative ${
            activeTab === 'quizzes' 
              ? "text-zinc-900 border-b-2 border-zinc-900" 
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <CheckCircle size={18} />
          Quizzes
          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full text-xs ml-1">
            {data?.quizzes.length || 0}
          </span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden min-h-[400px]">
        
        {/* === TAB 1: ASSIGNMENTS === */}
        {activeTab === 'assignments' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="p-4 font-medium w-1/2">Lesson Name</th>
                <th className="p-4 font-medium">Submitted Date</th>
                <th className="p-4 font-medium text-right">Grade / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data?.assignments.length === 0 ? (
                <EmptyState type="Assignments" />
              ) : (
                data?.assignments.map((sub) => (
                  <tr key={sub._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-zinc-900 text-base">
                        {sub.lesson?.title || <span className="text-red-400 italic">Deleted Lesson</span>}
                      </p>
                      {sub.feedback && (
                         <p className="text-xs text-zinc-500 mt-1 max-w-md line-clamp-1">
                           Feedback: "{sub.feedback}"
                         </p>
                      )}
                    </td>
                    <td className="p-4 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {sub.grade !== undefined ? (
                        <div className="inline-flex flex-col items-end">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle size={12} /> {sub.grade}/100
                            </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                          Pending Grading
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* === TAB 2: QUIZZES === */}
        {activeTab === 'quizzes' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="p-4 font-medium w-1/2">Quiz / Lesson Name</th>
                <th className="p-4 font-medium">Taken Date</th>
                <th className="p-4 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data?.quizzes.length === 0 ? (
                <EmptyState type="Quizzes" />
              ) : (
                data?.quizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                           <LayoutList size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900 text-base">
                                {quiz.lesson?.title || <span className="text-zinc-400 italic">Unknown Lesson</span>}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">Quiz ID: {quiz._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-500">{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {quiz.score !== undefined ? (
                         <div className="flex justify-end">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                                quiz.score >= 50 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                : "bg-red-50 text-red-700 border-red-100"
                            }`}>
                                {quiz.score}%
                            </span>
                         </div>
                      ) : (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs border border-yellow-100">
                            Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Helper Component for Empty States
function EmptyState({ type }: { type: string }) {
    return (
        <tr>
            <td colSpan={3} className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-zinc-500">
                    <div className="bg-zinc-50 p-4 rounded-full mb-3">
                        <XCircle size={32} className="text-zinc-300" />
                    </div>
                    <p className="font-semibold text-zinc-900 text-lg">No {type} Found</p>
                    <p className="text-sm mt-1 max-w-sm mx-auto text-zinc-400">
                        It looks like you haven't {type === 'Quizzes' ? 'taken any quizzes' : 'submitted any assignments'} yet. 
                        Go to your courses to start learning!
                    </p>
                </div>
            </td>
        </tr>
    );
}