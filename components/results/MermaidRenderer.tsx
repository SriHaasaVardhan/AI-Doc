"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import CopyButton from "@/components/results/CopyButton";

interface MermaidRendererProps {
  code: string;
  title?: string;
}

export default function MermaidRenderer({ code, title }: MermaidRendererProps) {
  const mermaidLiveUrl = useMemo(() => {
    try {
      const state = {
        code: code.trim(),
        mermaid: { theme: "dark" },
        autoSync: true,
        updateDiagram: true,
      };
      const json = JSON.stringify(state);
      const encoded = btoa(json);
      return `https://mermaid.live/edit#base64:${encoded}`;
    } catch {
      return "https://mermaid.live";
    }
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className="text-sm font-medium text-zinc-300">
            {title || "Mermaid Diagram"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CopyButton text={code} className="!py-1.5 !px-2.5 text-xs" />
          <a
            href={mermaidLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            Open in Editor
          </a>
        </div>
      </div>

      {/* Code Block */}
      <div className="p-4 bg-black/30 overflow-x-auto">
        <pre className="font-mono text-sm text-zinc-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </motion.div>
  );
}
