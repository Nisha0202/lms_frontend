// components/ConfirmToast.tsx
"use client";

import { useState, useEffect } from "react";

let resolver: (value: boolean) => void;

// 1. Helper function to trigger the toast
export function confirmToast(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    resolver = resolve;
    // Dispatch event to window
    const evt = new CustomEvent("show-confirm-toast", { detail: { message } });
    if (typeof window !== "undefined") {
      window.dispatchEvent(evt);
    }
  });
}

// 2. The Component (Must be placed in RootLayout or AdminLayout)
export default function ConfirmToast() {
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState("");

  // FIX: Use useEffect to attach listener ONCE
  useEffect(() => {
    const handleEvent = (e: any) => {
      setMsg(e.detail.message);
      setVisible(true);
    };

    window.addEventListener("show-confirm-toast", handleEvent);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("show-confirm-toast", handleEvent);
    };
  }, []);

  const close = () => setVisible(false);

  const handleYes = () => {
    if (resolver) resolver(true);
    close();
  };

  const handleNo = () => {
    if (resolver) resolver(false);
    close();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-zinc-200 scale-100 animate-in zoom-in-95 duration-200">
        <h3 className="text-base font-semibold text-zinc-900 whitespace-pre-line text-center">
          {msg}
        </h3>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={handleNo}
            className="px-5 py-2 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleYes}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}