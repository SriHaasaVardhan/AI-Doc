"use client";

import { motion, AnimatePresence } from "framer-motion";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const colors = {
    success: "border-l-green-500 text-green-400",
    error: "border-l-red-500 text-red-400",
    info: "border-l-blue-500 text-blue-400",
    warning: "border-l-yellow-500 text-yellow-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`glass min-w-[300px] p-4 flex items-center justify-between border-l-4 ${colors[toast.type]}`}
    >
      <span className="text-sm text-zinc-200">{toast.message}</span>
      <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300 ml-4">
        ✕
      </button>
    </motion.div>
  );
}
