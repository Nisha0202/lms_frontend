import Image from "next/image";
import { notFound } from "next/navigation";
import { Users, PlayCircle, FileText, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import EnrollmentButton from "@/components/EnrollmentButton"; 

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
    <div className="min-h-screen bg-stone-50 text-stone-900 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ================= LEFT COLUMN (Content) ================= */}
          <div className="lg:col-span-2 space-y-10">

            {/* 1. Header Section */}
            <div className="space-y-6">
              {/* Category Badge - Orange Theme */}
              <span className="inline-flex items-center rounded-md bg-orange-50 px-3 py-1 text-xs font-bold tracking-wider uppercase text-orange-800 border border-orange-100">
                {course.category}
              </span>
              
              {/* Title - Serif Font */}
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {course.title}
              </h1>
              
              <p className="text-lg text-stone-600 leading-relaxed">
                {course.description}
              </p>

              {/* Instructor Mini-Profile */}
              <div className="flex items-center gap-4 pt-6 border-t border-stone-200">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-lg border border-orange-200">
                  {course.instructor?.name?.charAt(0) || "I"}
                </div>
                <div>
                  <p className="text-base font-bold text-stone-900">Created by {course.instructor?.name}</p>
                  <p className="text-sm text-stone-500 font-medium">Principal Engineer & Instructor</p>
                </div>
              </div>
            </div>

            {/* 2. Syllabus */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Curriculum</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    {course.lessons?.length} lessons included
                  </p>
                </div>
              </div>

              <div className="divide-y divide-stone-100">
                {course.lessons?.map((lesson: any, index: number) => (
                  <div key={lesson._id} className="p-5 flex items-start gap-4 hover:bg-orange-50/30 transition-colors group">
                    <div className="mt-1">
                      {/* Icon turns orange on hover */}
                      <PlayCircle className="w-5 h-5 text-stone-400 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-orange-900">
                        {index + 1}. {lesson.title}
                      </h3>
                      <div className="flex gap-4 mt-2 text-xs text-stone-500 font-medium">
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {lesson.type || 'Video'}
                        </span>
                        {lesson.quizFormUrl && (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> Quiz
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Lock Icon */}
                    <div className="ml-auto">
                      <Lock className="w-4 h-4 text-stone-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN (Sticky Sidebar) ================= */}
          <div className="relative">
            <div className="sticky top-24 space-y-6">

              {/* Main Action Card */}
              <div className="bg-white rounded-xl border border-stone-200 shadow-xl shadow-stone-200/50 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-56 w-full bg-stone-200">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    unoptimized={course.thumbnail?.startsWith("http")}
                  />
                </div>

                <div className="p-6 space-y-6">
                  {/* Price */}
                  <div>
                    <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Investment</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-serif font-bold text-stone-900">
                        {formatPrice(course.price)}
                      </p>
                      <span className="text-stone-400 text-sm font-medium line-through">
                        {formatPrice(course.price * 1.5)}
                      </span>
                    </div>
                  </div>

                  {/* Batch Selection & Enroll Button */}
                  {/* Note: Ensure EnrollmentButton uses Orange colors internally or passes className */}
                  <div className="pt-2">
                    <EnrollmentButton
                      price={course.price}
                      courseId={course._id}
                      batches={course.batches}
                    />
                  </div>

                  {/* Guarantee Text */}
                  <div className="flex items-center justify-center gap-2 text-xs text-stone-500 font-medium pt-2">
                    <ShieldCheck size={14} className="text-orange-700"/>
                    30-Day Money-Back Guarantee
                  </div>
                </div>
              </div>

              {/* Course Features */}
              <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
                <h3 className="font-serif font-bold text-stone-900 text-lg mb-4">What's Inside</h3>
                <ul className="space-y-4 text-sm text-stone-600 font-medium">
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-100 text-orange-700 rounded-md">
                        <PlayCircle size={16} />
                    </div>
                    {course.lessons.length} HD video lessons
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-100 text-orange-700 rounded-md">
                        <FileText size={16} />
                    </div>
                    Source code & Assignments
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