"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ExportProgressProps {
  progress: number; // 0–100
  status: "preparing" | "bundling" | "complete";
}

const statusLabel: Record<ExportProgressProps["status"], string> = {
  preparing: "Preparing files…",
  bundling: "Bundling documentation…",
  complete: "Export complete!",
};

export default function ExportProgress({ progress, status }: ExportProgressProps) {
  const isComplete = status === "complete";

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400 font-medium">{statusLabel[status]}</span>
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 text-emerald-400 font-semibold"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </motion.span>
          ) : (
            <motion.span
              key="pct"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-zinc-500 font-mono"
            >
              {Math.round(progress)}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
