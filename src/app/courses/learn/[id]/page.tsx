"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  PlayCircle, FileText, CheckCircle, 
  ChevronLeft, Menu, X, ClipboardList, Send, Loader2, AlertCircle, 
  BookOpen, Video, GraduationCap
} from "lucide-react";

import type {  Lesson } from "@/types";

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
  const [markingComplete, setMarkingComplete] = useState(false);

  // --- 🔔 Notification State ---
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
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
    
    setMarkingComplete(true); 
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
      setMarkingComplete(false);
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <Loader2 className="animate-spin text-orange-700" size={32} />
        <p className="text-stone-500 font-serif text-lg">Preparing classroom environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4 p-4 text-center">
        <AlertCircle className="text-red-700" size={48} />
        <h2 className="text-2xl font-serif font-bold text-stone-900">{error}</h2>
        <Link href="/student/dashboard" className="text-sm font-bold uppercase tracking-widest text-stone-500 hover:text-orange-700 underline transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="flex min-h-screen bg-stone-50 overflow-hidden text-stone-900 relative font-sans">
      
      {/* 🔔 PRETTY TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-md shadow-xl border-l-4 ${
            notification.type === 'success' 
              ? 'bg-white border-emerald-500 text-stone-800' 
              : 'bg-white border-red-500 text-stone-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <span className="text-sm font-bold font-serif">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-30 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-stone-100 border-r border-stone-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-100 flex items-center justify-between">
          <Link href="/student/dashboard" className="group flex items-center text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-orange-700 transition-colors">
            <ChevronLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
          <button className="md:hidden text-stone-500 hover:text-stone-900" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {/* Course Info */}
        <div className="p-6 bg-white border-b border-stone-200">
          <div className="flex items-center gap-2 text-orange-700 mb-2">
             <BookOpen size={16} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Current Course</span>
          </div>
          <h2 className="font-serif font-bold text-xl text-stone-900 leading-tight line-clamp-2">{course.title}</h2>
          <p className="text-xs text-stone-500 mt-2 font-medium">{course.lessons.length} Modules</p>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {course.lessons.map((lesson, idx) => {
            const isActive = currentLesson?._id === lesson._id;
            return (
              <button
                key={lesson._id}
                onClick={() => {
                  setCurrentLesson(lesson);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-md flex items-start gap-3 transition-all border ${
                  isActive 
                    ? "bg-white border-stone-200 shadow-sm ring-1 ring-black/5" 
                    : "border-transparent text-stone-500 hover:bg-stone-200/50 hover:text-stone-900"
                }`}
              >
                <div className={`mt-0.5 shrink-0 ${isActive ? "text-orange-700" : "text-stone-400"}`}>
                  {isActive ? <PlayCircle size={16} /> : <span className="text-xs font-mono font-bold w-4 inline-block text-center">{idx + 1}</span>}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-bold leading-tight truncate ${isActive ? "text-stone-900" : "text-stone-600"}`}>
                    {lesson.title}
                  </p>
                  {isActive && <p className="text-[10px] text-orange-700 uppercase tracking-wider font-bold mt-1">Now Playing</p>}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-stone-50">
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 bg-white border-b border-stone-200 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-600">
            <Menu size={20} />
          </button>
          <span className="font-serif font-bold text-sm truncate text-stone-900">{currentLesson?.title}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* Video Player Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-400">
                    <Video size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Video Lecture</span>
                </div>
                
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative ring-1 ring-stone-900/10">
                {currentLesson?.videoUrl ? (
                    <iframe 
                    src={currentLesson.videoUrl.replace("watch?v=", "embed/")}
                    className="w-full h-full"
                    allowFullScreen
                    title="Lesson Video"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-500 bg-stone-100">
                      <GraduationCap size={48} className="mb-4 text-stone-300" />
                      <p className="font-serif text-lg">Select a lesson from the syllabus</p>
                    </div>
                )}
                </div>
            </div>

            {/* Lesson Details */}
            {currentLesson && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-stone-200 pb-8">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">{currentLesson.title}</h1>
                    <p className="text-stone-600 mt-4 leading-relaxed text-lg font-light">
                      {currentLesson.description || "No description available for this lesson."}
                    </p>
                  </div>
                  
                  {/* Mark Complete Button */}
                  <button 
                    onClick={markComplete}
                    disabled={markingComplete}
                    className={`shrink-0 flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-sm ${
                       markingComplete 
                         ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200" 
                         : "bg-white text-stone-900 border border-stone-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {markingComplete ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    {markingComplete ? "Saving..." : "Mark Complete"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Assignment Card */}
                  {currentLesson.assignmentText && (
                    <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-50 rounded-md text-orange-700">
                            <FileText size={20} /> 
                        </div>
                        <h3 className="font-serif font-bold text-xl text-stone-900">Assignment</h3>
                      </div>
                      
                      <div className="text-sm text-stone-600 mb-6 bg-stone-50 p-4 rounded border border-stone-100 italic leading-relaxed">
                        "{currentLesson.assignmentText}"
                      </div>
                      
                      <form onSubmit={handleSubmitAssignment} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 block">Google Drive Link</label>
                            <input 
                            type="url" 
                            required
                            placeholder="https://drive.google.com/..."
                            className="w-full bg-white border border-stone-300 rounded-md px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-orange-700/20 focus:border-orange-700 outline-none transition-all"
                            value={submissionLink}
                            onChange={(e) => setSubmissionLink(e.target.value)}
                            />
                        </div>
                        <button 
                          disabled={submitting}
                          className="w-full bg-stone-900 text-stone-50 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-orange-700 disabled:opacity-70 disabled:hover:bg-stone-900 flex justify-center items-center gap-2 transition-all shadow-lg shadow-stone-200"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} />}
                          Submit Work
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Quiz Card */}
                  {currentLesson.quizFormUrl && (
                    <div className="bg-white border border-stone-200 rounded-lg p-8 shadow-sm h-fit hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="p-2 bg-stone-100 rounded-md text-stone-700">
                             <ClipboardList size={20} /> 
                         </div>
                         <h3 className="font-serif font-bold text-xl text-stone-900">Quiz</h3>
                      </div>
                      <p className="text-stone-600 mb-8 font-light">
                          Complete the verification quiz to test your understanding of this module's concepts.
                      </p>
                      <a 
                        href={currentLesson.quizFormUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-white border-2 border-stone-900 text-stone-900 py-3 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all"
                      >
                        Begin Quiz
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