"use client";

import React, { useCallback } from "react";
import { motion } from "framer-motion";

interface DownloadAllButtonProps {
  docs: Record<string, string>; // key=filename, value=content
}

export default function DownloadAllButton({ docs }: DownloadAllButtonProps) {
  const handleDownloadAll = useCallback(() => {
    Object.entries(docs).forEach(([filename, content], i) => {
      setTimeout(() => {
        const blob = new Blob([content], {
          type: "text/markdown;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, i * 300); // Stagger downloads to avoid browser blocking
    });
  }, [docs]);

  const fileCount = Object.keys(docs).filter(
    (k) => docs[k] && docs[k].trim() !== ""
  ).length;

  return (
    <motion.button
      onClick={handleDownloadAll}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      disabled={fileCount === 0}
      className="relative overflow-hidden px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent-blue/30 via-accent-purple/30 to-accent-cyan/30 blur-xl" />

      <span className="relative z-10 flex items-center gap-2">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
        Download All ({fileCount} files)
      </span>
    </motion.button>
  );
}
