"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { confirmToast } from "@/components/ConfirmToast";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2,
  FileText, Video, LayoutDashboard,
  Tag, Image as ImageIcon, DollarSign, Type,
  Layers, ChevronDown, CheckCircle2, GripVertical, AlertCircle
} from "lucide-react";

import type { CourseResponse, CoursePayload, Lesson, Batch } from "@/types";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const toast = useToast();

  // --- States ---
  const [status, setStatus] = useState<"idle" | "loading_data" | "saving" | "success">("loading_data");
  const [loadingText, setLoadingText] = useState("Loading Course Data...");
  const [error, setError] = useState("");

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

  // --- Fetch Data ---
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
        toast.error("Failed to load course data");
      }
    };

    if (id) fetchCourseData();
  }, [id, toast]);

  // --- Security ---
  useEffect(() => {
    if (!loading && user?.role !== 'admin') {
      router.push('/');
    }
  }, [user, loading, router]);

  // --- Helpers ---
  function updateField<K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --- Handlers (Tags, Batches, Lessons) ---
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

  const removeLesson = async (index: number) => {
    const lessonToRemove = lessons[index];
    if (lessonToRemove._id) {
      const confirmDelete = await confirmToast(`Delete "${lessonToRemove.title}"?`);
      if (!confirmDelete) return;
      try {
        setLoadingText("Deleting...");
        setStatus("saving");
        await api.delete(`/courses/${id}/lessons/${lessonToRemove._id}`);
        setLessons((prev) => prev.filter((_, i) => i !== index));
        setStatus("idle");
        toast.success("Deleted");
      } catch (err) {
        setStatus("idle");
        toast.error("Failed to delete");
      }
    } else {
      setLessons((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setStatus("saving");
      setLoadingText("Saving Changes...");
      await api.put(`/courses/${id}`, form);
      const newLessons = lessons.filter(l => !l._id);
      if (newLessons.length > 0) {
        for (const lesson of newLessons) {
          const { isExpanded, _id, ...lessonData } = lesson;
          await api.post(`/courses/${id}/lessons`, lessonData);
        }
      }
      setStatus("success");
      toast.success("Course updated!");
      setTimeout(() => router.push("/admin/dashboard"), 1000);
    } catch (err: any) {
      setStatus("idle");
      setError(err.response?.data?.message || "Update failed.");
      toast.error("Update failed");
      window.scrollTo(0, 0);
    }
  };

  if (loading || user?.role !== 'admin' || status === "loading_data") {
   
    return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-600">
        <Loader2 className="animate-spin text-orange-700" size={32} />
        <p className="mt-4 font-serif text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                        Edit Course
                    </h1>
                    <p className="text-xs text-stone-500">Instructor Dashboard</p>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={status !== "idle"}
                className="flex items-center gap-2 rounded-lg bg-orange-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-800 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
                {status !== "idle" ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {status === "saving" ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        
        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 flex items-center gap-2">
            <AlertCircle size={20} /> <span className="font-bold">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* --- LEFT COLUMN: Metadata --- */}
            <div className="lg:col-span-4 space-y-8">
                
                {/* 1. ESSENTIALS CARD (Theme Match) */}
                <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
                    <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <Layers className="text-orange-700" size={20}/> Course Essentials
                    </h2>
                    
                    <div className="space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Title</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Type className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm"
                                    placeholder="Course Title"
                                />
                            </div>
                        </div>

                        {/* Category & Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    className="block w-full rounded-lg border-0 py-3 pl-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm"
                                >
                                    <option>Programming</option>
                                    <option>Design</option>
                                    <option>Marketing</option>
                                    <option>Business</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Price</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-stone-400 font-serif">৳</span>
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        value={form.price}
                                        onChange={(e) => updateField("price", Number(e.target.value))}
                                        className="block w-full rounded-lg border-0 py-3 pl-8 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                className="block w-full rounded-lg border-0 py-3 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm resize-none"
                            />
                        </div>

                        {/* Thumbnail */}
                        <div>
                             <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Thumbnail URL</label>
                             <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <ImageIcon className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    value={form.thumbnail}
                                    onChange={(e) => updateField("thumbnail", e.target.value)}
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm"
                                    placeholder="https://..."
                                />
                             </div>
                             {form.thumbnail && (
                                <div className="mt-3 aspect-video rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shadow-sm">
                                    <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                             )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {form.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-700/10">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">&times;</button>
                                </span>
                                ))}
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Tag className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm"
                                    placeholder="Add tag..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. BATCHES CARD */}
                <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif font-bold text-stone-900">Batches</h2>
                        <button
                            type="button"
                            onClick={handleAddBatch}
                            className="text-sm font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 hover:underline"
                        >
                            <Plus size={16} /> Add Batch
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {form.batches.length === 0 && (
                            <p className="text-center text-stone-500 italic text-sm">No active batches.</p>
                        )}
                        {form.batches.map((batch, index) => (
                            <div key={index} className="p-4 rounded-lg border border-stone-200 bg-stone-50/50 group relative">
                                <button
                                    type="button"
                                    onClick={() => removeBatch(index)}
                                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                                
                                <input
                                    value={batch.name}
                                    onChange={(e) => updateBatch(index, "name", e.target.value)}
                                    className="block w-full bg-transparent font-bold text-stone-900 border-none p-0 focus:ring-0 placeholder-stone-400 mb-3 text-sm"
                                    placeholder="Batch Name"
                                />
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <label className="text-xs text-stone-500 font-bold uppercase tracking-wider">Start</label>
                                        <input
                                            type="date"
                                            value={batch.startDate}
                                            onChange={(e) => updateBatch(index, "startDate", e.target.value)}
                                            className="w-full mt-1 bg-white border-0 rounded ring-1 ring-inset ring-stone-300 py-1.5 px-2 text-stone-900 text-xs focus:ring-0 focus:ring-orange-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-stone-500 font-bold uppercase tracking-wider">End</label>
                                        <input
                                            type="date"
                                            value={batch.endDate}
                                            onChange={(e) => updateBatch(index, "endDate", e.target.value)}
                                            className="w-full mt-1 bg-white border-0 rounded ring-1 ring-inset ring-stone-300 py-1.5 px-2 text-stone-900 text-xs focus:ring-0 focus:ring-orange-700"
                                        />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="text-xs text-stone-500 font-bold uppercase tracking-wider">Seat Limit</label>
                                    <input 
                                        type="number"
                                        value={batch.seatLimit}
                                        onChange={(e) => updateBatch(index, "seatLimit", Number(e.target.value))}
                                        className="w-20 ml-2 bg-white border-0 rounded ring-1 ring-inset ring-stone-300 py-1 px-2 text-center font-bold text-stone-900 text-xs focus:ring-0 focus:ring-orange-700"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Curriculum --- */}
            <div className="lg:col-span-8">
                <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5 min-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
                         <div className="flex items-center gap-3">
                            <h2 className="text-xl font-serif font-bold text-stone-900">Curriculum</h2>
                            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-stone-600">
                                {lessons.length} Lessons
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddLesson}
                            className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 transition-colors shadow-md"
                        >
                            <Plus size={16} /> Add Lesson
                        </button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {lessons.length === 0 && (
                            <div className="h-64 flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                                <LayoutDashboard size={40} className="mb-3 opacity-50" />
                                <p className="font-serif text-stone-500">Curriculum is empty.</p>
                            </div>
                        )}

                        {lessons.map((lesson, index) => (
                            <div key={index} className={`rounded-xl border transition-all duration-300 ${lesson.isExpanded ? 'border-orange-200 ring-0 ring-orange-700/10 bg-white' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                                
                                {/* Lesson Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                                    onClick={() => toggleLessonExpand(index)}
                                >
                                    <div className="flex items-center gap-4">
                                        <GripVertical size={20} className="text-stone-300 cursor-grab" />
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-600 font-serif border border-stone-200">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${!lesson.title ? 'text-stone-400 italic' : 'text-stone-900'}`}>
                                                {lesson.title || "Untitled Lesson"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {lesson._id ? (
                                                    <span className="text-[10px] uppercase font-bold text-green-700 flex items-center gap-1 bg-green-50 px-1.5 rounded-sm">
                                                        <CheckCircle2 size={10}/> Published
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-50 px-1.5 rounded-sm">Draft</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeLesson(index); }}
                                            className="p-2 text-stone-400 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ChevronDown size={20} className={`text-stone-400 transition-transform ${lesson.isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded Form */}
                                {lesson.isExpanded && (
                                    <div className="p-6 border-t border-stone-100 bg-stone-50/30 rounded-b-xl">
                                        {lesson._id ? (
                                            <div className="p-4 bg-orange-50 border border-orange-100 rounded text-orange-800 text-sm flex items-center gap-3">
                                                <AlertCircle size={18} />
                                                <span>Live lessons must be edited in the specific lesson manager to preserve student progress.</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Lesson Title */}
                                                <div>
                                                    <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Lesson Title</label>
                                                    <input
                                                        required
                                                        value={lesson.title}
                                                        onChange={(e) => updateLesson(index, "title", e.target.value)}
                                                        className="block w-full rounded-lg border-0 py-2.5 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white"
                                                        placeholder="e.g. Introduction to React"
                                                    />
                                                </div>

                                          {/* Video URL */}
<div>
    <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Video URL</label>
    <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Video className="h-5 w-5 text-stone-400" />
        </div>
        
        {/* REPLACED INPUT BELOW */}
        <input
            required
            value={lesson.videoUrl}
            onChange={(e) => {
                let val = e.target.value;
                // Auto-extract src from iframe code if detected
                if (val.includes("<iframe")) {
                    const match = val.match(/src\s*=\s*["']([^"']+)["']/);
                    if (match && match[1]) {
                        val = match[1];
                    }
                }
                updateLesson(index, "videoUrl", val);
            }}
            className="block w-full rounded-lg border-0 py-2.5 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white font-mono"
            placeholder="Paste  Embed Code..."
        />
         {/* END REPLACED INPUT */}

    </div>
</div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Quiz Form URL</label>
                                                        <input
                                                            value={lesson.quizFormUrl}
                                                            onChange={(e) => updateLesson(index, "quizFormUrl", e.target.value)}
                                                            className="block w-full rounded-lg border-0 py-2.5 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Assignment</label>
                                                        <input
                                                            value={lesson.assignmentText}
                                                            onChange={(e) => updateLesson(index, "assignmentText", e.target.value)}
                                                            className="block w-full rounded-lg border-0 py-2.5 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-0 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white"
                                                            placeholder="Instructions..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}