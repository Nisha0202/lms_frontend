"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Save, Loader2, FileText, CheckCircle, Clock, ClipboardList, ExternalLink } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

// --- Types ---
interface GradingItem {
  _id: string; // Assignment ID or QuizResult ID
  student: { name: string; email: string };
  lesson: { title: string };
  grade?: number; // Unified field (mapped from 'score' for quizzes)
  feedback?: string;
  type: 'assignment' | 'quiz'; 
  driveLink?: string; // Only for assignments
}

export default function AdminGradingPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes'>('assignments');
  const [items, setItems] = useState<GradingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let fetchedData: GradingItem[] = [];

        if (activeTab === 'assignments') {
          // 1. Get Assignments
          // We add <GradingItem[]> to tell TS what the response looks like
          const res = await api.get<GradingItem[]>("/assessments/admin/submissions");
          
          // Tag them as 'assignment'
          fetchedData = res.data.map(item => ({ ...item, type: 'assignment' }));
        
        } else {
          // 2. Get Quizzes
          // We use <any[]> here because backend returns 'score', not 'grade'
          const res = await api.get<any[]>("/assessments/admin/quizzes");
          
          // Map 'score' to 'grade' so the UI can use one standard field
          fetchedData = res.data.map((q) => ({
            _id: q._id,
            student: q.student,
            lesson: q.lesson,
            grade: q.score, 
            feedback: q.feedback,
            type: 'quiz'
          }));
        }

        setItems(fetchedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // --- Save Handler ---
const handleSave = async (id: string) => {
  if (!gradeInput) return toast.error("Enter a score");
  setSaving(true);

  try {
    let endpoint = "";
    let payload: any = { feedback: feedbackInput };

    if (activeTab === "assignments") {
      // Assignment grading
      endpoint = `/assessments/grade-assignment/${id}`;
      payload.grade = Number(gradeInput);

    } else {
      // Quiz grading
      endpoint = `/assessments/record-quiz-score/${id}`;
      payload.score = Number(gradeInput);
      payload.resultId = id;
    }

    await api.post(endpoint, payload);

    // Update UI
    setItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, grade: Number(gradeInput), feedback: feedbackInput } : item
      )
    );

    setEditingId(null);
    toast.success("Graded successfully");

  } catch (err) {
    toast.error("Failed to save");
  } finally {
    setSaving(false);
  }
};

  // Start Editing
  const startEditing = (item: GradingItem) => {
    setEditingId(item._id);
    setGradeInput(item.grade?.toString() || "");
    setFeedbackInput(item.feedback || "");
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900">Assessment Center</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-200 p-1 rounded-xl w-fit mb-6">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'assignments' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Assignment Inbox
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'quizzes' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Quiz Inbox
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-400" /></div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 bg-white rounded-xl border border-zinc-200">
              No pending {activeTab}.
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-900">{item.student?.name}</span>
                    <span className="text-xs text-zinc-400">• {item.student?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                    {activeTab === 'assignments' ? <FileText size={16}/> : <ClipboardList size={16}/>}
                    <span className="font-medium">{item.lesson?.title}</span>
                  </div>
                  {activeTab === 'assignments' && item.driveLink && (
                    <a href={item.driveLink} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      <ExternalLink size={12}/> View Assignment
                    </a>
                  )}
                </div>

                {/* Grading Area */}
                <div className="w-full md:w-auto md:min-w-[300px]">
                  {editingId === item._id ? (
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-2 animate-in fade-in">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Score"
                          className="w-20 px-2 py-1 border rounded text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                          value={gradeInput}
                          onChange={(e) => setGradeInput(e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Feedback (Optional)"
                          className="flex-1 px-2 py-1 border rounded text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(item._id)} disabled={saving} className="flex-1 bg-zinc-900 text-white text-xs py-1.5 rounded hover:bg-zinc-800 flex justify-center items-center gap-1 font-medium transition-colors">
                          {saving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 text-xs bg-white border border-zinc-300 rounded hover:bg-zinc-50 text-zinc-600 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end items-center gap-4 h-full">
                      {item.grade !== undefined ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                            <CheckCircle size={12}/> {item.grade}/100
                          </span>
                          <button onClick={() => startEditing(item)} className="block text-[10px] text-zinc-400 hover:text-zinc-900 hover:underline mt-1.5 ml-auto">Edit Grade</button>
                        </div>
                      ) : (
                        <button onClick={() => startEditing(item)} className="flex items-center gap-2 bg-white border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-all shadow-sm">
                          <Clock size={16} className="text-yellow-500"/> Grade
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