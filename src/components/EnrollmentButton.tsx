'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function EnrollmentButton({ courseId, batches }: { courseId: string, batches: any[] }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleEnroll = async () => {
    setError("");

   

    // 1. Validation
    if (!isAuthenticated) {
      router.push("/signin?redirect=/courses/${courseId}");
      return;
    }

 // hide it for Admins
    if (isAuthenticated && user?.role === 'admin') {
     
        setError("You are an Admin. (Enrollment disabled)");
       return;
    }

    if (!selectedBatch) {
      setError("Please select a batch to continue.");
      return;
    }

    // 2. API Call
    setLoading(true);
    try {
      await api.post("/enrollments/enroll", {
        courseId,
        batchId: selectedBatch
      });
      // 3. Success Redirect
      router.push("/student/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!batches || batches.length === 0) {
    return (
      <div className="p-4 bg-zinc-100 rounded-lg text-center text-sm text-zinc-500">
        No batches available for enrollment at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Batch Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900">Choose a Batch</label>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {batches.map((batch) => (
            <div
              key={batch._id}
              onClick={() => setSelectedBatch(batch._id)}
              className={`cursor-pointer border rounded-lg p-3 text-sm transition-all ${selectedBatch === batch._id
                  ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900"
                  : "border-zinc-200 hover:border-zinc-400"
                }`}
            >
              <div className="flex justify-between font-medium text-zinc-900">
                <span>{batch.name}</span>
                <span className="flex items-center gap-1 text-xs bg-zinc-100 px-2 rounded-full">
                  <Users size={10} /> {batch.seatLimit} seats
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-500">
                <Calendar size={12} />
                {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full bg-zinc-900 text-white font-bold text-lg py-3 rounded-xl hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Processing...
          </>
        ) : (
          "Enroll Now"
        )}
      </button>
    </div>
  );
}