'use client'
import Image from "next/image";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface CourseProps {
  _id: string;
  title: string;
  thumbnail: string;
  category: string;
  price: number;
  description?: string;
}

export default function CourseCard({ course }: { course: CourseProps }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-zinc-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      
      {/* Image */}
      <div className="relative w-full h-48 bg-zinc-100 overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized={course.thumbnail?.startsWith("http")}
        />

        {/* Price */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-zinc-200">
          <span className="text-sm font-bold text-zinc-900">
            ৳ {course.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col grow space-y-4">

        {/* Category */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md border border-zinc-200">
          <Tag className="w-3 h-3" />
          {course.category}
        </span>

        {/* Title */}
        <h2 className="text-lg font-bold text-zinc-900 line-clamp-2">
          {course.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-zinc-500 line-clamp-2 grow">
          {course.description || "No description provided."}
        </p>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          <Link
            href={
              isAdmin
                ? `/admin/create-course${course._id}`
                : `/courses/${course._id}`
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            {isAdmin ? "Edit Details" : "View Details"}  
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
