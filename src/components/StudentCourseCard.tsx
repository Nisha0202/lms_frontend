"use client";

import Link from "next/link";
import { PlayCircle, Users, Clock, Lock } from "lucide-react";

interface Props {
  enrollment: {
    _id: string;
    course: {
      _id: string;
      title: string;
      category: string;
      thumbnail?: string;
    };
    batchName: string;
    startDate: string | null;
    progress: number;
  };
}

export default function StudentCourseCard({ enrollment }: Props) {
  const { course, batchName, startDate, progress } = enrollment;

  // 1. LOGIC: Check if course has started
  // If startDate is null, we assume it's open. Otherwise, compare with Today.
  const isStarted = startDate ? new Date(startDate) <= new Date() : true;

  return (
    <div className="group flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">

      {/* Header (Thumbnail) */}
      <div className="h-40 bg-zinc-900 relative p-6 overflow-hidden">
        {course.thumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${course.thumbnail})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-black opacity-50" />
        )}
        <div className="absolute inset-0 bg-black/10"></div>

        <span className="relative z-10 inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/90 text-zinc-900 backdrop-blur-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-zinc-900 line-clamp-1 mb-2">
          {course.title}
        </h3>

        {/* Batch Badge */}
        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6">
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded border border-zinc-100">
            <Users size={12} />
            <span className="font-medium text-zinc-700">{batchName}</span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          
          {/* === CONDITIONAL RENDERING STARTS HERE === */}
          
          {!isStarted ? (
            // STATE 1: LOCKED (Course hasn't started)
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1">
               <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs">
                  <Lock size={14} />
                  <span>Access Locked</span>
               </div>
               <p className="text-[10px] text-amber-600">
                 Starts on {new Date(startDate!).toLocaleDateString()}
               </p>
            </div>
          ) : (
            // STATE 2: UNLOCKED (Progress Bar + Link)
            <>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-500">Course Progress</span>
                <span className="text-zinc-900">{progress}%</span>
              </div>

              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <Link
                // Note: Ensure this URL matches your actual file structure (e.g. /learn/course/[id])
                href={`/learn/course/${course._id}`} 
                className="mt-4 flex items-center justify-center gap-2 w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                <PlayCircle size={18} />
                {progress > 0 ? "Continue Learning" : "Start Course"}
              </Link>
            </>
          )}
          
          {/* === CONDITIONAL RENDERING ENDS HERE === */}

        </div>
      </div>
    </div>
  );
}