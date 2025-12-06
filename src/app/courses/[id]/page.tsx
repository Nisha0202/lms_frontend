import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Users } from "lucide-react";
// import EnrollCard from "./components/EnrollCard";

export default async function CourseDetails({ params }: { params: any }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}`,
    { cache: "no-store" }
  );

  if (!res.ok) return notFound();
  const course = await res.json();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={1200}
            height={600}
            className="w-full h-64 object-cover rounded-xl"
          />

          <h1 className="text-3xl font-bold dark:text-white">
            {course.title}
          </h1>

          <p className="text-zinc-700 dark:text-zinc-400">
            {course.description}
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-3 dark:text-white">
              Syllabus
            </h2>
            <ul className="space-y-2">
              {course.lessons.map((lesson: any) => (
                <li
                  key={lesson._id}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                >
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE STICKY CARD */}
        {/* <EnrollCard course={course} /> */}
      </div>
    </div>
  );
}
