// components/admin/CourseRow.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Pencil, Trash } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type Props = {
  course: {
    _id: string;
    title: string;
    category: string;
    price: number;
    thumbnail?: string;
    tags?: string[];
    instructor?: { name?: string; email?: string } | string;
    createdAt?: string;
  };
};

export default function CourseRow({ course }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const ok = confirm(`Delete course "${course.title}"? This cannot be undone.`);
    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/courses/${course._id}`);
      // After delete, refresh current page (router.refresh is available in Next 13+ app)
      router.refresh();
    } catch (err: any) {
      console.error("Delete error", err);
      setError(err?.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  const instructorName =
    typeof course.instructor === "string"
      ? course.instructor
      : course.instructor?.name || course.instructor?.email || "—";

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-4">
      {/* Title + thumbnail */}
      <div className="md:col-span-4 flex items-center gap-4">
        <div className="w-16 h-10 relative rounded-md overflow-hidden bg-zinc-100">
          {course.thumbnail ? (
            // next/image requires domain config; using <img> fallback is safer on admin
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-400">No image</div>
          )}
        </div>
        <div>
          <div className="font-medium text-zinc-900">{course.title}</div>
          <div className="text-xs text-zinc-500">{new Date(course.createdAt || Date.now()).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Category */}
      <div className="md:col-span-2 text-zinc-700">{course.category}</div>

      {/* Price */}
      <div className="md:col-span-2 text-zinc-700">৳ {course.price}</div>

      {/* Instructor */}
      <div className="md:col-span-2 text-zinc-700">{instructorName}</div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end items-center gap-2">
        <Link
          href={`/admin/create-course?editId=${course._id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-sm"
        >
          <Pencil className="w-4 h-4" /> Edit
        </Link>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-zinc-200 text-zinc-700 rounded-md text-sm hover:bg-zinc-50"
          disabled={loading}
        >
          <Trash className="w-4 h-4" /> {loading ? "Deleting..." : "Delete"}
        </button>
      </div>

      {error && (
        <div className="md:col-span-12 text-sm text-red-500 mt-2 px-4">{error}</div>
      )}
    </div>
  );
}
