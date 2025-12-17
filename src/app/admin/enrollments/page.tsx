"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Search, Loader2, User, BookOpen, Calendar, Mail, GraduationCap } from "lucide-react";
import { EnrollmentData } from "@/types";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<EnrollmentData[]>("/enrollments/admin/all-enroll");
        setEnrollments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = enrollments.filter(
    (e) =>
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* --- Header Section --- */}
        <div>
          <Link 
            href="/admin/dashboard" 
            className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-orange-700 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <GraduationCap size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">Registry</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Student Enrollments</h1>
              <p className="text-stone-500 mt-2 text-lg font-light">
                Master list of all students registered across active curriculums.
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                type="text"
                placeholder="Search student or course..."
                className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-md leading-5 bg-white placeholder-stone-400 focus:outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 sm:text-sm shadow-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- Table Section --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-500">
            <Loader2 className="animate-spin text-orange-700 mb-4" size={32} />
            <p className="font-serif text-lg">Retrieving records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-lg border border-stone-200 border-dashed">
            <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-stone-300" size={24} />
            </div>
            <p className="text-stone-900 font-serif text-xl font-bold">No enrollments found</p>
            <p className="text-stone-500 mt-2">Adjust your search or wait for new students.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden ring-1 ring-black/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-600 uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Profile</th>
                    <th className="px-6 py-4">Course Enrolled</th>
                    <th className="px-6 py-4">Batch Allocation</th>
                    <th className="px-6 py-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((item) => (
                    <tr key={item._id} className="hover:bg-orange-50/20 transition-colors group">
                      {/* Student Column */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-serif font-bold text-stone-900 text-base flex items-center gap-2 group-hover:text-orange-800 transition-colors">
                            {item.studentName}
                          </span>
                          <span className="text-stone-500 text-xs flex items-center gap-1.5 mt-1 font-mono">
                            <Mail size={12} className="text-stone-400" />
                            {item.studentEmail}
                          </span>
                        </div>
                      </td>

                      {/* Course Column */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-medium text-stone-700">
                          <BookOpen size={16} className="text-orange-700/60" />
                          {item.courseTitle}
                        </div>
                      </td>

                      {/* Batch Column */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 shadow-sm">
                          {item.batchName}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="px-6 py-5 text-stone-500 text-xs font-medium tabular-nums">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-stone-400" />
                          {new Date(item.enrolledAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}