"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Tag, ImageIcon, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// 1. Define Strict Types
type Batch = {
  name: string;
  startDate: string;
  endDate: string;
  seatLimit: number;
};

type CoursePayload = {
  title: string;
  description: string;
  price: number;
  tags: string[];
  category: string;
  thumbnail: string;
  batches: Batch[];
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CoursePayload>({
    title: "",
    description: "",
    price: 0,
    category: "Programming",
    thumbnail: "",
    tags: [],
    batches: [
      {
        name: "Batch 1",
        startDate: "",
        endDate: "",
        seatLimit: 30,
      },
    ],
  });

  // 2. Generic Update Function
  function updateField<K extends keyof CoursePayload>(key: K, value: CoursePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // 3. Batch Update Function (Fixed Type Error)
  function updateBatchField<K extends keyof Batch>(index: number, key: K, value: Batch[K]) {
    const updatedBatches = [...form.batches];
    updatedBatches[index] = { ...updatedBatches[index], [key]: value };
    setForm((prev) => ({ ...prev, batches: updatedBatches }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/courses", form);
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6 text-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb / Back Link */}
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ------------------ LEFT: FORM ------------------ */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-sm"
          >
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Create New Course</h1>
              <p className="text-zinc-500 text-sm mt-1">Fill in the details to publish a new course.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {/* Basic Info Section */}
            <div className="space-y-6">

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Next.js 14"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900">Description</label>
                <textarea
                  rows={4}
                  placeholder="What will students learn?"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              {/* Price & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Price (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">৳</span>
                    <input
                      type="number"
                      className="w-full rounded-lg border border-zinc-200 pl-8 pr-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
                      value={form.price}
                      onChange={(e) => updateField("price", Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-900">Category</label>
                  <div className="relative">
                    <select
                      className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow cursor-pointer"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                    >
                      <option>Programming</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Business</option>
                      <option>Data Science</option>
                      ,<option>Web Development</option>
                    </select>
                    {/* Custom Chevron */}
                    <div className="absolute right-4 top-3.5 pointer-events-none">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* TAGS INPUT */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = form.tags.filter((_, i) => i !== index);
                          updateField("tags", newTags);
                        }}
                        className="text-zinc-400 hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Type tag and press Enter (e.g., 'Web Dev')"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !form.tags.includes(val)) {
                        updateField("tags", [...form.tags, val]);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                />
                <p className="text-xs text-zinc-500">Add tage comma seperated.</p>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                  Thumbnail URL
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400">
                    <ImageIcon size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full rounded-lg border border-zinc-200 pl-10 pr-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
                    value={form.thumbnail}
                    onChange={(e) => updateField("thumbnail", e.target.value)}
                  />
                </div>
                <p className="text-xs text-zinc-500">Paste a direct link to an image (Unsplash, etc.)</p>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-zinc-100"></div>

            {/* ------------------ BATCH SECTION ------------------ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <Calendar size={20} className="text-zinc-900" /> Batch Configuration
                  </h2>
                  <p className="text-sm text-zinc-500">Define the first batch for this course.</p>
                </div>
              </div>

              {form.batches.map((batch, index) => (
                <div
                  key={index}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Batch Name</label>
                    <input
                      type="text"
                      value={batch.name}
                      onChange={(e) => updateBatchField(index, "name", e.target.value)}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Seat Limit</label>
                    <input
                      type="number"
                      value={batch.seatLimit}
                      onChange={(e) => updateBatchField(index, "seatLimit", Number(e.target.value))}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Start Date</label>
                    <input
                      type="date"
                      value={batch.startDate}
                      onChange={(e) => updateBatchField(index, "startDate", e.target.value)}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">End Date</label>
                    <input
                      type="date"
                      value={batch.endDate}
                      onChange={(e) => updateBatchField(index, "endDate", e.target.value)}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SUBMIT */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-zinc-900 text-white font-bold py-3.5 rounded-xl hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Creating Course...
                  </>
                ) : (
                  <>
                    <Plus size={20} /> Publish Course
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ------------------ RIGHT: LIVE PREVIEW ------------------ */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  Live Preview
                </h2>

                <div className="space-y-4">
                  {/* Thumbnail preview */}
                  <div className="w-full aspect-video bg-zinc-100 rounded-lg overflow-hidden border border-zinc-100 relative">
                    {form.thumbnail ? (
                      <img
                        src={form.thumbnail}
                        className="w-full h-full object-cover"
                        alt="Preview"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-xs mt-2">No image</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                        <Tag size={10} />
                        {form.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                      {form.title || "Untitled Course"}
                    </h3>
                  </div>

                  <p className="text-zinc-500 text-sm line-clamp-3">
                    {form.description || "Description will appear here..."}
                  </p>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium">Price</p>
                      <p className="text-xl font-bold text-zinc-900">৳ {form.price}</p>
                    </div>
                    <div className="h-10 px-4 bg-zinc-900 text-white text-sm font-bold rounded-lg flex items-center opacity-50 cursor-not-allowed">
                      View Details
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Note:</strong> After creating the course, you will be redirected to the dashboard where you can add lessons and assignments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}