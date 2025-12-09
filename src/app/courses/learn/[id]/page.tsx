"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  PlayCircle, FileText, CheckCircle, 
  ChevronLeft, Menu, X, ClipboardList, Send, Loader2, AlertCircle 
} from "lucide-react";

// --- Types ---
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

interface LearnApiResponse {
  course: CourseData;
  completedLessons: string[];
}

export default function LearningPage() {
  const params = useParams();
  const courseId = (params?.courseId || params?.id) as string;
  const router = useRouter();

  // --- State ---
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // New States for Feedback
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [markingComplete, setMarkingComplete] = useState(false);

  // Assignment States
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Helper to show temporary messages
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  // --- Fetch Data ---
  useEffect(() => {
    if (!courseId) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get<LearnApiResponse>(`/learn/course/${courseId}`);
        setCourse(res.data.course);

        if (res.data.course.lessons.length > 0) {
          setCurrentLesson(res.data.course.lessons[0]);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        if (err.response?.status === 403) {
          alert("You are not enrolled in this course.");
          router.push(`/courses/${courseId}`);
        } else if (err.response?.status === 404) {
           setError("Course content not found.");
        } else {
           setError("Failed to load course. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId, router]);

  // --- Handlers ---
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLesson) return;

    if (!submissionLink.trim()) {
      showError("Please enter your Google Drive link.");
      return;
    }

    const driveRegex = /^(https?:\/\/)?(www\.)?(drive\.google\.com|docs\.google\.com)\/.+$/;
    if (!driveRegex.test(submissionLink.trim())) {
      showError("Please submit a valid Google Drive link only.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/assessments/submit", {
        lessonId: currentLesson._id,
        driveLink: submissionLink.trim(),
      });
      showSuccess("Assignment submitted successfully!");
      setSubmissionLink("");
    } catch (err) {
      showError("Failed to submit assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  const markComplete = async () => {
    if (!currentLesson) return;
    
    setMarkingComplete(true);
    try {
      await api.post("/learn/complete", { 
        courseId, 
        lessonId: currentLesson._id 
      });
      showSuccess("Lesson marked as complete!");
    } catch (err) {
      console.error(err);
      showError("Failed to save progress.");
    } finally {
      setMarkingComplete(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 gap-2">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <p className="text-zinc-500 text-sm">Loading classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4 p-4 text-center">
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold text-zinc-900">{error}</h2>
        <Link href="/student/dashboard" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden text-zinc-900 relative">
      
      {/* --- TOAST NOTIFICATIONS --- */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium animate-in slide-in-from-right-5 fade-in duration-300">
            <CheckCircle size={16} className="text-emerald-600" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium animate-in slide-in-from-right-5 fade-in duration-300">
            <AlertCircle size={16} className="text-red-600" />
            {errorMessage}
          </div>
        )}
      </div>

      {/* ================= SIDEBAR (Playlist) ================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
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

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {course.lessons.map((lesson, idx) => {
              const isActive = currentLesson?._id === lesson._id;
              return (
                <button
                  key={lesson._id}
                  onClick={() => {
                    setCurrentLesson(lesson);
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
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-tight truncate ${isActive ? "text-white" : "text-zinc-900"}`}>
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

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden p-4 bg-white border-b border-zinc-200 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-zinc-600">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm truncate text-zinc-900">{currentLesson?.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Video Player */}
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

            {/* Lesson Details */}
            {currentLesson && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-zinc-900">{currentLesson.title}</h1>
                    <p className="text-zinc-600 mt-2 leading-relaxed">
                      {currentLesson.description || "No description available for this lesson."}
                    </p>
                  </div>
                  
                  {/* Mark Complete Button with Loading State */}
                  <button 
                    onClick={markComplete}
                    disabled={markingComplete}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 disabled:opacity-70 transition-colors"
                  >
                    {markingComplete ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    {markingComplete ? "Saving..." : "Mark as Complete"}
                  </button>
                </div>

                <div className="h-px bg-zinc-200 w-full"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment */}
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

                  {/* Quiz */}
                  {currentLesson.quizFormUrl && (
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm h-fit">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 mb-4">
                        <ClipboardList size={20} /> Quiz
                      </h3>
                      <p className="text-sm text-zinc-600 mb-6">Complete the quiz to verify your understanding.</p>
                      <a 
                        href={currentLesson.quizFormUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-yellow-500  py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
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