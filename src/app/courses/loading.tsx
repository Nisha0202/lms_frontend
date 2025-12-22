import { LayoutDashboard } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[90vh] mx-auto bg-stone-50 py-12 px-4 sm:px-6 font-sans text-stone-900">
      <div className="container mx-auto max-w-7xl">

        {/* 1. Header Skeleton */}
        {/* We mimic the header height and text positions to prevent jumping */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-6">
          <div>
            {/* Title Skeleton */}
            <div className="h-8 w-48 bg-stone-200 rounded-md animate-pulse mb-3"></div>
            {/* Subtitle/Count Skeleton */}
            <div className="h-5 w-32 bg-stone-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* 2. Filters Skeleton (Optional Placeholder) */}
        <div className="flex gap-4 mb-8 overflow-hidden">
             <div className="h-10 w-full md:w-64 bg-stone-200 rounded-lg animate-pulse"></div>
             <div className="h-10 w-32 bg-stone-200 rounded-lg animate-pulse hidden md:block"></div>
        </div>

        {/* 3. The Grid of Course Card Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* We render 6 mock cards to fill the screen */}
          {[...Array(6)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Component: The Individual Card Skeleton ---
function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden h-full flex flex-col shadow-sm">
      
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-stone-200 animate-pulse relative">
        <div className="absolute top-4 left-4 w-16 h-6 bg-stone-300 rounded-full"></div> {/* Badge placeholder */}
      </div>

      {/* Content Body */}
      <div className="p-5 flex flex-col flex-1 space-y-4">
        
        {/* Title */}
        <div className="space-y-2">
           <div className="h-6 w-3/4 bg-stone-200 rounded animate-pulse"></div>
           <div className="h-6 w-1/2 bg-stone-200 rounded animate-pulse"></div>
        </div>

        {/* Meta info (Instructors/Lessons) */}
        <div className="flex items-center gap-4 pt-2">
            <div className="h-4 w-8 bg-stone-100 rounded-full animate-pulse"></div>
            <div className="h-4 w-20 bg-stone-100 rounded animate-pulse"></div>
        </div>

        {/* Footer / Price Area */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
           <div className="h-8 w-20 bg-stone-200 rounded-lg animate-pulse"></div> {/* Price */}
           <div className="h-8 w-24 bg-stone-200 rounded-lg animate-pulse"></div> {/* Button */}
        </div>
      </div>
    </div>
  );
}