"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FaCircleCheck } from "react-icons/fa6";

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Pill */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 bg-primary text-black font-bold px-5 py-3 rounded-full shadow-primary-glow flex items-center gap-2.5 text-xs pointer-events-none ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <FaCircleCheck className="text-sm shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
