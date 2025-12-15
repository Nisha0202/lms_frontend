import Image from "next/image";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";

import type { CourseResponse } from "@/types";

export default function CourseCard({ course }: { course: CourseResponse }) {
  return (
    <div className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-md hover:border-orange-200 transition-all duration-300 overflow-hidden">
      
      {/* Image Container */}
      <div className="relative w-full h-48 bg-stone-100 overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={course.thumbnail?.startsWith("http")}
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-stone-200">
          <span className="text-sm font-bold text-stone-900">
            ৳ {course.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow space-y-4">

        {/* Category Tag */}
        <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md border border-stone-200">
          <Tag className="w-3 h-3" />
          {course.category}
        </span>

        {/* Title */}
        <h2 className="text-lg font-bold text-stone-900 line-clamp-2 group-hover:text-orange-700 transition-colors">
          {course.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-stone-500 line-clamp-2 grow">
          {course.description || "No description provided."}
        </p>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <Link
            href={`/courses/${course._id}`}
            // Button: Dark Stone by default, turns Orange on hover
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors"
          >
            View Details  
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}