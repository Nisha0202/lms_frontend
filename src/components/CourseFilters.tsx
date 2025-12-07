"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";

const categories = [
  "Programming",
  "Design",
  "Marketing",
  "Business",
  "Data Science",
  "Web Development",
];

export default function CourseFilters({
  initialSearch = "",
  initialCategory = "",
}: {
  initialSearch?: string;
  initialCategory?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  
// Sync state with URL changes (Clear filters fix)
useEffect(() => {
  setSearch(initialSearch);
  setCategory(initialCategory);
}, [initialSearch, initialCategory]);


  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  // Debounce search to prevent URL thrashing on every keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search !== initialSearch) {
        updateURL({ search });
      }
    }, 700); // Wait 500ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [search, initialSearch]);

  function updateURL(newParams: Record<string, string>) {
    const query = new URLSearchParams(params.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) query.set(key, value);
      else query.delete(key);
    });

    query.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/courses?${query.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      
      {/* Search Input with Icon */}
      <div className="relative w-full sm:w-2/3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-700" />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for courses..."
          className="block w-full pl-10 pr-3 py-2.5 border text-gray-900 border-zinc-200 rounded-lg leading-5 bg-white placeholder-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent sm:text-sm transition-shadow shadow-sm"
        />
        {search && (
          <button 
            onClick={() => { setSearch(""); updateURL({ search: "" }) }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-zinc-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Dropdown with Icon */}
      <div className="relative w-full sm:w-1/3">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-zinc-400" />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            updateURL({ category: e.target.value });
          }}
          className="block w-full pl-10 pr-10 py-2.5 border border-zinc-200 rounded-lg leading-5 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent sm:text-sm shadow-sm appearance-none cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {/* Custom Chevron */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
}