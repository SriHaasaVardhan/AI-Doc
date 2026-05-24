"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";

interface DownloadButtonProps {
  content: string;
  filename: string;
  className?: string;
}

export default function DownloadButton({
  content,
  filename,
  className = "",
}: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, filename]);

  return (
    <motion.button
      onClick={handleDownload}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`glass px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] ${className}`}
      title={`Download ${filename}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      Download
    </motion.button>
  );
}
