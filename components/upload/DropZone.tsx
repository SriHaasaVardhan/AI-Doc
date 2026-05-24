"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileSelect, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        alert("Please upload a .zip file");
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect]);

  return (
    <GlassCard 
      glow={isDragOver ? "blue" : "none"} 
      className={`relative w-full overflow-hidden transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="file"
        accept=".zip"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          animate={isDragOver ? { y: -10, scale: 1.1 } : { y: 0, scale: 1 }}
          className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl mb-4"
        >
          {selectedFile ? "📦" : "📂"}
        </motion.div>
        
        {selectedFile ? (
          <>
            <h3 className="text-xl font-semibold text-white mb-2">{selectedFile.name}</h3>
            <p className="text-sm text-zinc-400">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
            </p>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-white mb-2">Upload Repository</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Drag and drop your .zip file here, or click to browse.
            </p>
            <div className="text-xs text-zinc-500 font-mono">
              Max size: 50MB
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
