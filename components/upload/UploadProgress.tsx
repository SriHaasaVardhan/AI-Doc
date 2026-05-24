"use client";

import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

interface UploadProgressProps {
  progress: number;
  step: string;
  status: "uploading" | "processing" | "complete" | "error";
}

export function UploadProgress({ progress, step, status }: UploadProgressProps) {
  const isError = status === "error";
  const isComplete = status === "complete";
  
  const colorClass = isError 
    ? "from-red-500 to-red-600" 
    : isComplete 
      ? "from-green-500 to-green-600" 
      : "from-blue-500 to-purple-600";

  return (
    <GlassCard className="w-full p-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-zinc-300">{step}</span>
          {isError && <span className="text-xs text-red-400 mt-1">An error occurred during processing</span>}
        </div>
        <span className="text-xl font-bold font-mono text-white">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden relative">
        <motion.div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        {/* Shimmer effect when processing */}
        {status === "processing" && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        )}
      </div>
    </GlassCard>
  );
}
