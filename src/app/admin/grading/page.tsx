"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Save, Loader2, FileText, CheckCircle, Clock, ExternalLink, Inbox } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

// --- Types ---
interface GradingItem {
  _id: string; // Assignment Submission ID
  student: { name: string; email: string };
  lesson: { title: string };
  grade?: number;
  feedback?: string;
  driveLink?: string; 
  createdAt?: string;
}

export default function AdminGradingPage() {
  const toast = useToast();
  const [items, setItems] = useState<GradingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Fetch Data (Assignments Only) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch only assignments
        const res = await api.get<GradingItem[]>("/assessments/admin/submissions");
        setItems(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // --- Save Handler ---
  const handleSave = async (id: string) => {
    if (!gradeInput) return toast.error("Enter a score");
    setSaving(true);

    try {
      const payload = { 
        grade: Number(gradeInput), 
        feedback: feedbackInput 
      };

      // Call Assignment Grading Endpoint
      await api.post(`/assessments/grade-assignment/${id}`, payload);

      // Update UI Optimistically
      setItems(prev =>
        prev.map(item =>
          item._id === id ? { ...item, grade: Number(gradeInput), feedback: feedbackInput } : item
        )
      );

      setEditingId(null);
      toast.success("Assignment graded successfully");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save grade");
    } finally {
      setSaving(false);
    }
  };

  // Start Editing Helper
  const startEditing = (item: GradingItem) => {
    setEditingId(item._id);
    setGradeInput(item.grade?.toString() || "");
    setFeedbackInput(item.feedback || "");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-1">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 bg-zinc-900 rounded-lg text-white">
                <Inbox size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Assignment Inbox</h1>
                <p className="text-sm text-zinc-500">Review and grade student submissions.</p>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-zinc-200 border-dashed">
              <div className="bg-zinc-50 p-4 rounded-full mb-3">
                  <CheckCircle size={32} className="text-zinc-300" />
              </div>
              <h3 className="text-zinc-900 font-medium">All caught up!</h3>
              <p className="text-zinc-500 text-sm">No pending assignments to grade.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">
                
                {/* Student & Assignment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-bold text-zinc-900 truncate">{item.student?.name || "Unknown Student"}</span>
                    <span className="text-xs text-zinc-400 truncate hidden sm:inline">• {item.student?.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-zinc-700 mb-4 bg-zinc-50 w-fit px-3 py-1.5 rounded-md border border-zinc-100">
                    <FileText size={16} className="text-zinc-400"/>
                    <span className="font-medium truncate max-w-[200px] sm:max-w-md">{item.lesson?.title || "Deleted Lesson"}</span>
                  </div>

                  {item.driveLink && (
                    <a 
                        href={item.driveLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-colors"
                    >
                      <ExternalLink size={14}/> Open Google Drive File
                    </a>
                  )}
                </div>

                {/* Grading Action Area */}
                <div className="w-full md:w-auto md:min-w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                  {editingId === item._id ? (
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex gap-2">
                        <div className="w-24">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 pl-1 mb-1 block">Score</label>
                            <input 
                            type="number" 
                            placeholder="0-100"
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            autoFocus
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 pl-1 mb-1 block">Feedback</label>
                            <input 
                            type="text" 
                            placeholder="Good job..."
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                            value={feedbackInput}
                            onChange={(e) => setFeedbackInput(e.target.value)}
                            />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button 
                            onClick={() => handleSave(item._id)} 
                            disabled={saving} 
                            className="flex-1 bg-zinc-900 text-white text-xs py-2 rounded-lg hover:bg-zinc-800 flex justify-center items-center gap-1.5 font-medium transition-colors disabled:opacity-70"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Grade
                        </button>
                        <button 
                            onClick={() => setEditingId(null)} 
                            className="px-4 text-xs bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 text-zinc-600 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex md:flex-col justify-between md:justify-center items-center md:items-end gap-4 h-full">
                      {item.grade !== undefined ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100 mb-2">
                            <CheckCircle size={14}/> {item.grade}/100
                          </span>
                          <p className="text-xs text-zinc-400 max-w-[200px] truncate">{item.feedback}</p>
                          <button onClick={() => startEditing(item)} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 underline mt-2 block ml-auto">
                            Edit Grade
                          </button>
                        </div>
                      ) : (
                        <button 
                            onClick={() => startEditing(item)} 
                            className="flex items-center gap-2 bg-white border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50 hover:border-zinc-400 transition-all shadow-sm"
                        >
                          <Clock size={16} className="text-yellow-500"/> Grade Submission
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}