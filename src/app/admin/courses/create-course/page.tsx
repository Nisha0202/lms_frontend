"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  ArrowLeft, Plus, Trash2, Calendar, Video, 
  Save, Loader2, ChevronDown, ChevronUp, 
  FileText, ClipboardList, Layers, ImageIcon 
} from "lucide-react";

// --- 1. Define Strict Types ---

interface Batch {
  name: string;
  startDate: string;
  endDate: string;
  seatLimit: number;
}

interface Lesson {
  title: string;
  videoUrl: string;
  quizFormUrl: string;
  assignmentText: string;
  isExpanded: boolean; 
}

interface CoursePayload {
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  tags: string[];
  batches: Batch[];
}

// 2. Fix the Error: Define what the API returns
interface CourseResponse {
  _id: string;
  title: string;
  // add other fields if needed
}

export default function CreateCoursePage() {
  const router = useRouter();
  
  // --- Loading States ---
  const [status, setStatus] = useState<"idle" | "creating_course" | "adding_lessons" | "success">("idle");
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");

  // --- Data States ---
  const [form, setForm] = useState<CoursePayload>({
    title: "",
    description: "",
    price: 0,
    category: "Programming",
    thumbnail: "",
    tags: [],
    batches: [{ name: "Batch 1", startDate: "", endDate: "", seatLimit: 30 }],
  });

  const [tagInput, setTagInput] = useState("");
  
  // Lessons are managed separately because they are sent in a second API call
  const [lessons, setLessons] = useState<Lesson[]>([
    { title: "", videoUrl: "", quizFormUrl: "", assignmentText: "", isExpanded: true }
  ]);

  // --- Handlers: Course Info ---
  function updateField<K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --- Handlers: Tags ---
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !form.tags.includes(val)) {
        updateField("tags", [...form.tags, val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField("tags", form.tags.filter(t => t !== tagToRemove));
  };

  // --- Handlers: Batches ---
  const handleAddBatch = () => {
    setForm(prev => ({
      ...prev,
      batches: [...prev.batches, { name: `Batch ${prev.batches.length + 1}`, startDate: "", endDate: "", seatLimit: 30 }]
    }));
  };

  const updateBatch = (index: number, field: keyof Batch, value: any) => {
    const updated = [...form.batches];
    updated[index] = { ...updated[index], [field]: value };
    setForm(prev => ({ ...prev, batches: updated }));
  };

  const removeBatch = (index: number) => {
    setForm(prev => ({ ...prev, batches: prev.batches.filter((_, i) => i !== index) }));
  };

  // --- Handlers: Lessons ---
  const handleAddLesson = () => {
    setLessons(prev => [
      ...prev.map(l => ({ ...l, isExpanded: false })), // Collapse others to keep UI clean
      { title: "", videoUrl: "", quizFormUrl: "", assignmentText: "", isExpanded: true }
    ]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const toggleLessonExpand = (index: number) => {
    const updated = [...lessons];
    updated[index].isExpanded = !updated[index].isExpanded;
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  // --- MASTER SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Validation
    if (form.batches.length === 0) {
      setError("Please create at least one batch.");
      window.scrollTo(0, 0);
      return;
    }
    if (lessons.length === 0) {
      setError("Please add at least one lesson to the curriculum.");
      window.scrollTo(0, 0);
      return;
    }
    const invalidLesson = lessons.find(l => !l.title || !l.videoUrl);
    if (invalidLesson) {
      setError("All lessons must have a Title and Video URL.");
      return;
    }

    try {
      // Step 2: Create Course
      setStatus("creating_course");
      setLoadingText("Creating Course Structure...");
      
      // FIX: Pass <CourseResponse> to api.post so TS knows what returns
      const courseRes = await api.post<CourseResponse>("/courses", form);
      const courseId = courseRes.data._id; // <--- No more error here

      // Step 3: Add Lessons Sequentially
      setStatus("adding_lessons");
      
      for (let i = 0; i < lessons.length; i++) {
        setLoadingText(`Uploading Lesson ${i + 1} of ${lessons.length}...`);
        
        // Destructure to remove UI-only flag 'isExpanded' before sending
        const { isExpanded, ...lessonData } = lessons[i];
        
        await api.post(`/courses/${courseId}/lessons`, lessonData);
      }

      // Step 4: Success
      setStatus("success");
      setLoadingText("Course Published!");
      router.push("/admin/dashboard");

    } catch (err: any) {
      console.error(err);
      setStatus("idle");
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Create New Course</h1>
            <p className="text-zinc-500 mt-1">Design your curriculum and manage batches.</p>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ---------------- SECTION 1: COURSE INFO ---------------- */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
              <Layers className="text-zinc-400" size={20} />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Course Title</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Full Stack Web Development 2024"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
                    placeholder="Describe what the students will learn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none appearance-none"
                    >
                      <option>Programming</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Business</option>
                      <option>Development</option>
                      <option>Data Science</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-zinc-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (BDT)</label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField("price", Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <ImageIcon size={16} /> Thumbnail URL
                  </label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) => updateField("thumbnail", e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
                    placeholder="https://..."
                  />
                </div>

                {/* Tags Input */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-100 text-zinc-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-zinc-200">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 ml-1">
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
                    placeholder="Type tag and press Enter..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- SECTION 2: BATCHES ---------------- */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="text-zinc-400" size={20} />
                Batch Configuration
              </h2>
              <button
                type="button"
                onClick={handleAddBatch}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 transition-all hover:bg-zinc-100"
              >
                <Plus size={16} /> Add Batch
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {form.batches.map((batch, index) => (
                <div key={index} className="relative p-5 bg-zinc-50 rounded-xl border border-zinc-200 group">
                  <button
                    type="button"
                    onClick={() => removeBatch(index)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Batch Name</label>
                      <input
                        required
                        value={batch.name}
                        onChange={(e) => updateBatch(index, "name", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                        placeholder="e.g. Morning Batch"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Seat Limit</label>
                      <input
                        required
                        type="number"
                        value={batch.seatLimit}
                        onChange={(e) => updateBatch(index, "seatLimit", Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Start Date</label>
                      <input
                        required
                        type="date"
                        value={batch.startDate}
                        onChange={(e) => updateBatch(index, "startDate", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">End Date</label>
                      <input
                        required
                        type="date"
                        value={batch.endDate}
                        onChange={(e) => updateBatch(index, "endDate", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- SECTION 3: CURRICULUM ---------------- */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Video className="text-zinc-400" size={20} />
                Curriculum Builder
              </h2>
              <button
                type="button"
                onClick={handleAddLesson}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 transition-all hover:bg-zinc-100"
              >
                <Plus size={16} /> Add Lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-zinc-300">
                  {/* Lesson Header (Always Visible) */}
                  <div 
                    className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer select-none"
                    onClick={() => toggleLessonExpand(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                        {index + 1}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {lesson.title || "New Lesson"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeLesson(index); }}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                      {lesson.isExpanded ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {lesson.isExpanded && (
                    <div className="p-5 border-t border-zinc-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Lesson Title</label>
                          <input
                            required
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, "title", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            placeholder="e.g. Introduction to React"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Video URL</label>
                          <input
                            required
                            value={lesson.videoUrl}
                            onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            placeholder="https://youtube.com/..."
                          />
                        </div>
                        
                        {/* Optional Fields */}
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase">
                            <ClipboardList size={12} /> Quiz Form URL (Optional)
                          </label>
                          <input
                            value={lesson.quizFormUrl}
                            onChange={(e) => updateLesson(index, "quizFormUrl", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            placeholder="Google Form Link"
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase">
                            <FileText size={12} /> Assignment Instructions (Optional)
                          </label>
                          <input
                            value={lesson.assignmentText}
                            onChange={(e) => updateLesson(index, "assignmentText", e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            placeholder="What should they submit?"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- FOOTER ACTIONS ---------------- */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={status !== "idle"}
              className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-200"
            >
              {status !== "idle" ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{loadingText}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  Publish Complete Course
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}