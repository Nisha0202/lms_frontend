"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  PlayCircle, FileText, CheckCircle, 
  ChevronLeft, Menu, X, ClipboardList, Send, Loader2 
} from "lucide-react";

// 1. Define Types matching your Backend Schema
interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  type?: 'video' | 'quiz' | 'assignment';
  quizFormUrl?: string;
  assignmentText?: string;
}

interface CourseData {
  _id: string;
  title: string;
  lessons: Lesson[];
}

// 2. Define the API Response shape
interface LearnApiResponse {
  course: CourseData;
  completedLessons?: string[]; // Array of lesson IDs
}

export default function LearningPage() {
  const { courseId } = useParams();
  const router = useRouter();

  // 3. Use typed state
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Assignment State
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Course Content
 useEffect(() => {
  const fetchContent = async () => {
    try {
      // Call backend route /learn/course/:courseId
      const res = await api.get<{
        course: CourseData;
        completedLessons: string[];
      }>(`/learn/course/${courseId}`);

      setCourse(res.data.course);

      if (res.data.course.lessons.length > 0) {
        setCurrentLesson(res.data.course.lessons[0]);
      }
    } catch (err: any) {
      console.error(err);

      // Redirect if not enrolled or error
      if (err.response?.status === 403) {
        alert("You are not enrolled in this course.");
      }
      router.push(`/courses/${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  if (courseId) fetchContent();
}, [courseId, router]);


  // Handle Assignment Submit
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson) return;

    setSubmitting(true);
    try {
      await api.post("/assessments/submit", {
        lessonId: currentLesson._id,
        driveLink: submissionLink
      });
      alert("Assignment submitted successfully!");
      setSubmissionLink("");
    } catch (err) {
      alert("Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark Lesson Complete
  const markComplete = async () => {
    if (!currentLesson) return;
    try {
      await api.post("/learn/complete", { 
        courseId, 
        lessonId: currentLesson._id 
      });
      alert("Lesson marked as complete!");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-900" /></div>;
  if (!course) return null;

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden text-zinc-900">
      
      {/* ================= SIDEBAR (Playlist) ================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white">
            <Link href="/student/dashboard" className="flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-900">
              <ChevronLeft size={14} /> Back to Dashboard
            </Link>
            <button className="md:hidden text-zinc-500" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 bg-zinc-50 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900 line-clamp-1">{course.title}</h2>
            <p className="text-xs text-zinc-500 mt-1">{course.lessons.length} Lessons</p>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {course.lessons.map((lesson, idx) => {
              const isActive = currentLesson?._id === lesson._id;
              return (
                <button
                  key={lesson._id}
                  onClick={() => {
                    setCurrentLesson(lesson);
                    // Close sidebar on mobile when a lesson is clicked
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${
                    isActive 
                      ? "bg-zinc-900 text-white" 
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isActive ? <PlayCircle size={16} /> : <span className="text-xs font-mono w-4 inline-block text-center">{idx + 1}</span>}
                  </div>
                  <div>
                    <p className={`text-sm font-medium leading-tight ${isActive ? "text-white" : "text-zinc-900"}`}>
                      {lesson.title}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] flex items-center gap-1 ${isActive ? "opacity-70" : "text-zinc-400"}`}>
                        <FileText size={10} /> {lesson.type || 'Video'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT (Video Player) ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white border-b border-zinc-200 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-600">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm truncate text-zinc-900">{currentLesson?.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Video Player Wrapper */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative ring-1 ring-zinc-900/5">
              {currentLesson?.videoUrl ? (
                <iframe 
                  src={currentLesson.videoUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  title="Lesson Video"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Select a lesson to start watching
                </div>
              )}
            </div>

            {/* Lesson Details & Actions */}
            {currentLesson && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900">{currentLesson.title}</h1>
                    <p className="text-zinc-600 mt-2 leading-relaxed">
                      {currentLesson.description || "No description available for this lesson."}
                    </p>
                  </div>
                  <button 
                    onClick={markComplete}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition"
                  >
                    <CheckCircle size={16} /> Mark as Complete
                  </button>
                </div>

                <div className="h-px bg-zinc-200 w-full"></div>

                {/* TABS: Quiz & Assignments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Assignment Box */}
                  {currentLesson.assignmentText && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <FileText size={20} /> Assignment
                      </h3>
                      <div className="text-sm text-zinc-600 mb-4 bg-zinc-50 p-3 rounded border border-zinc-100 whitespace-pre-wrap">
                        {currentLesson.assignmentText}
                      </div>
                      
                      <form onSubmit={handleSubmitAssignment} className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Submit Work</label>
                        <input 
                          type="url" 
                          required
                          placeholder="Paste Google Drive Link here..."
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-900 outline-none"
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                        />
                        <button 
                          disabled={submitting}
                          className="w-full bg-zinc-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 disabled:opacity-70 flex justify-center items-center gap-2 transition-colors"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} />}
                          Submit Assignment
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Quiz Box */}
                  {currentLesson.quizFormUrl && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm h-fit">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <ClipboardList size={20} /> Quiz
                      </h3>
                      <p className="text-sm text-zinc-600 mb-6">
                        Test your knowledge on this topic. Complete the quiz to verify your understanding.
                      </p>
                      <a 
                        href={currentLesson.quizFormUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Take Quiz Now
                      </a>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 