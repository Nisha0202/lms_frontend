"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  PlayCircle, FileText, CheckCircle, 
  ChevronLeft, Menu, X, ClipboardList, Send, Loader2, AlertCircle, Check 
} from "lucide-react";

// Types
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

  // --- Data State ---
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  
  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // --- Action States ---
  const [submissionLink, setSubmissionLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false); // Loading for mark complete

  // --- 🔔 Notification State ---
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Helper to show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Auto-hide after 3 seconds
    setTimeout(() => setNotification(null), 3000);
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
          router.push(`/courses/${courseId}`);
        } else if (err.response?.status === 404) {
           setError("Course content not found.");
        } else {
           setError("Failed to load course.");
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
    showNotification("Please enter a link first.", "error");
    return;
  }

  // Allow only Google Drive links
  const isGoogleDriveLink =
    submissionLink.startsWith("https://drive.google.com/") ||
    submissionLink.startsWith("https://docs.google.com/");

  if (!isGoogleDriveLink) {
    showNotification("Only Google Drive links are allowed.", "error");
    return;
  }

  setSubmitting(true);

  try {
    await api.post("/assessments/submit-assignment", {
      lessonId: currentLesson._id,
      driveLink: submissionLink,
    });

    showNotification("Assignment submitted successfully!", "success");
    setSubmissionLink("");
  } catch (err) {
    showNotification("Failed to submit assignment.", "error");
  } finally {
    setSubmitting(false);
  }
};


  const markComplete = async () => {
    if (!currentLesson) return;
    
    setMarkingComplete(true); // Start loading spinner on button
    try {
      await api.post("/learn/complete", { 
        courseId, 
        lessonId: currentLesson._id 
      });
      showNotification("Lesson marked as complete!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save progress.", "error");
    } finally {
      setMarkingComplete(false); // Stop loading
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-2">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <p className="text-zinc-500 text-sm">Loading classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-4 p-4 text-center">
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
    <div className="flex min-h-screen bg-zinc-50 overflow-hidden text-zinc-900 relative">
      
      {/* 🔔 PRETTY TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
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
                  
                  {/* Mark Complete Button (With Loading State) */}
                  <button 
                    onClick={markComplete}
                    disabled={markingComplete}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       markingComplete 
                         ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                         : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    }`}
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
                        className="block w-full text-center bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition"
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