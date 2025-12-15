import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "@/components/CourseFilters";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { CoursesResponse } from "@/types";

async function getCourses(searchParams: any): Promise<CoursesResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const page = searchParams.page || "1";
  const limit = searchParams.limit || "6";
  const search = searchParams.search || "";
  const category = searchParams.category || "";

  const query = new URLSearchParams({
    page,
    limit,
    search,
    category,
  });

  try {
    const res = await fetch(`${apiUrl}/courses?${query.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { total: 0, page: 1, limit: 6, courses: [] };
    }
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return { total: 0, page: 1, limit: 6, courses: [] };
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  // AWAIT the searchParams before using them (Next.js 15+)
  const resolvedSearchParams = await searchParams;

  const params = {
    page: typeof resolvedSearchParams.page === 'string' ? resolvedSearchParams.page : '1',
    limit: typeof resolvedSearchParams.limit === 'string' ? resolvedSearchParams.limit : '6',
    search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : '',
    category: typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : '',
  };

  const { courses, total, page, limit } = await getCourses(params);

  const pageNumber = Number(page);
  const totalPages = Math.ceil(total / limit);

  // Helper to generate pagination links
  const createPageURL = (newPage: number) => {
    const urlParams = new URLSearchParams(params);
    urlParams.set('page', newPage.toString());
    return `/courses?${urlParams.toString()}`;
  };

  return (
    <div className="min-h-[90vh] mx-auto bg-stone-50 py-12 px-4 sm:px-6 font-sans text-stone-900">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Explore Courses</h1>
            <p className="text-stone-500 mt-2 font-medium">
              Showing <span className="text-stone-900 font-bold">{courses.length}</span> of <span className="text-stone-900 font-bold">{total}</span> results
            </p>
          </div>
        </div>

        {/* Filters */}
        <CourseFilters 
          initialSearch={params.search} 
          initialCategory={params.category} 
        />

        {/* Empty State */}
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-stone-200 border-dashed text-center shadow-sm">
            <div className="bg-stone-50 p-4 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">No courses found</h3>
            <p className="text-stone-500 max-w-sm mt-2">
              We couldn't find any courses matching your criteria. Try clearing the filters.
            </p>
            <Link 
              href="/courses" 
              className="mt-6 text-sm font-bold text-orange-700 hover:text-orange-800 hover:underline underline-offset-4"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 border-t border-stone-200 pt-8">
                {/* Prev Button */}
                <Link
                  href={createPageURL(pageNumber - 1)}
                  className={`flex items-center gap-1 px-5 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    pageNumber <= 1
                      ? "bg-stone-50 text-stone-300 border-stone-100 pointer-events-none"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-200 shadow-sm"
                  }`}
                  aria-disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Link>

                <span className="text-sm font-bold text-stone-600 px-4">
                  Page {pageNumber} of {totalPages}
                </span>

                {/* Next Button */}
                <Link
                  href={createPageURL(pageNumber + 1)}
                  className={`flex items-center gap-1 px-5 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    pageNumber >= totalPages
                      ? "bg-stone-50 text-stone-300 border-stone-100 pointer-events-none"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-200 shadow-sm"
                  }`}
                  aria-disabled={pageNumber >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}