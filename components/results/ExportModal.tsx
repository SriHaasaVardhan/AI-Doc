"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "../ui/AnimatedButton";
import { GlassCard } from "../ui/GlassCard";
import { downloadMarkdown, formatDocFilename } from "@/lib/utils/export-utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  docs: Record<string, string>;
  repoName: string;
}

export function ExportModal({ isOpen, onClose, docs, repoName }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const formattedDocs: Record<string, string> = {};
      for (const [key, content] of Object.entries(docs)) {
        if (content) formattedDocs[formatDocFilename(key)] = content;
      }

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docs: formattedDocs, repoName, format: 'zip' })
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `docugen-${repoName.replace(/[^a-zA-Z0-9_-]/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export ZIP");
    } finally {
      setExporting(false);
      onClose();
    }
  };

  const handleExportSingle = (key: string, content: string) => {
    if (content) {
      downloadMarkdown(content, formatDocFilename(key));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-lg"
        >
          <GlassCard strong className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Export Documentation</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Export Full Bundle</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Download all generated documentation files in a single ZIP archive.
                </p>
                <AnimatedButton 
                  onClick={handleExportZip} 
                  loading={exporting} 
                  className="w-full"
                >
                  Download ZIP Bundle
                </AnimatedButton>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Individual Files</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(docs).filter(([_, content]) => !!content).map(([key, content]) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-sm text-zinc-300 font-mono">{formatDocFilename(key)}</span>
                      <button 
                        onClick={() => handleExportSingle(key, content)}
                        className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
