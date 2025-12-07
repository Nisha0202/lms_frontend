// app/admin/courses/page.tsx
import CourseRow from "@/components/CourseRow";
import { Pencil, Trash, Plus } from "lucide-react";
import Link from "next/link";

type CoursesResponse = {
  total: number;
  page: number;
  limit: number;
  courses: any[];
};

async function fetchCourses(): Promise<CoursesResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const res = await fetch(`${apiUrl}/courses?limit=100`, { cache: "no-store" });
  if (!res.ok) return { total: 0, page: 1, limit: 10, courses: [] };
  return res.json();
}

export default async function AdminCoursesPage() {
  const { courses } = await fetchCourses();

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Manage Courses</h1>
            <p className="text-sm text-zinc-500">View, edit, or delete courses.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/create-course"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md"
            >
              <Plus className="w-4 h-4" /> Create Course
            </Link>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-zinc-600 border-b border-zinc-100">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Instructor</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-zinc-100">
            {courses.map((course: any) => (
              <CourseRow key={course._id} course={course} />
            ))}
            {courses.length === 0 && (
              <div className="p-6 text-center text-zinc-500">No courses yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
