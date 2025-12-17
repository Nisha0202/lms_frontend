"use client";

import Link from "next/link";
import { PlayCircle, Users, Lock, BookOpen } from "lucide-react";

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
  const isStarted = startDate ? new Date(startDate) <= new Date() : true;

  return (
    <div className="group flex flex-col bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300 h-full">

      {/* Header (Thumbnail) */}
      <div className="h-48 bg-stone-100 relative overflow-hidden border-b border-stone-100">
        {course.thumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${course.thumbnail})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300">
            <BookOpen size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Dark overlay for contrast if needed, or subtle tint */}
        <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors duration-500"></div>

        {/* Category Badge */}
        <span className="absolute top-4 left-4 inline-block px-3 py-1 bg-white/95 backdrop-blur-md border border-stone-200 text-stone-900 text-[10px] font-bold uppercase tracking-widest shadow-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Batch Badge */}
        <div className="flex items-center gap-2 mb-3">
            <Users size={12} className="text-orange-700" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{batchName}</span>
        </div>

        <h3 className="text-xl font-serif font-bold text-stone-900 leading-tight mb-4 group-hover:text-orange-700 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <div className="mt-auto space-y-5 pt-4 border-t border-stone-100">
          
          {/* === CONDITIONAL RENDERING === */}
          
          {!isStarted ? (
            // STATE 1: LOCKED
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center gap-2">
               <div className="bg-white p-2 rounded-full border border-stone-200">
                  <Lock size={16} className="text-stone-400" />
               </div>
               <div>
                 <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">Access Locked</p>
                 <p className="text-[10px] text-stone-500 font-medium">
                   Opens on {new Date(startDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                 </p>
               </div>
            </div>
          ) : (
            // STATE 2: UNLOCKED
            <>
              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Completion</span>
                  <span className="text-sm font-bold text-stone-900 font-mono">{progress}%</span>
                </div>

                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-700 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/courses/learn/${course._id}`} 
                className="group/btn relative flex items-center justify-center gap-2 w-full bg-stone-900 text-stone-50 py-3.5 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-orange-800 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                    <PlayCircle size={16} />
                    {progress > 0 ? "Continue Course" : "Start Learning"}
                </span>
              </Link>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
}