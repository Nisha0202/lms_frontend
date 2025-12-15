"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  ArrowLeft, Plus, Trash2, Calendar, Video, 
  Save, Loader2, ChevronDown, 
  FileText, ClipboardList, Layers, ImageIcon,
  Type,  Tag, GripVertical
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
    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input; 
    }
    if (input.includes("watch?v=")) {
      const videoId = input.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (input.includes("youtu.be/")) {
      const videoId = input.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return input;
  };

  // --- Handlers ---
  function updateField<K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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
    let cleanValue = value;
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

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Course Title is required");
    if (form.price <= 0) return toast.error("Price must be greater than 0");
    if (form.batches.length === 0) return toast.error("Add at least one batch");
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
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 text-stone-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/dashboard" className="flex items-center text-sm font-medium text-stone-500 hover:text-orange-700 transition-colors mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-serif font-bold tracking-tight text-stone-900">Create New Course</h1>
            <p className="text-stone-500 mt-2 text-sm">Design your curriculum and manage intake batches.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Course Info */}
          <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
              <Layers className="text-orange-700" size={20} /> Basic Information
            </h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Course Title <span className="text-orange-700">*</span></label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Type className="h-5 w-5 text-stone-400" />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={form.title} 
                      onChange={(e) => updateField("title", e.target.value)} 
                      className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm" 
                      placeholder="e.g. Full Stack Web Development" 
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Description <span className="text-orange-700">*</span></label>
                  <textarea 
                    required 
                    rows={4} 
                    value={form.description} 
                    onChange={(e) => updateField("description", e.target.value)} 
                    className="block w-full rounded-lg border-0 py-3 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm resize-none" 
                    placeholder="Course details..." 
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Category</label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={(e) => updateField("category", e.target.value)} 
                      className="block w-full rounded-lg border-0 py-3 pl-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm appearance-none"
                    >
                      <option>Programming</option><option>Design</option><option>Marketing</option><option>Business</option>
                      <option>Data Science</option><option>Development</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-stone-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Price (BDT) <span className="text-orange-700">*</span></label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-stone-400 font-serif font-bold">৳</span>
                    </div>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      value={form.price || ""} 
                      onChange={(e) => updateField("price", Number(e.target.value))} 
                      className="block w-full rounded-lg border-0 py-3 pl-8 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm" 
                      placeholder="5000" 
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Thumbnail URL</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <ImageIcon className="h-5 w-5 text-stone-400" />
                    </div>
                    <input 
                      type="text" 
                      value={form.thumbnail} 
                      onChange={(e) => updateField("thumbnail", e.target.value)} 
                      className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm" 
                      placeholder="https://..." 
                    />
                  </div>
                  {form.thumbnail && (
                     <div className="mt-3 w-40 aspect-video rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shadow-sm">
                        <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                     </div>
                  )}
                </div>

                {/* Tags */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700 ring-1 ring-inset ring-orange-700/10">
                        {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600 ml-1">&times;</button>
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
                      className="block w-full rounded-lg border-0 py-3 pl-10 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm" 
                      placeholder="Type tag and press Enter..." 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Batches */}
          <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="text-orange-700" size={20} /> Batch Configuration
              </h2>
              <button 
                type="button" 
                onClick={handleAddBatch} 
                className="text-sm font-bold text-orange-700 hover:text-orange-800 flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Batch
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {form.batches.map((batch, index) => (
                <div key={index} className="relative p-5 bg-stone-50/80 rounded-xl border border-stone-200 group">
                  <button 
                    type="button" 
                    onClick={() => removeBatch(index)} 
                    className="absolute top-4 right-4 text-stone-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Batch Name</label>
                      <input 
                        required 
                        value={batch.name} 
                        onChange={(e) => updateBatch(index, "name", e.target.value)} 
                        className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Seat Limit</label>
                      <input 
                        required 
                        type="number" 
                        value={batch.seatLimit} 
                        onChange={(e) => updateBatch(index, "seatLimit", Number(e.target.value))} 
                        className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Start Date</label>
                      <input 
                        required 
                        type="date" 
                        value={batch.startDate} 
                        onChange={(e) => updateBatch(index, "startDate", e.target.value)} 
                        className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">End Date</label>
                      <input 
                        required 
                        type="date" 
                        value={batch.endDate} 
                        onChange={(e) => updateBatch(index, "endDate", e.target.value)} 
                        className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Curriculum */}
          <div className="w-full bg-white px-6 py-8 shadow-lg shadow-stone-200/50 rounded-xl border-t-4 border-orange-700 ring-1 ring-stone-900/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <Video className="text-orange-700" size={20} /> Curriculum Builder
              </h2>
              <button 
                type="button" 
                onClick={handleAddLesson} 
                className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 transition-colors shadow-md"
              >
                <Plus size={16} /> Add Lesson
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div 
                  key={index} 
                  className={`rounded-xl border transition-all duration-300 ${lesson.isExpanded ? 'border-orange-200 ring-2 ring-orange-700/10 bg-white' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                >
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
                         <span className="text-[10px] uppercase font-bold text-orange-700 bg-orange-50 px-1.5 rounded-sm">
                            Draft
                         </span>
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
                  
                  {lesson.isExpanded && (
                    <div className="p-6 border-t border-stone-100 bg-stone-50/30 rounded-b-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                      
                      {/* Lesson Title */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Lesson Title</label>
                        <input 
                          required 
                          value={lesson.title} 
                          onChange={(e) => updateLesson(index, "title", e.target.value)} 
                          className="block w-full rounded-lg border-0 py-2.5 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                          placeholder="e.g. Introduction to React" 
                        />
                      </div>
                      
                      {/* Video URL */}
                      <div>
                        <label className="block text-sm font-medium leading-6 text-stone-900 mb-2">Video URL or Embed Code</label>
                        <input 
                          required 
                          value={lesson.videoUrl} 
                          onChange={(e) => updateLesson(index, "videoUrl", e.target.value)} 
                          className="block w-full rounded-lg border-0 py-2.5 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white font-mono" 
                          placeholder="Paste YouTube link or Embed code here..." 
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-1 uppercase">
                            <ClipboardList size={12} /> Quiz Form URL (Optional)
                          </label>
                          <input 
                            value={lesson.quizFormUrl} 
                            onChange={(e) => updateLesson(index, "quizFormUrl", e.target.value)} 
                            className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                            placeholder="Google Form Link" 
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-1 uppercase">
                            <FileText size={12} /> Assignment Instructions
                          </label>
                          <input 
                            value={lesson.assignmentText} 
                            onChange={(e) => updateLesson(index, "assignmentText", e.target.value)} 
                            className="block w-full rounded-lg border-0 py-2 px-3 text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-orange-700 sm:text-sm sm:leading-6 shadow-sm bg-white" 
                            placeholder="What should they submit?" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end pt-6 pb-20">
            <button 
              type="submit" 
              disabled={status !== "idle"} 
              className="flex items-center gap-2 rounded-lg bg-orange-700 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-700/20 hover:bg-orange-800 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {status !== "idle" ? <><Loader2 className="animate-spin" size={20} /><span>{loadingText}</span></> : <><Save size={20} /> Publish Complete Course</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}