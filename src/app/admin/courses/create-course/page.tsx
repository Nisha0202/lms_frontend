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
import type { CourseResponse, CoursePayload, Lesson, Batch } from "@/types";
import { useToast } from "@/components/providers/ToastProvider";

export default function CreateCoursePage() {
  const router = useRouter();
  const toast = useToast();
  
  // --- Loading States ---
  const [status, setStatus] = useState<"idle" | "creating_course" | "adding_lessons" | "success">("idle");
  const [loadingText, setLoadingText] = useState("");

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
  const [lessons, setLessons] = useState<Lesson[]>([
    { title: "", videoUrl: "", quizFormUrl: "", assignmentText: "", isExpanded: true }
  ]);

  // --- HELPER: Smart Video URL Cleaner ---
  const extractYouTubeUrl = (input: string) => {
    // 1. Handle Full Iframe Code (<iframe src="...">)
    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input; 
    }

    // 2. Handle Standard Watch URL (youtube.com/watch?v=ID)
    if (input.includes("watch?v=")) {
      const videoId = input.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // 3. Handle Short URL (youtu.be/ID)
    if (input.includes("youtu.be/")) {
      const videoId = input.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // 4. Return as is (already correct or unknown format)
    return input;
  };

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
      ...prev.map(l => ({ ...l, isExpanded: false })), 
      { title: "", videoUrl: "", quizFormUrl: "", assignmentText: "", isExpanded: true }
    ]);
  };

  // === UPDATED LESSON HANDLER WITH AUTO-FIX ===
  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    let cleanValue = value;

    // Auto-convert YouTube links to Embed URL
    if (field === 'videoUrl') {
       cleanValue = extractYouTubeUrl(value);
    }

    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: cleanValue };
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

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) return toast.error("Course Title is required");
    if (form.price <= 0) return toast.error("Price must be greater than 0");
    if (form.batches.length === 0) return toast.error("Add at least one batch");
    
    // Validate Lessons
    if (lessons.length === 0) return toast.error("Add at least one lesson");
    const invalidLesson = lessons.find(l => !l.title || !l.videoUrl);
    if (invalidLesson) return toast.error("All lessons must have a Title and Video URL");

    try {
      setStatus("creating_course");
      setLoadingText("Creating Course...");
      
      const courseRes = await api.post<CourseResponse>("/courses", form);
      const courseId = courseRes.data._id;

      setStatus("adding_lessons");
      for (let i = 0; i < lessons.length; i++) {
        setLoadingText(`Uploading Lesson ${i + 1}...`);
        const { isExpanded, ...lessonData } = lessons[i];
        await api.post(`/courses/${courseId}/lessons`, lessonData);
      }

      setStatus("success");
      toast.success("Course Published Successfully!");
      router.push("/admin/dashboard");

    } catch (err: any) {
      console.error(err);
      setStatus("idle");
      toast.error(err.response?.data?.message || "Failed to publish course");
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

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Course Info */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
              <Layers className="text-zinc-400" size={20} /> Basic Information
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Course Title <span className="text-red-500">*</span></label>
                  <input required type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="e.g. Full Stack Web Development" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea required rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Course details..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none appearance-none">
                      <option>Programming</option><option>Design</option><option>Marketing</option><option>Business</option>
                      <option>Data Science</option><option>Development </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 text-zinc-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (BDT) <span className="text-red-500">*</span></label>
                  <input required type="number" min="1" value={form.price || ""} onChange={(e) => updateField("price", Number(e.target.value))} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="5000" />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2"><ImageIcon size={16} /> Thumbnail URL</label>
                  <input type="text" value={form.thumbnail} onChange={(e) => updateField("thumbnail", e.target.value)} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="https://..." />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag, idx) => (
                      <span key={idx} className="bg-zinc-100 text-zinc-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 border border-zinc-200">
                        {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 ml-1">&times;</button>
                      </span>
                    ))}
                  </div>
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 outline-none" placeholder="Type tag and press Enter..." />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Batches */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="text-zinc-400" size={20} /> Batch Configuration</h2>
              <button type="button" onClick={handleAddBatch} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100"><Plus size={16} /> Add Batch</button>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {form.batches.map((batch, index) => (
                <div key={index} className="relative p-5 bg-zinc-50 rounded-xl border border-zinc-200 group">
                  <button type="button" onClick={() => removeBatch(index)} className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Batch Name</label><input required value={batch.name} onChange={(e) => updateBatch(index, "name", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900" /></div>
                    <div><label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Seat Limit</label><input required type="number" value={batch.seatLimit} onChange={(e) => updateBatch(index, "seatLimit", Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900" /></div>
                    <div><label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">Start Date</label><input required type="date" value={batch.startDate} onChange={(e) => updateBatch(index, "startDate", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900" /></div>
                    <div><label className="text-xs uppercase font-bold text-zinc-500 mb-1 block">End Date</label><input required type="date" value={batch.endDate} onChange={(e) => updateBatch(index, "endDate", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-zinc-900" /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Curriculum */}
          <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold flex items-center gap-2"><Video className="text-zinc-400" size={20} /> Curriculum Builder</h2>
              <button type="button" onClick={handleAddLesson} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100"><Plus size={16} /> Add Lesson</button>
            </div>
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-zinc-300 transition-all">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 cursor-pointer select-none" onClick={() => toggleLessonExpand(index)}>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">{index + 1}</div>
                      <span className="font-medium text-zinc-900">{lesson.title || "New Lesson"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeLesson(index); }} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 size={16} /></button>
                      {lesson.isExpanded ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
                    </div>
                  </div>
                  
                  {lesson.isExpanded && (
                    <div className="p-5 border-t border-zinc-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Lesson Title</label>
                          <input required value={lesson.title} onChange={(e) => updateLesson(index, "title", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none" placeholder="e.g. Introduction to React" />
                        </div>
                        
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-zinc-500 mb-1 uppercase">Video URL or Embed Code</label>
                          <input 
                            required 
                            value={lesson.videoUrl} 
                            onChange={(e) => updateLesson(index, "videoUrl", e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none" 
                            placeholder="Paste YouTube link or Embed code here..." 
                          />
                          <p className="text-[10px] text-zinc-400 mt-1">Supports: full iframe code.</p>
                        </div>

                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase"><ClipboardList size={12} /> Quiz Form URL (Optional)</label>
                          <input value={lesson.quizFormUrl} onChange={(e) => updateLesson(index, "quizFormUrl", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none" placeholder="Google Form Link" />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-1 uppercase"><FileText size={12} /> Assignment Instructions (Optional)</label>
                          <input value={lesson.assignmentText} onChange={(e) => updateLesson(index, "assignmentText", e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-zinc-900 outline-none" placeholder="What should they submit?" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex justify-end pt-6 pb-20">
            <button type="submit" disabled={status !== "idle"} className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-200">
              {status !== "idle" ? <><Loader2 className="animate-spin" size={20} /><span>{loadingText}</span></> : <><Save size={20} /> Publish Complete Course</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}