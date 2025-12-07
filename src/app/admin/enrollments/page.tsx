"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Search, Loader2, User, BookOpen, Calendar, Mail } from "lucide-react";

interface EnrollmentData {
    _id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    batchName: string;
    enrolledAt: string;
}

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

    // Filter logic for search bar
    const filtered = enrollments.filter(
        (e) =>
            e.studentName.toLowerCase().includes(search.toLowerCase()) ||
            e.courseTitle.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/admin/dashboard" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Student Enrollments</h1>
                        <p className="text-zinc-500 mt-1">View and manage all student enrollments across batches.</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm mb-6 flex items-center gap-3">
                    <Search className="text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by student or course name..."
                        className="flex-1 outline-none text-zinc-900 placeholder:text-zinc-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Table / List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-zinc-400" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 bg-white border border-zinc-200 rounded-xl border-dashed">
                        No enrollments found.
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Course</th>
                                        <th className="px-6 py-4">Batch</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                                    {filtered.map((item) => (
                                        <tr key={item._id} className="hover:bg-zinc-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-zinc-900 flex items-center gap-2">
                                                        <User size={14} className="text-zinc-400" />
                                                        {item.studentName}
                                                    </span>
                                                    <span className="text-zinc-500 text-xs flex items-center gap-2 mt-1">
                                                        <Mail size={12} />
                                                        {item.studentEmail}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={16} className="text-zinc-400" />
                                                    {item.courseTitle}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100">
                                                    {item.batchName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(item.enrolledAt).toLocaleDateString()}
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