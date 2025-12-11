"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { confirmToast } from "@/components/ConfirmToast";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ArrowLeft, Plus, Trash2, Calendar, Video,
  Save, Loader2, ChevronDown, ChevronUp,
  FileText, ClipboardList, Layers, ImageIcon, AlertCircle
} from "lucide-react";

// ... [Keep Interfaces Batch, Lesson, CourseResponse, CoursePayload unchanged] ...
interface Batch {
  name: string;
  startDate: string;
  endDate: string;
  seatLimit: number;
}

interface Lesson {
  _id?: string;
  title: string;
  videoUrl: string;
  quizFormUrl: string;
  assignmentText: string;
  isExpanded: boolean;
}

interface CourseResponse {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  tags: string[];
  batches: Batch[];
  lessons: Lesson[];
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

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const toast = useToast(); // <--- 2. Initialize Toast

  // --- Loading States ---
  const [status, setStatus] = useState<"idle" | "loading_data" | "saving" | "success">("loading_data");
  const [loadingText, setLoadingText] = useState("Loading Course Data...");
  const [error, setError] = useState("");

  // --- Data States ---
  const [form, setForm] = useState<CoursePayload>({
    title: "",
    description: "",
    price: 0,
    category: "Programming",
    thumbnail: "",
    tags: [],
    batches: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await api.get<CourseResponse>(`/courses/${id}`);
        const course = res.data;

        setForm({
          title: course.title,
          description: course.description,
          price: course.price,
          category: course.category,
          thumbnail: course.thumbnail,
          tags: course.tags || [],
          batches: course.batches.map((b: any) => ({
            ...b,
            startDate: new Date(b.startDate).toISOString().split('T')[0],
            endDate: new Date(b.endDate).toISOString().split('T')[0]
          }))
        });

        setLessons(course.lessons.map((l: any) => ({
          ...l,
          quizFormUrl: l.quizFormUrl || "",
          assignmentText: l.assignmentText || "",
          isExpanded: false
        })));

        setStatus("idle");
      } catch (err) {
        console.error(err);
        setError("Failed to load course data.");
        setStatus("idle");
        toast.error("Failed to load course data"); // <--- Toast
      }
    };

    if (id) fetchCourseData();
  }, [id, toast]);

  // --- Security Check ---
  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user?.role !== 'admin' || status === "loading_data") {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
        <p className="text-zinc-500 font-medium">{loadingText}</p>
      </div>
    );
  }

  // --- HELPER FUNCTIONS ---
  function updateField<K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Tag Handlers
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

  // Batch Handlers
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

  // Lesson Handlers
  const handleAddLesson = () => {
    setLessons(prev => [
      ...prev.map(l => ({ ...l, isExpanded: false })),
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

  // --- 2. DELETE LOGIC WITH TOAST ---
  const removeLesson = async (index: number) => {
    const lessonToRemove = lessons[index];

    // Case 1: Existing Lesson -> Delete from DB
    if (lessonToRemove._id) {
      const confirmDelete = await confirmToast(
        `Are you sure you want to delete "${lessonToRemove.title}"?`
      );

      if (!confirmDelete) return;

      try {
        setLoadingText("Deleting lesson...");
        setStatus("saving");

        await api.delete(`/courses/${id}/lessons/${lessonToRemove._id}`);

        setLessons((prev) => prev.filter((_, i) => i !== index));
        setStatus("idle");

        toast.success("Lesson deleted successfully"); // <--- Success Toast

      } catch (err) {
        console.error("Failed to delete lesson", err);
        setStatus("idle");
        toast.error("Failed to delete lesson"); // <--- Error Toast
      }
    }
    // Case 2: Draft Lesson -> Local Delete
    else {
      setLessons((prev) => prev.filter((_, i) => i !== index));
      toast.success("Draft lesson removed"); // <--- Success Toast
    }
  };

  // --- 3. SUBMIT LOGIC WITH TOAST ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setStatus("saving");
      setLoadingText("Updating Course Details...");

      await api.put(`/courses/${id}`, form);

      const newLessons = lessons.filter(l => !l._id);

      if (newLessons.length > 0) {
        setLoadingText(`Adding ${newLessons.length} new lessons...`);
        for (const lesson of newLessons) {
          const { isExpanded, _id, ...lessonData } = lesson;
          await api.post(`/courses/${id}/lessons`, lessonData);
        }
      }

      setStatus("success");
      setLoadingText("Course Updated Successfully!");
      toast.success("Course updated successfully!"); // <--- Success Toast

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setStatus("idle");
      const errMsg = err.response?.data?.message || "Failed to update course.";
      setError(errMsg);
      toast.error(errMsg); // <--- Error Toast
      window.scrollTo(0, 0);
    }
  };

  // --- RENDER ---
  // ... [The JSX render part remains identical to your previous code] ...
  // ... [I'm omitting the JSX repetition to save space, but copy everything from return ( ... ) onwards] ...

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Cancel & Return
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-zinc-500 mt-1">Update content, manage batches, and add new lessons.</p>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: COURSE INFO */}
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
                    className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none"
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
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-100 text-zinc-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-zinc-200">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 ml-1">&times;</button>
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

          {/* SECTION 2: BATCHES */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Calendar className="text-zinc-400" size={20} />
                Batches
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

          {/* SECTION 3: CURRICULUM */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Video className="text-zinc-400" size={20} />
                Curriculum
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
                  {/* Lesson Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer select-none"
                    onClick={() => toggleLessonExpand(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${lesson._id ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {lesson.title || "New Lesson"}
                      </span>
                      {lesson._id && <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-500">Existing</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Delete Button (Calls removeLesson logic) */}
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
                      {lesson._id ? (
                        <div className="bg-zinc-50 p-4 rounded text-sm text-zinc-500 text-center">
                          To edit existing lessons, please use the specific Lesson Editor (Feature coming soon).
                          <br />You can only create <strong>new</strong> lessons here.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Lesson Title</label>
                            <input
                              required
                              value={lesson.title}
                              onChange={(e) => updateLesson(index, "title", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Video URL</label>
                            <input
                              required
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase">
                              <ClipboardList size={12} /> Quiz Form URL
                            </label>
                            <input
                              value={lesson.quizFormUrl}
                              onChange={(e) => updateLesson(index, "quizFormUrl", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase">
                              <FileText size={12} /> Assignment Instructions
                            </label>
                            <input
                              value={lesson.assignmentText}
                              onChange={(e) => updateLesson(index, "assignmentText", e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER ACTIONS */}
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
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}