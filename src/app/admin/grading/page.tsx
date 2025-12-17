"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  ArrowLeft, Save, Loader2, FileText, CheckCircle, 
  Clock, ExternalLink, Inbox, GraduationCap, PenTool 
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import type { GradingItem } from "@/types";

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

      await api.post(`/assessments/grade-assignment/${id}`, payload);

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
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 font-sans text-stone-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-bold text-stone-500 hover:text-orange-700 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
            <div>
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Inbox size={20} />
                <span className="text-xs font-bold tracking-widest uppercase">Submissions</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-stone-900 tracking-tight">Assignment Grading</h1>
              <p className="text-stone-500 mt-2 text-lg font-light">
                Review, grade, and provide feedback on student work.
              </p>
            </div>
          </div>
        </div>

        {/* --- Content List --- */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-stone-500">
              <Loader2 className="animate-spin text-orange-700 mb-4" size={32} />
              <p className="font-serif text-lg">Retrieving submissions...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border border-stone-200 border-dashed">
              <div className="bg-stone-50 p-4 rounded-full mb-4">
                  <CheckCircle size={32} className="text-stone-300" />
              </div>
              <h3 className="text-stone-900 font-serif text-xl font-medium">All caught up!</h3>
              <p className="text-stone-500 mt-2">No pending assignments found in the inbox.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  
                  {/* Left: Student & Assignment Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200 shrink-0">
                          <GraduationCap size={18} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-stone-900 text-lg leading-tight group-hover:text-orange-800 transition-colors">
                          {item.student?.name || "Unknown Student"}
                        </h3>
                        <p className="text-xs text-stone-400 font-mono mt-0.5">{item.student?.email}</p>
                      </div>
                    </div>
                    
                    {/* Assignment Info */}
                    <div className="ml-13 pl-13">
                      <div className="flex items-center gap-2 text-sm text-stone-700 mb-3">
                        <FileText size={16} className="text-orange-700/60"/>
                        <span className="font-medium">{item.lesson?.title || "Untitled Assignment"}</span>
                      </div>

                      {item.driveLink && (
                        <a 
                            href={item.driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-600 bg-stone-50 px-4 py-2 rounded-md border border-stone-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 transition-all"
                        >
                          <ExternalLink size={14}/> View Submission
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: Grading Interface */}
                  <div className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-stone-100 pt-6 lg:pt-0 lg:pl-8">
                    {editingId === item._id ? (
                      <div className="bg-stone-50 p-5 rounded-lg border border-stone-200 space-y-4 shadow-inner animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex gap-4">
                          <div className="w-24 shrink-0">
                             <label className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-wider">Score</label>
                             <div className="relative">
                               <input 
                                 type="number" 
                                 placeholder="0-100"
                                 className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 transition-all font-mono"
                                 value={gradeInput}
                                 onChange={(e) => setGradeInput(e.target.value)}
                                 autoFocus
                               />
                             </div>
                          </div>
                          <div className="flex-1">
                             <label className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-wider">Feedback</label>
                             <input 
                               type="text" 
                               placeholder="Excellent work on..."
                               className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm outline-none focus:border-orange-700 focus:ring-1 focus:ring-orange-700 transition-all"
                               value={feedbackInput}
                               onChange={(e) => setFeedbackInput(e.target.value)}
                             />
                          </div>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <button 
                              onClick={() => handleSave(item._id)} 
                              disabled={saving} 
                              className="flex-1 bg-stone-900 text-stone-50 text-xs py-2.5 rounded-md hover:bg-orange-700 flex justify-center items-center gap-2 font-bold uppercase tracking-wide transition-colors disabled:opacity-70 shadow-sm"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Result
                          </button>
                          <button 
                              onClick={() => setEditingId(null)} 
                              className="px-4 text-xs bg-white border border-stone-300 rounded-md hover:bg-stone-50 text-stone-600 transition-colors font-bold uppercase tracking-wide"
                          >
                              Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex lg:flex-col justify-between lg:justify-center items-center lg:items-end gap-4 h-full">
                        {item.grade !== undefined ? (
                          <div className="text-right w-full">
                            <div className="mb-3 flex lg:justify-end items-center gap-2">
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Grade Awarded</span>
                                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md text-sm font-bold border border-emerald-100 font-mono">
                                    <CheckCircle size={14}/> {item.grade}/100
                                </span>
                            </div>
                            
                            {item.feedback && (
                                <p className="text-sm text-stone-500 italic bg-stone-50 p-3 rounded-md border border-stone-100 mb-3 text-left lg:text-right">
                                    "{item.feedback}"
                                </p>
                            )}

                            <button 
                                onClick={() => startEditing(item)} 
                                className="text-xs font-bold text-stone-400 hover:text-orange-700 uppercase tracking-widest transition-colors flex items-center gap-1 ml-auto"
                            >
                              <PenTool size={12} /> Edit Grade
                            </button>
                          </div>
                        ) : (
                          <button 
                              onClick={() => startEditing(item)} 
                              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 px-6 py-3 rounded-md text-sm font-bold hover:bg-stone-50 hover:border-orange-300 hover:text-orange-700 transition-all shadow-sm group/btn"
                          >
                            <Clock size={16} className="text-orange-500 group-hover/btn:text-orange-700"/> 
                            <span className="uppercase tracking-wide text-xs">Grade Submission</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}