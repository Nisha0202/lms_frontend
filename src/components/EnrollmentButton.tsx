'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, Users, Loader2, AlertCircle, 
  Edit, ShieldCheck, CreditCard, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

// 1. Define the expected response shape
interface PaymentResponse {
  url: string;
}

export default function EnrollmentButton({ courseId, batches, price }: { courseId: string, batches: any[], price: number }) {
  const [selectedBatch, setSelectedBatch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ================= 1. ADMIN VIEW =================
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="space-y-4">
        <div className="p-5 bg-stone-100 rounded-xl border border-stone-200">
          <div className="flex items-center gap-2 text-stone-900 font-bold mb-3">
            <ShieldCheck size={20} className="text-stone-500" />
            <span>Instructor Controls</span>
          </div>
          <Link 
            href={`/admin/courses/edit/${courseId}`}
            className="flex text-md items-center justify-center gap-2 w-full bg-white border border-stone-300 text-stone-700 font-bold py-3 rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-all shadow-sm"
          >
            <Edit size={18} /> Edit Course Content
          </Link>
        </div>
      </div>
    );
  }

  // ================= 2. STUDENT VIEW: Payment Logic =================
  const handlePayment = async () => {
    setError("");

    if (!isAuthenticated) {
      // Encode the redirect URL to handle query params correctly
      router.push(`/signin?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }

    if (!selectedBatch) {
      setError("Please select a starting batch to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<PaymentResponse>("/payment/create-checkout-session", {
        courseId,
        batchId: selectedBatch
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError("Failed to initialize payment gateway.");
        setLoading(false);
      }

    } catch (err: any) {
      setLoading(false);
      if (err.response?.status === 400 && err.response?.data?.message?.includes("Already enrolled")) {
         setError("You are already enrolled in this course.");
      } else {
         setError(err.response?.data?.message || "Payment initialization failed. Please try again.");
      }
    }
  };

  // --- No Batches Available State ---
  if (!batches || batches.length === 0) {
    return (
      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 border-dashed text-center">
        <p className="text-stone-500 font-medium">Enrollment is currently closed.</p>
        <p className="text-xs text-stone-400 mt-1">Please check back later for new batches.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Batch Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Select Your Schedule
        </label>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {batches.map((batch) => {
             const isSelected = selectedBatch === batch._id;

             return (
                <div
                  key={batch._id}
                  onClick={() => setSelectedBatch(batch._id)}
                  className={`relative cursor-pointer border rounded-lg p-4 transition-all duration-200 group ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                      : "border-stone-200 bg-white hover:border-orange-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-bold text-sm ${isSelected ? "text-orange-900" : "text-stone-900"}`}>
                        {batch.name}
                    </span>
                    {isSelected && <CheckCircle2 size={18} className="text-orange-600" />}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1.5 ${isSelected ? "text-orange-800" : "text-stone-500"}`}>
                      <Calendar size={14} />
                      <span>
                        {new Date(batch.startDate).toLocaleDateString()} — {new Date(batch.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-500"
                    }`}>
                      <Users size={12} /> {batch.seatLimit} seats
                    </span>
                  </div>
                </div>
             );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> 
          <span>{error}</span>
        </div>
      )}

      {/* Main Action Button */}
      <div className="pt-2">
        <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-orange-700 text-white font-bold text-lg py-4 rounded-xl hover:bg-orange-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-900/20 flex justify-center items-center gap-2 group"
        >
            {loading ? (
            <>
                <Loader2 className="animate-spin" size={20} /> Processing...
            </>
            ) : (
            <>
                Enroll Now 
               
                <CreditCard size={20} className="ml-1 opacity-80" /> 
            </>
            )}
        </button>
        
        <div className="flex justify-center items-center gap-2 mt-3 text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
            <ShieldCheck size={12} />
            Secure SSL Payment
        </div>
      </div>
    </div>
  );
}