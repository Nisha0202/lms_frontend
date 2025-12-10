"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, CheckCircle } from "lucide-react"; // Optional: Add icons for better UI

interface VerifyResponse {
  message: string;
  success: boolean;
}

export default function PaymentSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verify = async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");

      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        // 1. Verify with Backend
        await api.post<VerifyResponse>("/payment/verify-session", { sessionId });
        
        // 2. Set Success State (Shows the UI)
        setStatus("success");

        // 3. Wait 3 seconds so user sees the message
        setTimeout(() => {
          // 4. FORCE REFRESH to Dashboard
          // Using window.location.href clears the Next.js cache 
          // so the dashboard fetches the new course immediately.
          window.location.href = "/student/dashboard"; // Change this to your actual dashboard path
        }, 3000);

      } catch (err: any) {
        console.error("Verify error:", err);
        setStatus("error");
      }
    };

    // Run verification immediately
    verify();
  }, []);

  // --- UI RENDER ---

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-zinc-500" size={48} />
        <p className="text-zinc-600 font-medium">Finalizing your enrollment...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="text-green-600" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Payment Successful!</h1>
        <p className="text-zinc-500">Redirecting you to your courses...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-red-500 font-bold">Something went wrong verifying your payment.</p>
      <p className="text-sm text-zinc-500">Please contact support with your Session ID.</p>
    </div>
  );
}
