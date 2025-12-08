"use client";

import Link from "next/link";
import { PlayCircle, Users, Clock } from "lucide-react";

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

  return (
    <div className="group flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">

      {/* Header */}
      <div className="h-40 bg-zinc-900 relative p-6 overflow-hidden">
        {course.thumbnail ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${course.thumbnail})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-zinc-800 to-black opacity-10" />
        )}
        <div className="absolute inset-0 bg-black/20"></div>

        <span className="relative z-10 inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-white/90 text-zinc-900 backdrop-blur-sm">
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-zinc-900 line-clamp-1 mb-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6">
          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded border">
            <Users size={12} />
            <span className="font-medium text-zinc-700">{batchName}</span>
          </div>

          {startDate && (
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>Starts {new Date(startDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-500">Course Progress</span>
            <span className="text-zinc-900">{progress}%</span>
          </div>

          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <Link
            href={`/courses/learn/${course._id}`}
            className="mt-4 flex items-center justify-center gap-2 w-full bg-zinc-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800"
          >
            <PlayCircle size={18} />
            {progress > 0 ? "Continue Learning" : "Start Course"}
          </Link>
        </div>
      </div>
    </div>
  );
}
