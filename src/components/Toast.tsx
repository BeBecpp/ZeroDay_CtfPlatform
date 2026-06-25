"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: "border-arena-neon text-arena-neon bg-arena-neon/10",
    error: "border-arena-danger text-arena-danger bg-arena-danger/10",
    info: "border-arena-cyan text-arena-cyan bg-arena-cyan/10",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 border font-mono text-sm shadow-lg ${colors[type]}`}
      role="status"
    >
      {message}
    </div>
  );
}
