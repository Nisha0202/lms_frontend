
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Users, PlayCircle, FileText, CheckCircle2, Lock } from "lucide-react";
import EnrollmentButton from "@/components/EnrollmentButton"; // We will create this small helper
import Link from "next/link";


// Helper to format currency
const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(price);

export default async function CourseDetails(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;


  // Fetch Data
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/courses/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();
  const course = await res.json();

  return (
    <div className="min-h-screen bg-zinc-50 text-gray-800 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ================= LEFT COLUMN (Content) ================= */}
          <div className="lg:col-span-2 space-y-10">

            {/* 1. Header Section */}
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                {course.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
                {course.title}
              </h1>
              <p className="text-lg text-zinc-600 leading-relaxed">
                {course.description}
              </p>

              {/* Instructor Mini-Profile */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200">
                <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold">
                  {course.instructor?.name?.charAt(0) || "I"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Created by {course.instructor?.name}</p>
                  <p className="text-xs text-zinc-500">Expert Instructor</p>
                </div>
              </div>
            </div>

            {/* 2. Syllabus (Redesigned) */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
                <h2 className="text-xl font-bold text-zinc-900">Course Curriculum</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {course.lessons?.length} lessons included
                </p>
              </div>

              <div className="divide-y divide-zinc-100">
                {course.lessons?.map((lesson: any, index: number) => (
                  <div key={lesson._id} className="p-4 flex items-start gap-4 hover:bg-zinc-50 transition">
                    <div className="mt-1">
                      <PlayCircle className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        {index + 1}. {lesson.title}
                      </h3>
                      <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {lesson.type || 'Video'}
                        </span>
                        {lesson.quizFormUrl && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 size={12} /> Quiz included
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Lock Icon to show it's gated content */}
                    <div className="ml-auto">
                      <Lock className="w-4 h-4 text-zinc-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Link href={`/courses/learn/${course._id}`}>start learning</Link>
            <Link href={`/admin/courses/edit/${course._id}`}>edit course</Link>


          </div>

          {/* ================= RIGHT COLUMN (Sticky Sidebar) ================= */}
          <div className="relative">
            <div className="sticky top-24 space-y-6">

              {/* Main Action Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-48 w-full bg-zinc-900">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover opacity-90"
                    unoptimized={course.thumbnail?.startsWith("http")}
                  />
                </div>

                <div className="p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <p className="text-zinc-500 text-sm font-medium">One-time payment</p>
                    <p className="text-3xl font-bold text-zinc-900">
                      {formatPrice(course.price)}
                    </p>
                  </div>

                  {/* Batch Selection & Enroll Button */}
                  {/* We extract this to a Client Component because it needs useState */}
                 
                  <EnrollmentButton
                    courseId={course._id}
                    batches={course.batches}
                  />


                  {/* Guarantee Text */}
                  <p className="text-xs text-center text-zinc-400">
                    30-Day Money-Back Guarantee • Full Lifetime Access
                  </p>
                </div>
              </div>

              {/* Course Features */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
                <h3 className="font-semibold text-zinc-900 text-sm">This course includes:</h3>
                <ul className="space-y-3 text-sm text-zinc-600">
                  <li className="flex items-center gap-3">
                    <PlayCircle size={18} className="text-zinc-400" />
                    {course.lessons.length} video lessons
                  </li>
                  <li className="flex items-center gap-3">
                    <FileText size={18} className="text-zinc-400" />
                    Assignments & Quizzes
                  </li>
                  <li className="flex items-center gap-3">
                    <Users size={18} className="text-zinc-400" />
                    Access on mobile and TV
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}