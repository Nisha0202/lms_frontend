"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

// Types
type ToastType = "success" | "error";

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  // Logic to show toast
  const showToast = useCallback((msg: string, type: ToastType) => {
    setMessage(msg);
    setType(type);
    setIsVisible(true);

    // Auto hide after 3 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  }, []);

  const success = (msg: string) => showToast(msg, "success");
  const error = (msg: string) => showToast(msg, "error");

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      
      {/* --- THE TOAST UI COMPONENT --- */}
      {isVisible && (
        <div className="fixed  inset-auto bottom-6 right-6right-6 z-100 animate-in slide-in-from-right-5 fade-in duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
              type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {type === "success" ? (
              <CheckCircle size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            
            <span className="text-sm font-medium">{message}</span>
            
            <button onClick={() => setIsVisible(false)} className="ml-2 opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Custom Hook to use it easily
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}