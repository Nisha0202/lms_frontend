"use client";

import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useState } from "react";

export default function DashboardActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/courses/${courseId}`);
      router.refresh(); // Reloads the page data
    } catch (error) {
      alert("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/admin/create-course?edit=${courseId}`} // You can handle edit logic later
        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
        title="Edit Course"
      >
        <Edit size={16} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Delete Course"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}