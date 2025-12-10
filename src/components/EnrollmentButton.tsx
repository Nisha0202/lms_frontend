'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Users, Loader2, AlertCircle, Edit, ShieldCheck, CreditCard } from "lucide-react";
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

  // 1. ADMIN VIEW (Unchanged)
  if (isAuthenticated && user?.role === 'admin') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-zinc-100 rounded-lg border border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold mb-2">
            <ShieldCheck size={18} />
            <span>Admin Controls</span>
          </div>
          <Link 
            href={`/admin/create-course?edit=${courseId}`}
            className="flex text-md items-center justify-center gap-2 w-full bg-white border-2 border-zinc-900 text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-50 transition"
          >
            <Edit size={18} /> Edit Course
          </Link>
        </div>
      </div>
    );
  }

  // 2. STUDENT VIEW: Payment Logic
  const handlePayment = async () => {
    setError("");

    if (!isAuthenticated) {
      router.push(`/signin?redirect=/courses/${courseId}`);
      return;
    }

    if (!selectedBatch) {
      setError("Please select a batch to continue.");
      return;
    }

    setLoading(true);
    try {
      // <PaymentResponse>  to tell TS what to expect
      const res = await api.post<PaymentResponse>("/payment/create-checkout-session", {
        courseId,
        batchId: selectedBatch
      });

      // Now TS knows 'res.data' has a 'url' property
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError("Failed to initialize payment.");
        setLoading(false); // Only stop loading if we didn't redirect
      }

    } catch (err: any) {
      setLoading(false); // Stop loading on error
      if (err.response?.status === 400 && err.response?.data?.message?.includes("Already enrolled")) {
         
      } else {
         setError(err.response?.data?.message || "Payment initialization failed");
      }
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
              className={`cursor-pointer border rounded-lg p-3 text-sm transition-all ${
                selectedBatch === batch._id
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
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-start gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-zinc-900 text-white font-bold text-lg py-3 rounded-xl hover:bg-zinc-800 transition active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> Processing...
          </>
        ) : (
          <>
            <CreditCard size={20} /> Enroll for ৳{price}
          </>
        )}
      </button>
      
      <p className="text-xs text-center text-zinc-400">
        Secure payment powered by Stripe
      </p>
    </div>
  );
}