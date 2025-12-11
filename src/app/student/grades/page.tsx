"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react";

interface GradeData {
  assignments: {
    _id: string;
    lesson: { title: string };
    grade?: number;
    feedback?: string;
    createdAt: string;
  }[];
  quizzes: {
    _id: string;
    lesson: { title: string };
    score?: number;
    createdAt: string;
  }[];
}

export default function MyGradesPage() {
  const [data, setData] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchGrades = async () => {
      try {
        console.log("👉 Frontend: Requesting grades...");
        const res = await api.get<GradeData>("/assessments/my-grades");
        
        console.log("👉 Frontend: API Response:", res.data); // <--- CHECK THIS LOG
        
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
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Gradebook</h1>

      {/* --- ASSIGNMENTS SECTION --- */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={20} /> Assignments
        </h2>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="p-4 font-medium">Assignment</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data?.assignments.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-zinc-400">No assignments submitted yet.</td></tr>
              ) : (
                data?.assignments.map((sub) => (
                  <tr key={sub._id} className="hover:bg-zinc-50/50">
                    <td className="p-4 font-medium text-zinc-900">{sub.lesson?.title || "Unknown Lesson"}</td>
                    <td className="p-4 text-zinc-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {sub.grade !== undefined ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Graded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-bold">
                      {sub.grade !== undefined ? `${sub.grade}/100` : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- QUIZZES SECTION --- */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={20} /> Quizzes
        </h2>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
              <tr>
                <th className="p-4 font-medium">Quiz Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data?.quizzes.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-zinc-400">No quizzes taken yet.</td></tr>
              ) : (
                data?.quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td className="p-4 font-medium text-zinc-900">{quiz.lesson?.title || "Unknown Quiz"}</td>
                    <td className="p-4 text-zinc-500">{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right font-bold text-zinc-900">
                      {quiz.score !== undefined ? `${quiz.score}%` : "Pending"}
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